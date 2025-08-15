package main

import (
	"context"
	"log/slog"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/QwaQ-dev/bala/internal/config"
	"github.com/QwaQ-dev/bala/internal/handlers"
	"github.com/QwaQ-dev/bala/internal/repository/postgres"
	"github.com/QwaQ-dev/bala/internal/routes"
	"github.com/QwaQ-dev/bala/internal/services"
	"github.com/QwaQ-dev/bala/pkg/sl"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

const (
	envDev  = "dev"
	envProd = "prod"
)

func main() {
	app := fiber.New()
	cfg := config.MustLoad()
	log := setupLogger(cfg.Env)

	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:3000",
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders:     "*",
		AllowCredentials: true,
	}))

	app.Static("/uploads", "./uploads")

	log.Info("Starting bala backend", slog.String("env", cfg.Env))
	db, err := postgres.InitDatabase(cfg.Database, log)
	if err != nil {
		log.Error("Error with connecting to database", sl.Err(err))
		os.Exit(1)
	}

	userRepo := postgres.NewUserRepo(log, db)
	articleRepo := postgres.NewArticleRepo(log, db)
	checklistRepo := postgres.NewChecklistRepo(log, db)
	courseRepo := postgres.NewCourseRepo(log, db)

	userService := services.NewUserService(log, userRepo, cfg)
	articleService := services.NewArticleService(articleRepo, log, cfg)
	checklistService := services.NewChecklistService(checklistRepo, log, cfg)
	courseService := services.NewCourseService(courseRepo, log, cfg, userRepo)

	userHandler := handlers.NewUserHandler(log, userService, cfg)
	articleHandler := handlers.NewArticleHandler(articleService, log)
	checklistHandler := handlers.NewChecklistHandler(checklistService, log)
	courseHandler := handlers.NewCourseHandler(courseService, log)

	routes.InitRoutes(app, log, cfg, userHandler, articleHandler, checklistHandler, courseHandler)
	log.Info("starting server", slog.String("address", cfg.Server.Port))

	go func() {
		if err := app.Listen(cfg.Server.Port); err != nil {
			log.Error("Fiber server failed to start", sl.Err(err))
			os.Exit(1)
		}
	}()

	quit := make(chan os.Signal, 1)

	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Info("Shutting down application...")

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	if err := app.ShutdownWithContext(ctx); err != nil {
		log.Error("Error with shutting down Fiber server", sl.Err(err))
	} else {
		log.Info("Fiber server gracefully stopped.")
	}

	log.Info("Application exited.")
}

func setupLogger(env string) *slog.Logger {
	var log *slog.Logger

	switch env {
	case envDev:
		log = slog.New(
			slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelDebug}),
		)
	case envProd:
		log = slog.New(
			slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo}),
		)
	}

	return log
}
