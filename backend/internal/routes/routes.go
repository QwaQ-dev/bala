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

	admin := v1.Group("/admin")
	admin.Use(middleware.JWTMiddleware(cfg.JWTSecretKey))
	admin.Use(middleware.AdminOnly())

	user := v1.Group("/user")

	adminArticles := admin.Group("/article")
	adminChecklists := admin.Group("/checklist")
	adminCourses := admin.Group("/course")

	articles := v1.Group("/article")
	checklists := v1.Group("/checklist")

	courses := authorizedGroup.Group("/course")

	user.Post("/sign-in", userHandler.SignIn)
	user.Post("/sign-up", userHandler.SignUp)
	admin.Get("/users", userHandler.GetAllUsers)
	authorizedGroup.Get("/user-info", userHandler.GetUserViaToken)
	authorizedGroup.Delete("/logout", userHandler.Logout)

	adminChecklists.Post("/create", checklistHandler.CreateChecklist)
	adminChecklists.Put("/update/:id", checklistHandler.UpdateChecklist)
	checklists.Get("/get", checklistHandler.GetAllChecklists)
	checklists.Get("/get/:id", checklistHandler.GetOneChecklist)
	adminChecklists.Delete("/:id", checklistHandler.DeleteChecklist)

	adminArticles.Post("/create", articleHandler.CreateArticle)
	adminArticles.Put("/update", articleHandler.UpdateArticle)
	articles.Get("/get", articleHandler.GetAllArticles)
	articles.Get("/get/:id", articleHandler.GetOneArticle)
	adminArticles.Delete("/:id", articleHandler.DeleteArticle)

	adminCourses.Post("/create", courseHandler.CreateCourse)
	adminCourses.Put("/update", courseHandler.UpdateCourse)
	courses.Get("/get", courseHandler.GetAllCourses)
	courses.Get("/get/:id", courseHandler.GetCourseByID)
	courses.Get("/get-with-access", courseHandler.GetAllCoursesWithAccess)
	adminCourses.Delete("/:id", courseHandler.DeleteCourse)
	adminCourses.Post("/add-video", courseHandler.UploadVideos)
	adminCourses.Post("/give-access", courseHandler.GiveAccess)
	adminCourses.Post("/take-away-access", courseHandler.TakeAwayAccess)

	log.Debug("All routes were initialized")
}
