package handlers

import (
	"log/slog"

	"github.com/QwaQ-dev/bala/internal/config"
	"github.com/QwaQ-dev/bala/internal/services"
	"github.com/QwaQ-dev/bala/internal/structures"
	"github.com/QwaQ-dev/bala/pkg/sl"
	"github.com/gofiber/fiber/v2"
)

type UserHandler struct {
	log         *slog.Logger
	userService *services.UserService
	cfg         *config.Config
}

func NewUserHandler(log *slog.Logger, userService *services.UserService, cfg *config.Config) *UserHandler {
	return &UserHandler{
		log:         log,
		userService: userService,
		cfg:         cfg,
	}
}

func (u *UserHandler) SignIn(c *fiber.Ctx) error {
	const op = "handlers.user_handler.SignIn"
	log := u.log.With("op", op)

	user := new(structures.User)

	if err := c.BodyParser(user); err != nil {
		log.Error("Invalid user format", sl.Err(err))
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Invalid user format",
		})
	}

	if user.Password == "" || user.Username == "" {
		return c.Status(404).JSON(fiber.Map{
			"error": "Username and password are required",
		})
	}

	accessToken, err := u.userService.CreateUser(user)
	if err != nil {
		log.Error("Error with creating user", sl.Err(err))
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "User already exists",
		})
	}

	log.Info("User has signed in", slog.String("username", user.Username))
	return c.Status(200).JSON(fiber.Map{
		"access_token": accessToken,
	})
}

func (u *UserHandler) SignUp(c *fiber.Ctx) error {
	const op = "handlers.user_handler.SignUp"
	log := u.log.With("op", op)

	user := new(structures.User)
	if err := c.BodyParser(user); err != nil {
		log.Error("Error with parse body request", sl.Err(err))
		return c.Status(400).JSON(fiber.Map{"error": "Error with parsing body"})
	}

	if user.Password == "" || user.Username == "" {
		return c.Status(400).JSON(fiber.Map{"error": "username and password are required"})
	}

	accessToken, err := u.userService.SignUp(*user)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"Error": err,
		})
	}

	log.Info("User has signed up", slog.String("username", user.Username))
	return c.Status(200).JSON(fiber.Map{
		"access_token": accessToken,
	})
}
