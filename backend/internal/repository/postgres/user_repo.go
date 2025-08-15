package postgres

import (
	"database/sql"
	"errors"
	"fmt"
	"log/slog"

	"github.com/QwaQ-dev/bala/internal/structures"
	"github.com/QwaQ-dev/bala/pkg/sl"
	"github.com/lib/pq"
)

type UserRepo struct {
	log *slog.Logger
	db  *sql.DB
}

func NewUserRepo(log *slog.Logger, db *sql.DB) *UserRepo {
	return &UserRepo{
		log: log,
		db:  db,
	}
}

func (r *UserRepo) CreateUser(user *structures.User) (int, string, error) {
	const op = "postgres.user_repo.CreateUser"
	log := r.log.With("op", op)

	var id int
	var role string

	query := "INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, role"
	err := r.db.QueryRow(query, user.Username, user.Password, user.Role).Scan(&id, &role)
	if err != nil {
		log.Error("Error with inserting user data", sl.Err(err))
		return id, role, err
	}

	return id, role, nil
}

func (r *UserRepo) GetUserByUsername(username string) (*structures.User, error) {
	const op = "postgres.user_repo.GetUserByUsername"
	log := r.log.With("op", op)

	query := "SELECT id, username, password, course_ids, role FROM users WHERE username=$1"

	user := new(structures.User)

	err := r.db.QueryRow(query, username).Scan(&user.Id, &user.Username, &user.Password, pq.Array(&user.Courses), &user.Role)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("No user with this username")
		}
		log.Debug("User with this username already exists", sl.Err(err))
		return nil, err
	}

	return user, nil
}

func (r *UserRepo) SelectAllUsers() ([]structures.User, error) {
	const op = "postgres.user_repo.SelectAllUsers"
	log := r.log.With("op", op)

	query := `
		SELECT id, username, password, course_ids, role 
		FROM users
		ORDER BY id DESC
	`

	rows, err := r.db.Query(query)
	if err != nil {
		log.Error("failed to execute query", sl.Err(err))
		return nil, fmt.Errorf("%s: %w", op, err)
	}
	defer rows.Close()

	var users []structures.User

	for rows.Next() {
		var user structures.User

		err := rows.Scan(
			&user.Id,
			&user.Username,
			&user.Password,
			pq.Array(&user.Courses),
			&user.Role,
		)
		if err != nil {
			log.Error("failed to scan article row", sl.Err(err))
			continue
		}

		users = append(users, user)
	}

	if err = rows.Err(); err != nil {
		log.Error("rows iteration error", sl.Err(err))
		return nil, fmt.Errorf("%s: %w", op, err)
	}

	return users, nil
}

func (r *UserRepo) GetUserById(id int) (*structures.User, error) {
	const op = "postgres.user_repo.GetUserById"
	log := r.log.With("op", op)

	user := new(structures.User)

	query := "SELECT username, password, course_ids, role FROM users WHERE id=$1"

	err := r.db.QueryRow(query, id).Scan(&user.Username, &user.Password, pq.Array(&user.Courses), &user.Role)
	if err != nil {
		log.Error("Error with scanning user data", sl.Err(err))
		return user, err
	}

	user.Id = int64(id)

	return user, nil
}

func (r *UserRepo) DeleteUser(id int) error {
	const op = "postgres.user_repo.DeleteUser"
	log := r.log.With("op", op)

	query := "DELETE FROM users WHERE id = $1"
	result, err := r.db.Exec(query, id)
	if err != nil {
		log.Error("Error with deleting user by id", sl.Err(err))
		return fmt.Errorf("Error with deleting user by id: %v", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		log.Info("No user found with ID", slog.Int("id", id))
	} else {
		log.Info("User with ID deleted", slog.Int("id", id))
	}

	return nil
}
