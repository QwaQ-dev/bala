package handlers

import (
	"log/slog"
	"time"

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

	if user.Password == "" || user.Username == "" || user.Role == "" {
		return c.Status(404).JSON(fiber.Map{
			"error": "Username and password and role are required",
		})
	}

	accessToken, err := u.userService.SignIn(user)
	if err != nil {
		log.Error("Error with creating user", sl.Err(err))
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	c.Cookie(&fiber.Cookie{
		Name:     "access_token",
		Value:    accessToken,
		SameSite: "Strict",
		HTTPOnly: true,
		Secure:   false,
		Path:     "/",
		Expires:  time.Now().Add(14 * 24 * time.Hour),
	})

	log.Info("User has signed in", slog.String("username", user.Username))
	return c.Status(200).JSON(fiber.Map{
		"Message": "sign in success",
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

	accessToken, err := u.userService.SignUp(user)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"Error": err.Error(),
		})
	}

	c.Cookie(&fiber.Cookie{
		Name:     "access_token",
		Value:    accessToken,
		SameSite: "Strict",
		HTTPOnly: true,
		Secure:   false,
		Path:     "/",
		Expires:  time.Now().Add(14 * 24 * time.Hour),
	})

	log.Info("User has signed up", slog.String("username", user.Username))
	return c.Status(200).JSON(fiber.Map{
		"Message": "sign up success",
	})
}

func (h *UserHandler) Logout(c *fiber.Ctx) error {
	c.Cookie(&fiber.Cookie{
		Name:     "access_token",
		Value:    "",
		HTTPOnly: true,
		Expires:  time.Now().Add(-time.Hour),
		Path:     "/",
	})
	return c.JSON(fiber.Map{"message": "Logged out"})
}

func (u *UserHandler) GetUserViaToken(c *fiber.Ctx) error {
	const op = "handlers.user_handler.GetUserViaToken"
	log := u.log.With("op", op)

	userId := c.Locals("userId").(int)

	user, err := u.userService.GetUserViaToken(userId)
	if err != nil {
		log.Error("Error with service", sl.Err(err))
		return c.Status(500).JSON(fiber.Map{
			"error": err,
		})
	}

	return c.Status(200).JSON(fiber.Map{
		"user": user,
	})
}

func (h *UserHandler) GetAllUsers(c *fiber.Ctx) error {
	const op = "handlers.checklist_handler.GetAllChecklists"
	log := h.log.With("op", op)

	users, err := h.userService.GetAllUsers()
	if err != nil {
		log.Error("failed to fetch users", slog.Any("err", err))
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch users"})
	}

	return c.Status(fiber.StatusOK).JSON(users)
}
