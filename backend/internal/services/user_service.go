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

	userExists, err := s.repo.GetUserByUsername(user.Username)
	if err != nil {
		log.Error("Error with db", sl.Err(err))
		return "", err
	}
	if userExists != nil {
		log.Info("User is already exists")
		return "", fmt.Errorf("User is already exists")
	}

	id, err := s.repo.CreateUser(user)
	if err != nil {
		log.Error("Error with creating user", sl.Err(err))
		return "", err
	}

	accessToken, err := generatetoken.GenerateAccessToken(id, s.cfg.JWTSecretKey)
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
		log.Error("Invalid username", sl.Err(err))
		return "", fmt.Errorf("Invalid username, error: %v", err)
	}

	if err := bcrypt.CompareHashAndPassword([]byte(userFromDb.Password), []byte(user.Password)); err != nil {
		log.Error("Error with comparing passwords", sl.Err(err))
		return "", fmt.Errorf("Error with comparing passwords, error: %v", err)
	}

	accessToken, err := generatetoken.GenerateAccessToken(int(userFromDb.Id), s.cfg.JWTSecretKey)
	if err != nil {
		log.Error("Error with generating access token wile sign in", sl.Err(err))
		return "", fmt.Errorf("Error with generating access token, error: %v", err)
	}

	return accessToken, nil
}
