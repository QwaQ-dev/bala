package handlers

import (
	"fmt"
	"log/slog"
	"os"
	"strconv"
	"time"

	"github.com/QwaQ-dev/bala/internal/services"
	"github.com/QwaQ-dev/bala/internal/structures"
	"github.com/QwaQ-dev/bala/pkg/sl"
	"github.com/gofiber/fiber/v2"
)

type CourseHandler struct {
	courseService *services.CourseService
	log           *slog.Logger
}

func NewCourseHandler(courseService *services.CourseService, log *slog.Logger) *CourseHandler {
	return &CourseHandler{
		courseService: courseService,
		log:           log,
	}
}
func (h *CourseHandler) CreateCourse(c *fiber.Ctx) error {
	const op = "handlers.course_handler.CreateCourse"
	log := h.log.With("op", op)

	title := c.FormValue("title")
	description := c.FormValue("description")
	costStr := c.FormValue("cost")

	if title == "" || description == "" || costStr == "" {
		log.Error("missing required fields")
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "missing required fields"})
	}

	cost, err := strconv.Atoi(costStr)
	if err != nil {
		log.Error("invalid cost format", sl.Err(err))
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "cost must be an integer"})
	}

	file, err := c.FormFile("img")

	var imgPath string

	if err == nil && file != nil {
		uploadDir := "./uploads/photos"
		if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
			log.Error("failed to create uploads dir", sl.Err(err))
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to create uploads dir"})
		}

		filename := fmt.Sprintf("%d_%s", time.Now().UnixNano(), file.Filename)
		savePath := uploadDir + "/" + filename
		if err := c.SaveFile(file, savePath); err != nil {
			log.Error("failed to save photo", sl.Err(err))
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to save photo"})
		}
		imgPath = "/uploads/photos/" + filename
	} else {
		imgPath = ""
	}

	course := structures.Course{
		Title:       title,
		Description: description,
		Cost:        cost,
		Img:         imgPath,
	}

	if err := h.courseService.CreateCourse(course); err != nil {
		log.Error("failed to create course", sl.Err(err))
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to create course"})
	}

	return c.Status(201).JSON(fiber.Map{"message": "course created"})
}

func (h *CourseHandler) GetCourseByID(c *fiber.Ctx) error {
	const op = "handlers.course_handler.GetCourseByID"
	log := h.log.With("op", op)

	course_id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		log.Error("invalid course ID", sl.Err(err))
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid course ID"})
	}

	user_id, _ := c.Locals("userId").(int)

	course, err := h.courseService.GetCourseByID(course_id, user_id)
	if err != nil {
		switch err.Error() {
		case "This user has no access for course":
			log.Warn("user has no access", slog.Int("user_id", user_id), slog.Int("course_id", course_id))
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "User has no access for course"})
		default:
			log.Error("course not found", slog.Int("course_id", course_id), sl.Err(err))
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Course is not found"})
		}
	}

	return c.Status(200).JSON(fiber.Map{
		"course": course,
	})
}

func (h *CourseHandler) UpdateCourse(c *fiber.Ctx) error {
	const op = "handlers.course_handler.UpdateCourse"
	log := h.log.With("op", op)

	user_id, _ := c.Locals("userId").(int)

	idStr := c.FormValue("id")
	if idStr == "" {
		log.Error("id is required")
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "id is required"})
	}
	id, err := strconv.Atoi(idStr)
	if err != nil {
		log.Error("invalid id", sl.Err(err))
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid id"})
	}

	title := c.FormValue("title")
	description := c.FormValue("description")
	costStr := c.FormValue("cost")
	if title == "" || description == "" || costStr == "" {
		log.Error("missing required fields")
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "missing required fields"})
	}
	cost, err := strconv.Atoi(costStr)
	if err != nil {
		log.Error("invalid cost format", sl.Err(err))
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "cost must be an integer"})
	}

	file, err := c.FormFile("img")
	var imgPath string
	if err == nil && file != nil {
		filename := fmt.Sprintf("%d_%s", time.Now().UnixNano(), file.Filename)
		savePath := "./uploads/photos/" + filename
		if err := c.SaveFile(file, savePath); err != nil {
			log.Error("failed to save photo", sl.Err(err))
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to save photo"})
		}
		imgPath = "/uploads/photos/" + filename
	} else {
		existingCourse, err := h.courseService.GetCourseByID(id, user_id)
		if err != nil {
			log.Error("failed to get existing course", sl.Err(err))
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to get existing course"})
		}
		imgPath = existingCourse.Img
	}

	course := structures.Course{
		Id:          id,
		Title:       title,
		Description: description,
		Cost:        cost,
		Img:         imgPath,
	}

	if err := h.courseService.UpdateCourse(&course); err != nil {
		log.Error("failed to update course", sl.Err(err))
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to update course"})
	}

	return c.JSON(fiber.Map{"message": "course updated"})
}

func (h *CourseHandler) DeleteCourse(c *fiber.Ctx) error {
	const op = "handlers.course_handler.DeleteCourse"
	log := h.log.With("op", op)

	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		log.Error("invalid course Id", sl.Err(err))
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid course ID"})
	}

	if err := h.courseService.DeleteCourse(id); err != nil {
		log.Error("Failed to delete course", sl.Err(err))
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to delete course"})
	}

	return c.JSON(fiber.Map{"message": "course deleted"})
}

func (h *CourseHandler) UploadVideos(c *fiber.Ctx) error {
	const op = "handlers.course_handler.UploadVideos"
	log := h.log.With("op", op)

	courseID, err := strconv.Atoi(c.FormValue("course_id"))
	if err != nil {
		log.Error("invalid course_id", sl.Err(err))
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid course_id"})
	}

	form, err := c.MultipartForm()
	if err != nil {
		log.Error("failed to parse multipart form", sl.Err(err))
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid form data"})
	}

	files := form.File["videos"]
	if len(files) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "no files uploaded"})
	}

	uploadDir := "./uploads/videos"
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		log.Error("failed to create uploads dir", sl.Err(err))
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to create uploads dir"})
	}

	var uploadedPaths []string
	for _, file := range files {
		filename := fmt.Sprintf("%d_%s", time.Now().UnixNano(), file.Filename)
		savePath := uploadDir + "/" + filename

		if err := c.SaveFile(file, savePath); err != nil {
			log.Error("failed to save video", sl.Err(err))
			continue
		}

		relativePath := "/uploads/videos/" + filename
		if err := h.courseService.AddVideoToCourse(courseID, relativePath); err != nil {
			log.Error("failed to save path to DB", sl.Err(err))
			continue
		}

		uploadedPaths = append(uploadedPaths, relativePath)
	}

	if len(uploadedPaths) == 0 {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "no files uploaded successfully"})
	}

	return c.JSON(fiber.Map{
		"message": "videos uploaded",
		"paths":   uploadedPaths,
	})
}

func (h *CourseHandler) GetAllCourses(c *fiber.Ctx) error {
	const op = "handlers.checklist_handler.GetAllChecklists"
	log := h.log.With("op", op)

	courses, err := h.courseService.GetAllCourses()
	if err != nil {
		log.Error("failed to fetch courses", slog.Any("err", err))
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch courses"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"courses": courses,
	})
}

func (h *CourseHandler) GiveAccess(c *fiber.Ctx) error {
	const op = "handlers.checklist_handler.GiveAccess"
	log := h.log.With("op", op)

	var req structures.CourseAccessRequest

	if err := c.BodyParser(&req); err != nil {
		log.Error("failed to parse request body", sl.Err(err))
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}
	err := h.courseService.GiveAccess(req.UserID, req.CourseID)
	if err != nil {
		log.Error("Error with access", sl.Err(err))
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"Message": "Access has been given",
	})
}

func (h *CourseHandler) TakeAwayAccess(c *fiber.Ctx) error {
	const op = "handlers.checklist_handler.TakeAwayAccess"
	log := h.log.With("op", op)

	var req structures.CourseAccessRequest

	if err := c.BodyParser(&req); err != nil {
		log.Error("failed to parse request body", sl.Err(err))
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

	err := h.courseService.TakeAwayAccess(req.UserID, req.CourseID)
	if err != nil {
		log.Error("Error with access", sl.Err(err))
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"Message": "Access has been taken away",
	})
}

func (h *CourseHandler) GetAllCoursesWithAccess(c *fiber.Ctx) error {
	userID, _ := c.Locals("userId").(int)

	courses, err := h.courseService.GetAllCoursesWithAccess(userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch courses"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"courses": courses,
	})
}
