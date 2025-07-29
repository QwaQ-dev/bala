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
	checklistHandler *handlers.ChecklistHandler,
	courseHandler *handlers.CourseHandler) {
	v1 := app.Group("/api/v1")

	authorizedGroup := v1.Group("/auth")
	authorizedGroup.Use(middleware.JWTMiddleware(cfg.JWTSecretKey))

	checklists := authorizedGroup.Group("/checklist")
	articles := authorizedGroup.Group("/article")
	courses := authorizedGroup.Group("/course")
	user := v1.Group("/user")

	user.Post("/sign-in", userHandler.SignIn)
	user.Post("/sign-up", userHandler.SignUp)

	checklists.Post("/create", checklistHandler.CreateChecklist)
	checklists.Put("/update", checklistHandler.UpdateChecklist)
	user.Get("/get", checklistHandler.GetAllChecklists)
	user.Get("/get/:id", checklistHandler.GetOneChecklist)
	checklists.Delete("/:id", checklistHandler.DeleteChecklist)

	articles.Post("/create", articleHandler.CreateArticle)
	articles.Put("/update", articleHandler.UpdateArticle)
	user.Get("/get", articleHandler.GetAllArticles)
	user.Get("/get/:id", articleHandler.GetOneArticle)
	articles.Delete("/:id", articleHandler.DeleteArticle)

	courses.Post("/create", courseHandler.CreateCourse)
	courses.Put("/update", courseHandler.UpdateCourse)
	courses.Get("/get/:id", courseHandler.GetCourseByID)
	courses.Delete("/:id", courseHandler.DeleteCourse)
	courses.Post("/add-video", courseHandler.UploadVideo)

	log.Debug("All routes were initialized")
}
