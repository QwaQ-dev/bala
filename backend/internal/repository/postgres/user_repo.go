package postgres

import (
	"database/sql"
	"errors"
	"fmt"
	"log/slog"

	"github.com/QwaQ-dev/bala/internal/structures"
	"github.com/QwaQ-dev/bala/pkg/sl"
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

func (r *UserRepo) CreateUser(user *structures.User) (int, error) {
	const op = "postgres.user_repo.CreateUser"
	log := r.log.With("op", op)

	var id int

	query := "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id"
	err := r.db.QueryRow(query, user.Username, user.Password).Scan(&id)
	if err != nil {
		log.Error("Error with inserting user data", sl.Err(err))
		return id, err
	}

	return id, nil
}

func (r *UserRepo) GetUserByUsername(username string) (*structures.User, error) {
	const op = "postgres.user_repo.GetUserByUsername"
	log := r.log.With("op", op)

	query := "SELECT id, username, password, isPaid FROM users WHERE username=$1"

	user := new(structures.User)

	err := r.db.QueryRow(query, username).Scan(&user.Id, &user.Username, &user.Password, &user.IsPaid)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("No user with this username")
		}
		log.Debug("User with this username already exists", sl.Err(err))
		return nil, err
	}

	return user, nil
}

func (r *UserRepo) GetUserById(id int) (*structures.User, error) {
	const op = "postgres.user_repo.GetUserById"
	log := r.log.With("op", op)

	user := new(structures.User)

	query := "SELECT username, password, isPaid FROM users WHERE id=$1"

	err := r.db.QueryRow(query, id).Scan(&user.Username, &user.Password, &user.IsPaid)
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
