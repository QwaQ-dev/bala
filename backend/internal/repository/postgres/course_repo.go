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

// InsertCourse adds a course to the database and returns its ID, including webinars
func (r *CourseRepo) InsertCourse(course structures.Course) (int, error) {
	const op = "postgres.course_repo.InsertCourse"
	log := r.log.With("op", op)

	log.Info("course", course)

	tx, err := r.db.Begin()
	if err != nil {
		log.Error("failed to begin tx", sl.Err(err))
		return 0, err
	}
	defer tx.Rollback()

	query := `INSERT INTO courses (title, description, cost, diploma_path, diploma_x, diploma_y, img)
	          VALUES ($1, $2, $3, $4, $5, $6, $7)
	          RETURNING id`
	var courseID int
	err = tx.QueryRow(query, course.Title, course.Description, course.Cost, course.DiplomaPath, course.Diploma_x, course.Diploma_y, course.Img).Scan(&courseID)
	if err != nil {
		log.Error("failed to insert course", sl.Err(err))
		return 0, err
	}

	_, err = tx.Exec(`
		INSERT INTO webinars (link, date, course_id)
		VALUES ($1, $2, $3)
	`, course.Webinars.Link, course.Webinars.Date, courseID)
	if err != nil {
		log.Error("failed to insert webinar", sl.Err(err))
		return 0, err
	}

	if err := tx.Commit(); err != nil {
		log.Error("failed to commit tx", sl.Err(err))
		return 0, err
	}

	log.Info("course created", slog.Int("id", courseID))
	return courseID, nil
}

// DeleteCourse deletes a course by ID (webinars and videos are deleted via CASCADE)
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
		return fmt.Errorf("course with id=%d not found", id)
	}

	log.Info("course deleted", slog.Int("id", id))
	return nil
}

// SelectCourseById returns a course with its videos and webinars
func (r *CourseRepo) SelectCourseById(courseID int) (structures.Course, error) {
	const op = "postgres.course_repo.SelectCourseById"
	log := r.log.With("op", op)

	query := `
		SELECT 
            c.id, c.title, c.description, c.cost, c.diploma_path, c.diploma_x, c.diploma_y, c.img,
            v.id AS video_id, v.file AS video_file, v.path AS video_path, v.title AS video_title,
            w.id AS webinar_id, w.link AS webinar_link, w.date AS webinar_date
        FROM courses c
        LEFT JOIN videos v ON v.course_id = c.id
        LEFT JOIN webinars w ON w.course_id = c.id
        WHERE c.id = $1
    `

	rows, err := r.db.Query(query, courseID)
	if err != nil {
		log.Error("failed to select course", sl.Err(err))
		return structures.Course{}, fmt.Errorf("%s: %w", op, err)
	}
	defer rows.Close()

	var course structures.Course
	var videos []structures.Video
	var webinar structures.Webinar
	courseInitialized := false

	for rows.Next() {
		var (
			videoID      sql.NullInt64
			videoPath    sql.NullString
			videoTitle   sql.NullString
			file         sql.NullString
			webinarID    sql.NullInt64
			webinarLink  sql.NullString
			webinarDate  sql.NullTime
			diplomaPath  sql.NullString
			diplomaX     int
			diplomaY     int
		)

		var cId int
		var title, description, img string
		var cost int

		if err := rows.Scan(
			&cId,
			&title,
			&description,
			&cost,
			&diplomaPath,
			&diplomaX,
			&diplomaY,
			&img,
			&videoID,
			&file,
			&videoPath,
			&videoTitle,
			&webinarID,
			&webinarLink,
			&webinarDate,
		); err != nil {
			log.Error("failed to scan row", sl.Err(err))
			return structures.Course{}, fmt.Errorf("%s: %w", op, err)
		}

		if !courseInitialized {
			course = structures.Course{
				Id:          cId,
				Title:       title,
				Description: description,
				Cost:        cost,
				DiplomaPath: diplomaPath.String,
				Diploma_x:   diplomaX,
				Diploma_y:   diplomaY,
				Img:         img,
			}
			courseInitialized = true
		}

		if videoID.Valid && videoPath.Valid {
			videos = append(videos, structures.Video{
				Id:    int(videoID.Int64),
				Path:  videoPath.String,
				Title: videoTitle.String,
				File:  file.String,
			})
		}

		if webinarID.Valid {
			webinar = structures.Webinar{
				Id:       int(webinarID.Int64),
				Link:     webinarLink.String,
				Date:     webinarDate.Time,
				CourseID: cId,
			}
		}
	}

	if !courseInitialized {
		log.Warn("no course found", slog.Int("id", courseID))
		return structures.Course{}, fmt.Errorf("course with id=%d not found", courseID)
	}

	course.Videos = videos
	course.Webinars = webinar
	return course, nil
}

// UpdateCourse updates course data
func (r *CourseRepo) UpdateCourse(c *structures.Course) error {
	const op = "postgres.course_repo.UpdateCourse"
	log := r.log.With("op", op)

	query := `
	UPDATE courses
	SET title = $1,
		description = $2,
		cost = $3,
		img = $4,
		diploma_path = $5
	WHERE id = $6`

	result, err := r.db.Exec(query, c.Title, c.Description, c.Cost, c.Img, c.DiplomaPath, c.Id)
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

// SelectAllCourses returns all courses without videos but with diploma_path
func (r *CourseRepo) SelectAllCourses() ([]structures.Course, error) {
	const op = "postgres.course_repo.SelectAllCourses"
	log := r.log.With("op", op)

	query := `
		SELECT id, title, description, cost, img, diploma_path
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
		var diplomaPath sql.NullString

		err := rows.Scan(
			&course.Id,
			&course.Title,
			&course.Description,
			&course.Cost,
			&course.Img,
			&diplomaPath,
		)
		if err != nil {
			log.Error("failed to scan course row", sl.Err(err))
			continue
		}

		course.DiplomaPath = diplomaPath.String
		courses = append(courses, course)
	}

	if err = rows.Err(); err != nil {
		log.Error("rows iteration error", sl.Err(err))
		return nil, fmt.Errorf("%s: %w", op, err)
	}

	return courses, nil
}

// AddWebinarToCourse adds a webinar to a course
func (r *CourseRepo) AddWebinarToCourse(courseID int, webinar structures.Webinar) error {
	const op = "postgres.course_repo.AddWebinarToCourse"
	log := r.log.With("op", op)

	query := `
		INSERT INTO webinars (link, date, course_id)
		VALUES ($1, $2, $3)
	`
	_, err := r.db.Exec(query, webinar.Link, webinar.Date, courseID)
	if err != nil {
		log.Error("failed to add webinar", sl.Err(err))
		return fmt.Errorf("%s: %w", op, err)
	}

	log.Info("webinar added", slog.Int("course_id", courseID), slog.String("title", webinar.Link))
	return nil
}

// UpdateUsersIds adds a course to a user's course_ids array
func (r *CourseRepo) UpdateUsersIds(userId, courseId int) error {
	const op = "postgres.course_repo.UpdateUsersIds"
	log := r.log.With("op", op)

	query := `
		UPDATE users
		SET course_ids = array_append(course_ids, $1)
		WHERE id = $2
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

// RemoveCourseId removes a course from a user's course_ids array
func (r *CourseRepo) RemoveCourseId(userId, courseId int) error {
	const op = "postgres.course_repo.RemoveCourseId"
	log := r.log.With("op", op)

	query := `
		UPDATE users
		SET course_ids = array_remove(course_ids, $1)
		WHERE id = $2
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
