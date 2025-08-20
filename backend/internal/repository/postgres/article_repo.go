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
	return &ArticleRepo{log: log, db: db}
}

// -------------------- Insert --------------------
func (r *ArticleRepo) InsertArticle(article structures.Article) (int, error) {
	const op = "postgres.article_repo.InsertArticle"
	log := r.log.With("op", op)

	query := `
		INSERT INTO articles (title, content, category, author, read_time, slug)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id
	`

	var id int
	err := r.db.QueryRow(query,
		article.Title,
		article.Content,
		article.Category,
		article.Author,
		article.ReadTime,
		article.Slug,
	).Scan(&id)
	if err != nil {
		log.Error("failed to insert article", sl.Err(err))
		return 0, err
	}

	log.Debug("article inserted", slog.Int("id", id))
	return id, nil
}

// -------------------- Select --------------------
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

		// подтягиваем файлы
		files, err := r.SelectArticleFiles(article.Id)
		if err != nil {
			log.Error("failed to fetch article files", sl.Err(err))
			continue
		}
		article.Files = files

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

	var article structures.Article
	query := `
		SELECT id, title, content, category, author, read_time, slug
		FROM articles
		WHERE id = $1
	`

	err := r.db.QueryRow(query, id).Scan(
		&article.Id,
		&article.Title,
		&article.Content,
		&article.Category,
		&article.Author,
		&article.ReadTime,
		&article.Slug,
	)
	if err != nil {
		log.Error("failed to query article", sl.Err(err))
		return article, err
	}

	files, err := r.SelectArticleFiles(article.Id)
	if err != nil {
		log.Error("failed to fetch article files", sl.Err(err))
		return article, err
	}
	article.Files = files

	return article, nil
}

// -------------------- Update --------------------
func (r *ArticleRepo) UpdateArticle(a *structures.Article, id int) error {
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
		id,
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
		return fmt.Errorf("%s: no article with id=%d", op, id)
	}

	log.Info("article updated", slog.Int("id", id))
	return nil
}

// -------------------- Delete --------------------
func (r *ArticleRepo) DeleteArticle(id int) error {
	const op = "postgres.article_repo.DeleteArticle"
	log := r.log.With("op", op)

	query := "DELETE FROM articles WHERE id = $1"

	result, err := r.db.Exec(query, id)
	if err != nil {
		log.Error("failed to delete article", sl.Err(err))
		return fmt.Errorf("%s: %w", op, err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		log.Info("no article found with ID", slog.Int("id", id))
	} else {
		log.Info("article deleted", slog.Int("id", id))
	}

	return nil
}

// -------------------- Files --------------------
func (r *ArticleRepo) InsertArticleFile(articleID int, path, fileType string) error {
	const op = "postgres.article_repo.InsertArticleFile"
	query := `INSERT INTO article_files (article_id, path, type) VALUES ($1, $2, $3)`
	_, err := r.db.Exec(query, articleID, path, fileType)
	if err != nil {
		r.log.Error("failed to insert article file", sl.Err(err))
		return fmt.Errorf("%s: %w", op, err)
	}
	return nil
}

func (r *ArticleRepo) SelectArticleFiles(articleID int) ([]structures.ArticleFile, error) {
	const op = "postgres.article_repo.SelectArticleFiles"
	log := r.log.With("op", op)

	query := `SELECT id, path, type FROM article_files WHERE article_id = $1`

	rows, err := r.db.Query(query, articleID)
	if err != nil {
		log.Error("failed to fetch article files", sl.Err(err))
		return nil, fmt.Errorf("%s: %w", op, err)
	}
	defer rows.Close()

	var files []structures.ArticleFile
	for rows.Next() {
		var f structures.ArticleFile
		if err := rows.Scan(&f.Id); err != nil {
			log.Error("failed to scan file row", sl.Err(err))
			continue
		}
		files = append(files, f)
	}

	return files, nil
}
