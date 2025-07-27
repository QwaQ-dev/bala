package postgres

import (
	"database/sql"
	"fmt"
	"log/slog"

	"github.com/QwaQ-dev/bala/internal/structures"
	"github.com/QwaQ-dev/bala/pkg/sl"
)

type ArticleRepo struct {
	log *slog.Logger
	db  *sql.DB
}

func NewArticleRepo(log *slog.Logger, db *sql.DB) *ArticleRepo {
	return &ArticleRepo{
		log: log,
		db:  db,
	}
}

func (r *ArticleRepo) InsertArticle(article structures.Article) error {
	const op = "postgres.article_repo.InsertArticle"
	log := r.log.With("op", op)

	query := `
	INSERT INTO articles (title, content, category, author, read_time, slug)
	VALUES ($1, $2, $3, $4, $5, $6)
	`

	_, err := r.db.Exec(query, article.Title, article.Content, article.Category, article.Author, article.ReadTime, article.Slug)
	if err != nil {
		log.Error("Error with inserting user data", sl.Err(err))
		return err
	}

	log.Debug("Article has been added")

	return nil
}

func (r *ArticleRepo) SelectAllArticles() ([]structures.Article, error) {
	const op = "postgres.article_repo.SelectAllArticles"
	log := r.log.With("op", op)

	query := `
		SELECT id, title, content, category, author, read_time, slug
		FROM articles
		ORDER BY id DESC
	`

	rows, err := r.db.Query(query)
	if err != nil {
		log.Error("failed to execute query", sl.Err(err))
		return nil, fmt.Errorf("%s: %w", op, err)
	}
	defer rows.Close()

	var articles []structures.Article

	for rows.Next() {
		var article structures.Article

		err := rows.Scan(
			&article.Id,
			&article.Title,
			&article.Content,
			&article.Category,
			&article.Author,
			&article.ReadTime,
			&article.Slug,
		)
		if err != nil {
			log.Error("failed to scan article row", sl.Err(err))
			continue
		}

		articles = append(articles, article)
	}

	if err = rows.Err(); err != nil {
		log.Error("rows iteration error", sl.Err(err))
		return nil, fmt.Errorf("%s: %w", op, err)
	}

	return articles, nil
}

func (r *ArticleRepo) SelectArticleById(id int) (structures.Article, error) {
	const op = "postgres.article_repo.SelectArticleById"
	log := r.log.With("op", op)

	var artical structures.Article
	query := "SELECT id, title, content, category, author, readTime, slug FROM articles WHERE id=$1"

	err := r.db.QueryRow(query, id).Scan(&artical.Id, &artical.Title, &artical.Content, &artical.Category, &artical.Author, &artical.ReadTime, &artical.Slug)
	if err != nil {
		log.Error("Error with query", sl.Err(err))
		return artical, err
	}

	return artical, nil
}

func (r *ArticleRepo) DeleteArticle(id int) error {
	const op = "postgres.article_repo.DeleteArtical"
	log := r.log.With("op", op)

	query := "DELETE FROM articles WHERE id = $1"

	result, err := r.db.Exec(query, id)
	if err != nil {
		log.Error("Error with deleting artical by id", sl.Err(err))
		return fmt.Errorf("Error with deleting artical by id: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		log.Info("No artical found with ID", slog.Int("id", id))
	} else {
		log.Info("artical with ID deleted", slog.Int("id", id))
	}

	return nil
}

func (r *ArticleRepo) UpdateArticle(a *structures.Article) error {
	const op = "postgres.article_repo.UpdateArticle"
	log := r.log.With("op", op)

	query := `
		UPDATE articles
		SET title = $1,
		    content = $2,
		    category = $3,
		    author = $4,
		    read_time = $5,
		    slug = $6
		WHERE id = $7
	`

	result, err := r.db.Exec(query,
		a.Title,
		a.Content,
		a.Category,
		a.Author,
		a.ReadTime,
		a.Slug,
		a.Id,
	)

	if err != nil {
		log.Error("failed to update article", sl.Err(err))
		return fmt.Errorf("%s: %w", op, err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		log.Error("failed to get affected rows", sl.Err(err))
		return fmt.Errorf("%s: %w", op, err)
	}

	if rowsAffected == 0 {
		log.Info("no article found with ID", slog.Int64("id", a.Id))
		return fmt.Errorf("%s: no article with id=%d", op, a.Id)
	}

	log.Info("article updated", slog.Int64("id", a.Id))
	return nil
}
