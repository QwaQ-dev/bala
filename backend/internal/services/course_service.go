package services

import (
	"fmt"
	"log/slog"

	"github.com/QwaQ-dev/bala/internal/config"
	"github.com/QwaQ-dev/bala/internal/repository/postgres"
	"github.com/QwaQ-dev/bala/internal/structures"
)

type CourseService struct {
	repo *postgres.CourseRepo
	log  *slog.Logger
	cfg  *config.Config
}

func NewCourseService(repo *postgres.CourseRepo, log *slog.Logger, cfg *config.Config) *CourseService {
	return &CourseService{
		repo: repo,
		log:  log,
		cfg:  cfg,
	}
}

func (s *CourseService) CreateCourse(course structures.Course) error {
	const op = "service.course_service.CreateCourse"
	s.log.Info("Creating course", slog.String("title", course.Title))

	err := s.repo.InsertCourse(course)
	if err != nil {
		s.log.Error("failed to create course", slog.String("op", op), slog.Any("err", err))
		return fmt.Errorf("%s: %w", op, err)
	}

	s.log.Info("Course created", slog.String("title", course.Title))
	return nil
}

func (s *CourseService) GetCourseByID(id int) (structures.Course, error) {
	const op = "service.course_service.GetCourseByID"
	course, err := s.repo.SelectCourseById(id)
	if err != nil {
		s.log.Error("failed to get course by id", slog.String("op", op), slog.Int("id", id), slog.Any("err", err))
		return course, fmt.Errorf("%s: %w", op, err)
	}
	return course, nil
}

func (s *CourseService) UpdateCourse(course *structures.Course) error {
	const op = "service.course_service.UpdateCourse"
	err := s.repo.UpdateCourse(course)
	if err != nil {
		s.log.Error("failed to update course", slog.String("op", op), slog.Any("err", err))
		return fmt.Errorf("%s: %w", op, err)
	}
	return nil
}

func (s *CourseService) DeleteCourse(id int) error {
	const op = "service.course_service.DeleteCourse"
	err := s.repo.DeleteCourse(id)
	if err != nil {
		s.log.Error("failed to delete course", slog.String("op", op), slog.Int("id", id), slog.Any("err", err))
		return fmt.Errorf("%s: %w", op, err)
	}
	return nil
}

func (s *CourseService) AddVideoToCourse(courseID int, path string) error {
	const op = "service.course_service.AddVideoToCourse"

	s.log.Info("adding video to course", slog.Int("course_id", courseID), slog.String("path", path))

	err := s.repo.AddVideoToCourse(courseID, path)
	if err != nil {
		s.log.Error("failed to add video to course", slog.String("op", op), slog.Any("err", err))
		return fmt.Errorf("%s: %w", op, err)
	}

	return nil
}
