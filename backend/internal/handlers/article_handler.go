package handlers

import (
	"fmt"
	"log/slog"
	"os"
	"strconv"

	"github.com/QwaQ-dev/bala/internal/services"
	"github.com/QwaQ-dev/bala/internal/structures"
	"github.com/QwaQ-dev/bala/pkg/sl"
	"github.com/gofiber/fiber/v2"
)

type ArticleHandler struct {
	articleService *services.ArticleService
	log            *slog.Logger
}

func NewArticleHandler(articleService *services.ArticleService, log *slog.Logger) *ArticleHandler {
	return &ArticleHandler{
		articleService: articleService,
		log:            log,
	}
}

func (h *ArticleHandler) CreateArticle(c *fiber.Ctx) error {
	const op = "handlers.article_handler.CreateArticle"
	log := h.log.With("op", op)

	// Получаем текстовые данные
	article := structures.Article{
		Title:    c.FormValue("title"),
		Content:  c.FormValue("content"),
		Category: c.FormValue("category"),
		Author:   c.FormValue("author"),
		Slug:     c.FormValue("slug"),
	}
	readTime, _ := strconv.Atoi(c.FormValue("readTime"))
	article.ReadTime = readTime

	// Сохраняем статью в БД
	id, err := h.articleService.CreateArticle(article)
	if err != nil {
		log.Error("failed to create article", slog.Any("err", err))
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create article"})
	}

	uploadDir := "./uploads/articles"
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		log.Error("failed to create uploads dir", sl.Err(err))
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to create uploads dir"})
	}

	// Получаем файлы
	form, err := c.MultipartForm()
	if err == nil && form != nil {
		files := form.File["files[]"]

		for _, file := range files {
			savePath := fmt.Sprintf("uploads/articles/%s", file.Filename)
			if err := c.SaveFile(file, savePath); err != nil {
				log.Error("failed to save file", slog.Any("err", err))
				continue
			}

			// Сохраняем путь в БД
			if err := h.articleService.AddFileToArticle(id, savePath, file.Header.Get("Content-Type")); err != nil {
				log.Error("failed to insert file path", slog.Any("err", err))
			}
		}
	}

	return c.Status(201).JSON(fiber.Map{
		"message": "Article created",
		"id":      id,
	})
}

func (h *ArticleHandler) GetAllArticles(c *fiber.Ctx) error {
	const op = "handlers.article_handler.GetAllArticles"
	log := h.log.With("op", op)

	articles, err := h.articleService.GetAllArticles()
	if err != nil {
		log.Error("failed to fetch articles", slog.Any("err", err))
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not fetch articles"})
	}

	return c.Status(200).JSON(fiber.Map{
		"articles": articles,
	})
}

func (h *ArticleHandler) GetOneArticle(c *fiber.Ctx) error {
	const op = "handlers.article_handler.GetOneArticle"
	log := h.log.With("op", op)

	idStr := c.Params("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		log.Error("invalid article id", slog.String("id", idStr))
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid ID"})
	}

	article, err := h.articleService.GetArticleByID(id)
	if err != nil {
		log.Error("article not found", slog.Int("id", id), slog.Any("err", err))
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Article not found"})
	}

	return c.Status(200).JSON(fiber.Map{
		"article": article,
	})
}

func (h *ArticleHandler) UpdateArticle(c *fiber.Ctx) error {
	const op = "handlers.article_handler.UpdateArticle"
	log := h.log.With("op", op)

	idStr := c.Params("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		log.Error("invalid article id", slog.String("id", idStr))
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid ID"})
	}

	var article structures.Article
	if err := c.BodyParser(&article); err != nil {
		log.Error("failed to parse article body", slog.Any("err", err))
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if id == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "ID is required for update"})
	}

	if err := h.articleService.UpdateArticle(&article, id); err != nil {
		log.Error("failed to update article", slog.Any("err", err))
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update article"})
	}

	return c.Status(200).JSON(fiber.Map{
		"message": "Article has been updated",
	})
}

func (h *ArticleHandler) DeleteArticle(c *fiber.Ctx) error {
	const op = "handlers.article_handler.DeleteArticle"
	log := h.log.With("op", op)

	idStr := c.Params("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		log.Error("invalid article id", slog.String("id", idStr))
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid ID"})
	}

	if err := h.articleService.DeleteArticle(id); err != nil {
		log.Error("failed to delete article", slog.Int("id", id), slog.Any("err", err))
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete article"})
	}

	return c.Status(200).JSON(fiber.Map{
		"message": "Article has been deleted",
	})
}
