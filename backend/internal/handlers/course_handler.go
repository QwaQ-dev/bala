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

var uploadBaseDir string

func init() {
	uploadBaseDir = os.Getenv("UPLOAD_DIR")
	if uploadBaseDir == "" {
		uploadBaseDir = "./uploads" // fallback для локальной разработки
	}
}

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

func ensureDir(path string, log *slog.Logger) error {
	if err := os.MkdirAll(path, os.ModePerm); err != nil {
		log.Error("failed to create dir", sl.Err(err))
		return err
	}
	return nil
}

func (h *CourseHandler) CreateCourse(c *fiber.Ctx) error {
	const op = "handlers.course_handler.CreateCourse"
	log := h.log.With("op", op)

	title := c.FormValue("title")
	description := c.FormValue("description")
	costStr := c.FormValue("cost")
	diplomaX, _ := strconv.Atoi(c.FormValue("diploma_x"))
	diplomaY, _ := strconv.Atoi(c.FormValue("diploma_y"))

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
		dir := filepath.Join(uploadBaseDir, "photos")
		if err := ensureDir(dir, log); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to create uploads dir"})
		}
		filename := fmt.Sprintf("%d_%s", time.Now().UnixNano(), file.Filename)
		savePath := filepath.Join(dir, filename)
		if err := c.SaveFile(file, savePath); err != nil {
			log.Error("failed to save photo", sl.Err(err))
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to save photo"})
		}
		imgPath = "/uploads/photos/" + filename
	}

	// Handle diploma upload
	diplomaPath := ""
	if diploma, err := c.FormFile("diploma"); err == nil && diploma != nil {
		dir := filepath.Join(uploadBaseDir, "diplomas")
		if err := ensureDir(dir, log); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to create diplomas dir"})
		}
		filename := fmt.Sprintf("%s_%s", time.Now().Format("20060102150405"), diploma.Filename)
		savePath := filepath.Join(dir, filename)
		if err := c.SaveFile(diploma, savePath); err != nil {
			log.Error("failed to save diploma", sl.Err(err))
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to save diploma"})
		}
		diplomaPath = "/uploads/diplomas/" + filename
	}

	webinarLink := c.FormValue("webinar_link")
	webinarDateStr := c.FormValue("webinar_date")

	date, err := time.Parse(time.RFC3339, webinarDateStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": fmt.Sprintf("invalid webinar_date: %v", err),
		})
	}

	webinar := structures.Webinar{
		Link: webinarLink,
		Date: date.UTC(),
	}

	course := structures.Course{
		Title:       title,
		Description: description,
		Cost:        cost,
		Img:         imgPath,
		DiplomaPath: diplomaPath,
		Diploma_x:   diplomaX,
		Diploma_y:   diplomaY,
		Webinars:    webinar,
	}

	courseID, err := h.courseService.CreateCourse(course)
	if err != nil {
		log.Error("failed to create course", sl.Err(err))
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to create course"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"course_id": courseID})
}

func (h *CourseHandler) UploadVideos(c *fiber.Ctx) error {
	const op = "handlers.course_handler.UploadVideos"
	log := h.log.With("op", op)

	log.Info("UPLOADING VIDEOS")

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

	videos := form.File["video[]"]
	titles := form.Value["title[]"]
	extraFiles := form.File["extra_file[]"]

	if len(videos) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "no videos uploaded"})
	}
	if len(videos) != len(titles) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "mismatched number of videos and titles"})
	}

	videoDir := filepath.Join(uploadBaseDir, "videos")
	if err := ensureDir(videoDir, log); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to create videos dir"})
	}

	fileUploadDir := filepath.Join(uploadBaseDir, "files")
	if err := ensureDir(fileUploadDir, log); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to create files dir"})
	}

	var uploadedPaths []string
	for i, file := range videos {
		videoFilename := fmt.Sprintf("%d_%s", time.Now().UnixNano(), file.Filename)
		videoSavePath := filepath.Join(videoDir, videoFilename)
		if err := c.SaveFile(file, videoSavePath); err != nil {
			log.Error("failed to save video", sl.Err(err))
			continue
		}
		videoRelativePath := "/uploads/videos/" + videoFilename

		log.Info("video path", videoRelativePath)

		var filePath string
		if i < len(extraFiles) && extraFiles[i] != nil && extraFiles[i].Size > 0 {
			extraFile := extraFiles[i]
			allowedTypes := []string{"application/pdf", "image/jpeg", "image/png", "application/zip"}
			if !contains(allowedTypes, extraFile.Header.Get("Content-Type")) {
				log.Error("invalid extra file type", slog.Any("type", extraFile.Header.Get("Content-Type")))
				continue
			}
			if extraFile.Size > 100*1024*1024 {
				log.Error("extra file too large", slog.Any("size", extraFile.Size))
				continue
			}

			extraFilename := fmt.Sprintf("%d_%s", time.Now().UnixNano(), extraFile.Filename)
			extraSavePath := filepath.Join(fileUploadDir, extraFilename)
			log.Info("file path", extraSavePath)

			if err := c.SaveFile(extraFile, extraSavePath); err != nil {
				log.Error("failed to save extra file", sl.Err(err))
				filePath = ""
			} else {
				filePath = "/uploads/files/" + extraFilename
			}
		}

		if err := h.courseService.AddVideoToCourse(courseID, videoRelativePath, titles[i], filePath); err != nil {
			log.Error("failed to save path to DB", sl.Err(err))
			continue
		}

		uploadedPaths = append(uploadedPaths, videoRelativePath)
	}

	if len(uploadedPaths) == 0 {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "no files uploaded successfully"})
	}

	return c.JSON(fiber.Map{
		"message": "videos uploaded",
		"paths":   uploadedPaths,
	})
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

// Вспомогательная функция для проверки типа файла
func contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
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
