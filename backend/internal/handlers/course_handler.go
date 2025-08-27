package handlers

import (
	"fmt"
	"log/slog"
	"os"
	"path/filepath"
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

	// Parse form data
	title := c.FormValue("title")
	description := c.FormValue("description")
	costStr := c.FormValue("cost")

	if title == "" || description == "" {
		log.Error("missing required fields")
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "missing required fields"})
	}

	cost := 0
	if costStr != "" {
		var err error
		cost, err = strconv.Atoi(costStr)
		if err != nil {
			log.Error("invalid cost format", sl.Err(err))
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "cost must be an integer"})
		}
	}

	// Handle image upload
	imgPath := ""
	if file, err := c.FormFile("img"); err == nil && file != nil {
		uploadDir := "./uploads/photos"
		if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
			log.Error("failed to create uploads dir", sl.Err(err))
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to create uploads dir"})
		}
		filename := fmt.Sprintf("%d_%s", time.Now().UnixNano(), file.Filename)
		savePath := filepath.Join(uploadDir, filename)
		if err := c.SaveFile(file, savePath); err != nil {
			log.Error("failed to save photo", sl.Err(err))
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to save photo"})
		}
		imgPath = "/uploads/photos/" + filename
	}

	// Handle diploma upload (save directly to diplomas folder)
	diplomaPath := ""
	if diploma, err := c.FormFile("diploma"); err == nil && diploma != nil {
		uploadDir := "./uploads/diplomas"
		if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
			log.Error("failed to create diplomas dir", sl.Err(err))
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to create diplomas dir"})
		}
		filename := fmt.Sprintf("%s_%s", time.Now().Format("20060102150405"), diploma.Filename)
		savePath := filepath.Join(uploadDir, filename)
		if err := c.SaveFile(diploma, savePath); err != nil {
			log.Error("failed to save diploma", sl.Err(err))
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to save diploma"})
		}
		diplomaPath = "/uploads/diplomas/" + filename
	}

	// Parse webinars from form data
	var webinars []structures.Webinar
	form, err := c.MultipartForm()
	if err != nil {
		log.Error("failed to parse multipart form", sl.Err(err))
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid form data"})
	}

	webinarTitles := form.Value["webinar_titles"]
	webinarLinks := form.Value["webinar_links"]
	webinarDates := form.Value["webinar_dates"]

	if len(webinarTitles) > 0 && len(webinarTitles) == len(webinarLinks) && len(webinarLinks) == len(webinarDates) {
		for i := range webinarTitles {
			date, err := time.Parse(time.RFC3339, webinarDates[i])
			if err != nil {
				log.Error("invalid webinar date format", slog.String("date", webinarDates[i]), sl.Err(err))
				continue
			}
			webinars = append(webinars, structures.Webinar{
				Title: webinarTitles[i],
				Link:  webinarLinks[i],
				Date:  date.UTC(),
			})
		}
	}

	// Create course with all data
	course := structures.Course{
		Title:       title,
		Description: description,
		Cost:        cost,
		Img:         imgPath,
		DiplomaPath: diplomaPath,
		Webinars:    webinars,
	}

	courseID, err := h.courseService.CreateCourse(course)
	if err != nil {
		log.Error("failed to create course", sl.Err(err))
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to create course"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"course_id": courseID})
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

	return c.Status(200).JSON(fiber.Map{"course": course})
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
	if title == "" || description == "" {
		log.Error("missing required fields")
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "missing required fields"})
	}
	cost := 0
	if costStr != "" {
		cost, err = strconv.Atoi(costStr)
		if err != nil {
			log.Error("invalid cost format", sl.Err(err))
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "cost must be an integer"})
		}
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

	file, err := c.FormFile("file")
	var filePath string

	if err == nil && file != nil {
		uploadDir := "./uploads/files"
		if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
			log.Error("failed to create files dir", sl.Err(err))
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to create files dir"})
		}
		filename := fmt.Sprintf("%d_%s", time.Now().UnixNano(), file.Filename)
		savePath := uploadDir + "/" + filename
		if err := c.SaveFile(file, savePath); err != nil {
			log.Error("failed to save file", sl.Err(err))
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to file photo"})
		}
		filePath = "/uploads/files/" + filename
	} else {
		filePath = ""
	}

	files := form.File["videos"]
	titles := form.Value["titles"]

	if len(files) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "no files uploaded"})
	}
	if len(files) != len(titles) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "mismatched number of videos and titles"})
	}

	uploadDir := "./uploads/videos"
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		log.Error("failed to create uploads dir", sl.Err(err))
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to create uploads dir"})
	}

	var uploadedPaths []string
	for i, file := range files {
		filename := fmt.Sprintf("%d_%s", time.Now().UnixNano(), file.Filename)
		savePath := uploadDir + "/" + filename

		if err := c.SaveFile(file, savePath); err != nil {
			log.Error("failed to save video", sl.Err(err))
			continue
		}

		relativePath := "/uploads/videos/" + filename
		if err := h.courseService.AddVideoToCourse(courseID, relativePath, titles[i], filePath); err != nil {
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
	const op = "handlers.course_handler.GetAllCourses"
	log := h.log.With("op", op)

	courses, err := h.courseService.GetAllCourses()
	if err != nil {
		log.Error("failed to fetch courses", slog.Any("err", err))
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch courses"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"courses": courses})
}

func (h *CourseHandler) GiveAccess(c *fiber.Ctx) error {
	const op = "handlers.course_handler.GiveAccess"
	log := h.log.With("op", op)

	var req structures.CourseAccessRequest
	if err := c.BodyParser(&req); err != nil {
		log.Error("failed to parse request body", sl.Err(err))
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}

	if err := h.courseService.GiveAccess(req.UserID, req.CourseID); err != nil {
		log.Error("Error with access", sl.Err(err))
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Access has been given"})
}

func (h *CourseHandler) TakeAwayAccess(c *fiber.Ctx) error {
	const op = "handlers.course_handler.TakeAwayAccess"
	log := h.log.With("op", op)

	var req structures.CourseAccessRequest
	if err := c.BodyParser(&req); err != nil {
		log.Error("failed to parse request body", sl.Err(err))
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}

	if err := h.courseService.TakeAwayAccess(req.UserID, req.CourseID); err != nil {
		log.Error("Error with access", sl.Err(err))
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Access has been taken away"})
}

func (h *CourseHandler) GetAllCoursesWithAccess(c *fiber.Ctx) error {
	userID, _ := c.Locals("userId").(int)

	courses, err := h.courseService.GetAllCoursesWithAccess(userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch courses"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"courses": courses})
}
