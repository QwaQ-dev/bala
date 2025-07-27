package routes

import (
	"log/slog"

	"github.com/QwaQ-dev/bala/internal/config"
	"github.com/QwaQ-dev/bala/internal/handlers"
	"github.com/QwaQ-dev/bala/pkg/jwt/middleware"
	"github.com/gofiber/fiber/v2"
)

func InitRoutes(
	app *fiber.App,
	log *slog.Logger,
	cfg *config.Config,
	userHandler *handlers.UserHandler,
	articleHandler *handlers.ArticleHandler,
	checklistHandler *handlers.ChecklistHandler) {
	v1 := app.Group("/api/v1")

	authorizedGroup := v1.Group("/auth")
	authorizedGroup.Use(middleware.JWTMiddleware(cfg.JWTSecretKey))

	checklists := authorizedGroup.Group("/checklist")
	articles := authorizedGroup.Group("/article")
	user := v1.Group("/user")

	user.Post("/sign-in", userHandler.SignIn)
	user.Post("/sign-up", userHandler.SignUp)

	checklists.Post("/create", checklistHandler.CreateChecklist)
	checklists.Put("/update", checklistHandler.UpdateChecklist)
	checklists.Get("/get", checklistHandler.GetAllChecklists)
	checklists.Get("/get/:id", checklistHandler.GetOneChecklist)
	checklists.Delete("/:id", checklistHandler.DeleteChecklist)

	articles.Post("/create", articleHandler.CreateArticle)
	articles.Put("/update", articleHandler.UpdateArticle)
	articles.Get("/get", articleHandler.GetAllArticles)
	articles.Get("/get/:id", articleHandler.GetOneArticle)
	articles.Delete("/:id", articleHandler.DeleteArticle)

	log.Debug("All routes were initialized")
}
