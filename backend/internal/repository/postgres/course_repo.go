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

// InsertCourse добавляет курс в БД и возвращает его ID
func (r *CourseRepo) InsertCourse(course structures.Course) (int, error) {
	const op = "postgres.course_repo.InsertCourse"
	log := r.log.With("op", op)

	tx, err := r.db.Begin()
	if err != nil {
		log.Error("failed to begin tx", sl.Err(err))
		return 0, err
	}
	defer tx.Rollback()

	query := `INSERT INTO courses (title, description, cost, img) VALUES ($1, $2, $3, $4) RETURNING id`
	var courseID int
	err = tx.QueryRow(query, course.Title, course.Description, course.Cost, course.Img).Scan(&courseID)
	if err != nil {
		log.Error("failed to insert course", sl.Err(err))
		return 0, err
	}

	if err := tx.Commit(); err != nil {
		log.Error("failed to commit tx", sl.Err(err))
		return 0, err
	}

	return courseID, nil
}

// DeleteCourse удаляет курс по ID
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

// SelectCourseById возвращает курс с его видео
func (r *CourseRepo) SelectCourseById(courseID int) (structures.Course, error) {
	const op = "postgres.course_repo.SelectCourseById"
	log := r.log.With("op", op)

	query := `
        SELECT 
            c.id, c.title, c.description, c.cost, c.img,
            v.id AS video_id, v.path AS video_path, v.title AS video_title
        FROM courses c
        LEFT JOIN videos v ON v.course_id = c.id
        WHERE c.id = $1;
    `

	rows, err := r.db.Query(query, courseID)
	if err != nil {
		log.Error("failed to select course", sl.Err(err))
		return structures.Course{}, fmt.Errorf("%s: %w", op, err)
	}
	defer rows.Close()

	var course structures.Course
	videos := []structures.Video{}
	courseInitialized := false

	for rows.Next() {
		var (
			videoID    sql.NullInt64
			videoPath  sql.NullString
			videoTitle sql.NullString
		)

		var cId int
		var title, description, img string
		var cost int

		if err := rows.Scan(
			&cId,
			&title,
			&description,
			&cost,
			&img,
			&videoID,
			&videoPath,
			&videoTitle,
		); err != nil {
			return structures.Course{}, fmt.Errorf("%s: %w", op, err)
		}

		if !courseInitialized {
			course = structures.Course{
				Id:          cId,
				Title:       title,
				Description: description,
				Cost:        cost,
				Img:         img,
			}
			courseInitialized = true
		}

		if videoID.Valid && videoPath.Valid {
			titleStr := ""
			if videoTitle.Valid {
				titleStr = videoTitle.String
			}
			videos = append(videos, structures.Video{
				Id:    int(videoID.Int64),
				Path:  videoPath.String,
				Title: titleStr,
			})
		}
	}

	course.Videos = videos
	return course, nil
}

// UpdateCourse обновляет данные курса
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

// SelectAllCourses возвращает все курсы без видео
func (r *CourseRepo) SelectAllCourses() ([]structures.Course, error) {
	const op = "postgres.course_repo.SelectAllCourses"
	log := r.log.With("op", op)

	query := `
		SELECT id, title, description, cost, img 
		FROM courses
		ORDER BY id DESC
	`

	rows, err := r.db.Query(query)
	if err != nil {
		log.Error("failed to execute query", sl.Err(err))
		return nil, fmt.Errorf("%s: %w", op, err)
	}
	defer rows.Close()

	var courses []structures.Course

	for rows.Next() {
		var course structures.Course

		err := rows.Scan(
			&course.Id,
			&course.Title,
			&course.Description,
			&course.Cost,
			&course.Img,
		)
		if err != nil {
			log.Error("failed to scan course row", sl.Err(err))
			continue
		}

		courses = append(courses, course)
	}

	if err = rows.Err(); err != nil {
		log.Error("rows iteration error", sl.Err(err))
		return nil, fmt.Errorf("%s: %w", op, err)
	}

	return courses, nil
}

// UpdateUsersIds добавляет курс в массив пользователя
func (r *CourseRepo) UpdateUsersIds(userId, courseId int) error {
	const op = "postgres.course_repo.UpdateUsersIds"
	log := r.log.With("op", op)

	query := `
		UPDATE users
		SET course_ids = array_append(course_ids, $1)
		WHERE id = $2;
	`

	result, err := r.db.Exec(query, courseId, userId)
	if err != nil {
		log.Error("failed to give access", sl.Err(err))
		return fmt.Errorf("%s: %w", op, err)
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		log.Warn("no user found with ID", slog.Int("id", userId))
		return fmt.Errorf("user with id=%d not found", userId)
	}

	log.Info("access has been given to user", slog.Int("id", userId))
	return nil
}

// RemoveCourseId удаляет курс из массива пользователя
func (r *CourseRepo) RemoveCourseId(userId, courseId int) error {
	const op = "postgres.course_repo.RemoveCourseId"
	log := r.log.With("op", op)

	query := `
		UPDATE users
		SET course_ids = array_remove(course_ids, $1)
		WHERE id = $2;
	`

	result, err := r.db.Exec(query, courseId, userId)
	if err != nil {
		log.Error("failed to remove access", sl.Err(err))
		return fmt.Errorf("%s: %w", op, err)
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		log.Warn("no user found with ID", slog.Int("id", userId))
		return fmt.Errorf("user with id=%d not found", userId)
	}

	log.Info("access has been taken from user", slog.Int("id", userId))
	return nil
}
