package postgres

import (
	"database/sql"
	"fmt"
	"log/slog"

	"github.com/QwaQ-dev/bala/internal/structures"
	"github.com/QwaQ-dev/bala/pkg/sl"
)

type CourseRepo struct {
	log *slog.Logger
	db  *sql.DB
}

func NewCourseRepo(log *slog.Logger, db *sql.DB) *CourseRepo {
	return &CourseRepo{log: log, db: db}
}

func (r *CourseRepo) InsertCourse(course structures.Course) error {
	const op = "postgres.course_repo.InsertCourse"
	log := r.log.With("op", op)

	tx, err := r.db.Begin()
	if err != nil {
		log.Error("failed to begin tx", sl.Err(err))
		return err
	}
	defer tx.Rollback()

	query := `INSERT INTO courses (title, description, cost, img) VALUES ($1, $2, $3, $4) RETURNING id`
	var courseID int
	err = tx.QueryRow(query, course.Title, course.Description, course.Cost, course.Img).Scan(&courseID)
	if err != nil {
		log.Error("failed to insert course", sl.Err(err))
		return err
	}

	if err := tx.Commit(); err != nil {
		log.Error("failed to commit tx", sl.Err(err))
		return err
	}

	return nil
}

func (r *CourseRepo) DeleteCourse(id int) error {
	const op = "postgres.course_repo.DeleteCourse"
	log := r.log.With("op", op)

	query := "DELETE FROM courses WHERE id = $1"
	result, err := r.db.Exec(query, id)
	if err != nil {
		log.Error("failed to delete course", sl.Err(err))
		return fmt.Errorf("%s: %w", op, err)
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		log.Warn("no course found with ID", slog.Int("id", id))
	}

	log.Info("course deleted", slog.Int("id", id))
	return nil
}

func (r *CourseRepo) SelectCourseById(id int) (structures.Course, error) {
	const op = "postgres.course_repo.SelectCourseById"
	log := r.log.With("op", op)

	var course structures.Course
	query := `SELECT id, title, description, cost, img FROM courses WHERE id=$1`
	err := r.db.QueryRow(query, id).Scan(&course.Id, &course.Title, &course.Description, &course.Cost, &course.Img)
	if err != nil {
		log.Error("failed to query course", sl.Err(err))
		return course, err
	}

	videosQuery := `SELECT id, path FROM videos WHERE course_id=$1`
	rows, err := r.db.Query(videosQuery, id)
	if err != nil {
		log.Error("failed to query videos", sl.Err(err))
		return course, err
	}
	defer rows.Close()

	for rows.Next() {
		var video structures.Video
		if err := rows.Scan(&video.Id, &video.Path); err != nil {
			log.Warn("failed to scan video", sl.Err(err))
			continue
		}
		course.Videos = append(course.Videos, video)
	}

	return course, nil
}

func (r *CourseRepo) UpdateCourse(c *structures.Course) error {
	const op = "postgres.course_repo.UpdateCourse"
	log := r.log.With("op", op)

	query := `
	UPDATE courses
	SET title = $1,
		description = $2,
		cost = $3,
		img = $4
	WHERE id = $5`

	result, err := r.db.Exec(query, c.Title, c.Description, c.Cost, c.Img, c.Id)
	if err != nil {
		log.Error("failed to update course", sl.Err(err))
		return fmt.Errorf("%s: %w", op, err)
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		log.Warn("no course found with ID", slog.Int("id", c.Id))
		return fmt.Errorf("course with id=%d not found", c.Id)
	}

	log.Info("course updated", slog.Int("id", c.Id))
	return nil
}
