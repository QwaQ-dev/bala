package services

import (
	"fmt"
	"log/slog"

	"github.com/QwaQ-dev/bala/internal/config"
	"github.com/QwaQ-dev/bala/internal/repository/postgres"
	"github.com/QwaQ-dev/bala/internal/structures"
	generatetoken "github.com/QwaQ-dev/bala/pkg/jwt/generateToken"
	"github.com/QwaQ-dev/bala/pkg/sl"
	"golang.org/x/crypto/bcrypt"
)

type UserService struct {
	log  *slog.Logger
	repo *postgres.UserRepo
	cfg  *config.Config
}

func NewUserService(log *slog.Logger, repo *postgres.UserRepo, cfg *config.Config) *UserService {
	return &UserService{
		log:  log,
		repo: repo,
		cfg:  cfg,
	}
}

func (s *UserService) SignUp(user *structures.User) (string, error) {
	const op = "services.user_service.CreateUser"
	log := s.log.With("op", op)

	hash, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Error("Error with generating hash from password", sl.Err(err))
		return "", err
	}
	user.Password = string(hash)

	userExists, _ := s.repo.GetUserByUsername(user.Username)
	if userExists != nil {
		log.Info("User is already exists")
		return "", fmt.Errorf("User is already exists")
	}

	id, role, err := s.repo.CreateUser(user)
	if err != nil {
		log.Error("Error with creating user", sl.Err(err))
		return "", err
	}

	accessToken, err := generatetoken.GenerateAccessToken(id, s.cfg.JWTSecretKey, role)
	if err != nil {
		log.Error("Error with generating access token wile sign in", sl.Err(err))
		return "", err
	}

	return accessToken, nil
}

func (s *UserService) SignIn(user *structures.User) (string, error) {
	const op = "services.user_service.SigIn"
	log := s.log.With("op", op)

	userFromDb, err := s.repo.GetUserByUsername(user.Username)
	if err != nil {
		log.Error("Error with selecting user from db", sl.Err(err))
		return "", err
	}

	if userFromDb == nil {
		log.Error("Invalid username")
		return "", fmt.Errorf("Invalid username")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(userFromDb.Password), []byte(user.Password)); err != nil {
		log.Error("Error with comparing passwords", sl.Err(err))
		return "", fmt.Errorf("Error with comparing passwords, error: %v", err)
	}

	accessToken, err := generatetoken.GenerateAccessToken(int(userFromDb.Id), s.cfg.JWTSecretKey, userFromDb.Role)
	if err != nil {
		log.Error("Error with generating access token wile sign in", sl.Err(err))
		return "", fmt.Errorf("Error with generating access token, error: %v", err)
	}

	return accessToken, nil
}

func (s *UserService) GetUserViaToken(id int) (*structures.User, error) {
	const op = "services.user_service.GetUserViaToken"
	log := s.log.With("op", op)

	user, err := s.repo.GetUserById(id)
	if err != nil {
		log.Error("Error with getting user by id", sl.Err(err))
		return user, err
	}

	return user, nil
}

func (s *UserService) GetAllUsers() ([]structures.User, error) {
	const op = "service.user_service.GetAllUsers"

	users, err := s.repo.SelectAllUsers()
	if err != nil {
		s.log.Error("failed to get all courses", slog.String("op", op), slog.Any("err", err))
		return nil, fmt.Errorf("%s: %w", op, err)
	}

	return users, nil
}
