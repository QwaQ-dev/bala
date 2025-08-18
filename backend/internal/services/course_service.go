package services

import (
	"fmt"
	"log/slog"

	"github.com/QwaQ-dev/bala/internal/config"
	"github.com/QwaQ-dev/bala/internal/repository/postgres"
	"github.com/QwaQ-dev/bala/internal/structures"
	"github.com/QwaQ-dev/bala/pkg/sl"
)

type CourseService struct {
	repo     *postgres.CourseRepo
	userRepo *postgres.UserRepo
	log      *slog.Logger
	cfg      *config.Config
}

func NewCourseService(repo *postgres.CourseRepo, log *slog.Logger, cfg *config.Config, userRepo *postgres.UserRepo) *CourseService {
	return &CourseService{
		repo:     repo,
		userRepo: userRepo,
		log:      log,
		cfg:      cfg,
	}
}

func (s *CourseService) CreateCourse(course structures.Course) error {
	const op = "service.course_service.CreateCourse"
	log := s.log.With("op", op)
	log.Info("Creating course", slog.String("title", course.Title))

	err := s.repo.InsertCourse(course)
	if err != nil {
		log.Error("failed to create course", slog.String("op", op), slog.Any("err", err))
		return fmt.Errorf("%s: %w", op, err)
	}

	log.Info("Course created", slog.String("title", course.Title))
	return nil
}

func (s *CourseService) GetCourseByID(courseID, userID int) (structures.Course, error) {
	const op = "service.course_service.GetCourseByID"
	log := s.log.With("op", op)

	user, err := s.userRepo.GetUserById(userID)
	if err != nil {
		log.Error("failed to get user by id", slog.Int("user_id", userID), slog.Any("err", err))
		return structures.Course{}, fmt.Errorf("%s: %w", op, err)
	}

	hasAccess := false

	if user.Role == "admin" {
		hasAccess = true
	} else {
		for _, id := range user.CourseIDs {
			if int(id) == courseID {
				hasAccess = true
				break
			}
		}
	}

	if !hasAccess {
		log.Warn("user has no access to course", slog.Int("user_id", userID), slog.Int("course_id", courseID))
		return structures.Course{}, fmt.Errorf("user has no access to this course")
	}

	course, err := s.repo.SelectCourseById(courseID)
	if err != nil {
		log.Error("failed to get course by id", slog.Int("course_id", courseID), slog.Any("err", err))
		return structures.Course{}, fmt.Errorf("%s: %w", op, err)
	}

	return course, nil
}

func (s *CourseService) UpdateCourse(course *structures.Course) error {
	const op = "service.course_service.UpdateCourse"
	log := s.log.With("op", op)

	err := s.repo.UpdateCourse(course)
	if err != nil {
		log.Error("failed to update course", slog.Any("err", err))
		return fmt.Errorf("%s: %w", op, err)
	}
	return nil
}

func (s *CourseService) DeleteCourse(id int) error {
	const op = "service.course_service.DeleteCourse"
	log := s.log.With("op", op)

	err := s.repo.DeleteCourse(id)
	if err != nil {
		log.Error("failed to delete course", slog.Int("id", id), slog.Any("err", err))
		return fmt.Errorf("%s: %w", op, err)
	}
	return nil
}

func (s *CourseService) AddVideoToCourse(courseID int, path string) error {
	const op = "service.course_service.AddVideoToCourse"
	log := s.log.With("op", op)

	log.Info("adding video to course", slog.Int("course_id", courseID), slog.String("path", path))

	err := s.repo.AddVideoToCourse(courseID, path)
	if err != nil {
		log.Error("failed to add video to course", slog.Any("err", err))
		return fmt.Errorf("%s: %w", op, err)
	}

	return nil
}

func (s *CourseService) GetAllCourses() ([]structures.Course, error) {
	const op = "service.course_service.GetAllCourses"
	log := s.log.With("op", op)

	courses, err := s.repo.SelectAllCourses()
	if err != nil {
		log.Error("failed to get all courses", slog.Any("err", err))
		return nil, fmt.Errorf("%s: %w", op, err)
	}

	return courses, nil
}

func (s *CourseService) GiveAccess(userId, courseId int) error {
	const op = "service.course_service.GiveAccess"
	log := s.log.With("op", op)

	user, err := s.userRepo.GetUserById(userId)
	if err != nil {
		log.Error("failed to get user by id", slog.Int("user_id", userId), slog.Any("err", err))
		return fmt.Errorf("%s: %w", err)
	}

	hasAccess := false

	if user.Role == "admin" {
		hasAccess = true
	} else {
		for _, id := range user.CourseIDs {
			if int(id) == courseId {
				hasAccess = true
				break
			}
		}
	}

	if !hasAccess {
		err = s.repo.UpdateUsersIds(userId, courseId)
		if err != nil {
			log.Error("Error with updating course id", sl.Err(err))
			return err
		}
	}

	return nil
}

func (s *CourseService) TakeAwayAccess(userId, courseId int) error {
	const op = "service.course_service.TakeAwayAccess"
	log := s.log.With("op", op)

	err := s.repo.RemoveCourseId(userId, courseId)
	if err != nil {
		log.Error("Error with taking away access", sl.Err(err))
		return err
	}

	return nil
}

func (s *CourseService) GetAllCoursesWithAccess(userID int) ([]structures.CourseWithAccess, error) {
	courses, err := s.repo.SelectAllCourses()
	if err != nil {
		return nil, err
	}
	user, err := s.userRepo.GetUserById(userID)
	if err != nil {
		return nil, err
	}

	courseMap := make(map[int]bool)
	for _, id := range user.CourseIDs {
		courseMap[int(id)] = true
	}

	var result []structures.CourseWithAccess
	for _, course := range courses {
		result = append(result, structures.CourseWithAccess{
			Course:    course,
			HasAccess: courseMap[course.Id],
		})
	}

	return result, nil
}
