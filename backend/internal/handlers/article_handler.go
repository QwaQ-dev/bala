package handlers

import (
	"log/slog"
	"strconv"

	"github.com/QwaQ-dev/bala/internal/services"
	"github.com/QwaQ-dev/bala/internal/structures"
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

	var article structures.Article
	if err := c.BodyParser(&article); err != nil {
		log.Error("failed to parse article body", slog.Any("err", err))
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if err := h.articleService.CreateArticle(article); err != nil {
		log.Error("failed to create article", slog.Any("err", err))
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create article"})
	}

	return c.SendStatus(fiber.StatusCreated)
}

func (h *ArticleHandler) GetAllArticles(c *fiber.Ctx) error {
	const op = "handlers.article_handler.GetAllArticles"
	log := h.log.With("op", op)

	articles, err := h.articleService.GetAllArticles()
	if err != nil {
		log.Error("failed to fetch articles", slog.Any("err", err))
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Could not fetch articles"})
	}

	return c.Status(fiber.StatusOK).JSON(articles)
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

	return c.Status(fiber.StatusOK).JSON(article)
}

func (h *ArticleHandler) UpdateArticle(c *fiber.Ctx) error {
	const op = "handlers.article_handler.UpdateArticle"
	log := h.log.With("op", op)

	var article structures.Article
	if err := c.BodyParser(&article); err != nil {
		log.Error("failed to parse article body", slog.Any("err", err))
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if article.Id == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "ID is required for update"})
	}

	if err := h.articleService.UpdateArticle(&article); err != nil {
		log.Error("failed to update article", slog.Any("err", err))
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update article"})
	}

	return c.SendStatus(fiber.StatusOK)
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

	return c.SendStatus(fiber.StatusOK)
}
