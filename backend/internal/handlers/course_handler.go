package handlers

import (
	"fmt"
	"log/slog"
	"strconv"
	"time"

	"github.com/QwaQ-dev/bala/internal/services"
	"github.com/QwaQ-dev/bala/internal/structures"
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
	title := c.FormValue("title")
	description := c.FormValue("description")
	costStr := c.FormValue("cost")

	if title == "" || description == "" || costStr == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "missing required fields"})
	}

	cost, err := strconv.Atoi(costStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "cost must be an integer"})
	}

	file, err := c.FormFile("img")
	var imgPath string
	if err == nil && file != nil {
		filename := fmt.Sprintf("%d_%s", time.Now().UnixNano(), file.Filename)
		savePath := "./uploads/photos/" + filename
		if err := c.SaveFile(file, savePath); err != nil {
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
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to create course"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"message": "course created"})
}

func (h *CourseHandler) GetCourseByID(c *fiber.Ctx) error {
	course_id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid course ID"})
	}

	user_id, _ := c.Locals("userId").(int)

	course, err := h.courseService.GetCourseByID(course_id, user_id)
	if err != nil {
		switch err.Error() {
		case "This user has no access for course":
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "User has no access for course"})
		default:
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Course is not found"})
		}
	}

	return c.JSON(course)
}

func (h *CourseHandler) UpdateCourse(c *fiber.Ctx) error {
	user_id, _ := c.Locals("userId").(int)

	idStr := c.FormValue("id")
	if idStr == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "id is required"})
	}
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid id"})
	}

	title := c.FormValue("title")
	description := c.FormValue("description")
	costStr := c.FormValue("cost")
	if title == "" || description == "" || costStr == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "missing required fields"})
	}
	cost, err := strconv.Atoi(costStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "cost must be an integer"})
	}

	file, err := c.FormFile("img")
	var imgPath string
	if err == nil && file != nil {
		filename := fmt.Sprintf("%d_%s", time.Now().UnixNano(), file.Filename)
		savePath := "./uploads/photos/" + filename
		if err := c.SaveFile(file, savePath); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to save photo"})
		}
		imgPath = "/uploads/photos/" + filename
	} else {
		existingCourse, err := h.courseService.GetCourseByID(id, user_id)
		if err != nil {
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
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to update course"})
	}

	return c.JSON(fiber.Map{"message": "course updated"})
}

func (h *CourseHandler) DeleteCourse(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid course ID"})
	}

	if err := h.courseService.DeleteCourse(id); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to delete course"})
	}

	return c.JSON(fiber.Map{"message": "course deleted"})
}

func (h *CourseHandler) UploadVideo(c *fiber.Ctx) error {
	courseID, err := strconv.Atoi(c.FormValue("course_id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid course_id"})
	}

	file, err := c.FormFile("video")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid video file"})
	}

	savePath := "./uploads/videos/" + file.Filename
	if err := c.SaveFile(file, savePath); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to save video"})
	}

	relativePath := "/uploads/videos/" + file.Filename
	if err := h.courseService.AddVideoToCourse(courseID, relativePath); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to save path to DB"})
	}

	return c.JSON(fiber.Map{"message": "video uploaded", "path": relativePath})
}

func (h *CourseHandler) GetAllCourses(c *fiber.Ctx) error {
	const op = "handlers.checklist_handler.GetAllChecklists"
	log := h.log.With("op", op)

	courses, err := h.courseService.GetAllCourses()
	if err != nil {
		log.Error("failed to fetch courses", slog.Any("err", err))
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch courses"})
	}

	return c.Status(fiber.StatusOK).JSON(courses)
}
