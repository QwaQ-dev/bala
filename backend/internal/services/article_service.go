package services

import (
	"fmt"
	"log/slog"

	"github.com/QwaQ-dev/bala/internal/config"
	"github.com/QwaQ-dev/bala/internal/repository/postgres"
	"github.com/QwaQ-dev/bala/internal/structures"
)

type ArticleService struct {
	repo *postgres.ArticleRepo
	log  *slog.Logger
	cfg  *config.Config
}

func NewArticleService(repo *postgres.ArticleRepo, log *slog.Logger, cfg *config.Config) *ArticleService {
	return &ArticleService{
		repo: repo,
		log:  log,
		cfg:  cfg,
	}
}

func (s *ArticleService) CreateArticle(article structures.Article) error {
	const op = "service.article_service.CreateArticle"
	log := s.log.With("op", op)

	log.Info("Creating article", slog.String("title", article.Title))

	err := s.repo.InsertArticle(article)
	if err != nil {
		log.Error("failed to create article", slog.Any("err", err))
		return fmt.Errorf("%s: %w", op, err)
	}

	log.Info("Article created", slog.String("slug", article.Slug))
	return nil
}

func (s *ArticleService) GetAllArticles() ([]structures.Article, error) {
	const op = "service.article_service.GetAllArticles"
	log := s.log.With("op", op)

	articles, err := s.repo.SelectAllArticles()
	if err != nil {
		log.Error("failed to get all articles", slog.Any("err", err))
		return nil, fmt.Errorf("%s: %w", op, err)
	}
	return articles, nil
}

func (s *ArticleService) GetArticleByID(id int) (structures.Article, error) {
	const op = "service.article_service.GetArticleByID"
	log := s.log.With("op", op)

	article, err := s.repo.SelectArticleById(id)
	if err != nil {
		log.Error("failed to get article by id", slog.Int("id", id), slog.Any("err", err))
		return article, fmt.Errorf("%s: %w", op, err)
	}
	return article, nil
}

func (s *ArticleService) UpdateArticle(article *structures.Article, id int) error {
	const op = "service.article_service.UpdateArticle"
	log := s.log.With("op", op)

	err := s.repo.UpdateArticle(article, id)
	if err != nil {
		log.Error("failed to update article", slog.Any("err", err))
		return fmt.Errorf("%s: %w", op, err)
	}
	return nil
}

func (s *ArticleService) DeleteArticle(id int) error {
	const op = "service.article_service.DeleteArticle"
	log := s.log.With("op", op)

	err := s.repo.DeleteArticle(id)
	if err != nil {
		log.Error("failed to delete article", slog.Int("id", id), slog.Any("err", err))
		return fmt.Errorf("%s: %w", op, err)
	}
	return nil
}
