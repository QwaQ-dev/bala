package postgres

import (
	"database/sql"
	"fmt"
	"log/slog"

	"github.com/QwaQ-dev/bala/internal/structures"
	"github.com/QwaQ-dev/bala/pkg/sl"
)

type ChecklistRepo struct {
	log *slog.Logger
	db  *sql.DB
}

func NewChecklistRepo(log *slog.Logger, db *sql.DB) *ChecklistRepo {
	return &ChecklistRepo{log: log, db: db}
}

func (r *ChecklistRepo) InsertChecklist(c structures.Checklist) error {
	const op = "postgres.checklist_repo.InsertChecklist"
	log := r.log.With("op", op)

	query := `
		INSERT INTO checklists (title, description, for_age, slug)
		VALUES ($1, $2, $3, $4)
	`

	_, err := r.db.Exec(query, c.Title, c.Description, c.ForAge, c.Slug)
	if err != nil {
		log.Error("failed to insert checklist", sl.Err(err))
		return fmt.Errorf("%s: %w", op, err)
	}

	log.Info("checklist inserted", slog.String("slug", c.Slug))
	return nil
}

func (r *ChecklistRepo) SelectAllChecklists() ([]structures.Checklist, error) {
	const op = "postgres.checklist_repo.SelectAllChecklists"
	log := r.log.With("op", op)

	query := `
		SELECT id, title, description, for_age, slug
		FROM checklists
		ORDER BY id DESC
	`

	rows, err := r.db.Query(query)
	if err != nil {
		log.Error("failed to query checklists", sl.Err(err))
		return nil, fmt.Errorf("%s: %w", op, err)
	}
	defer rows.Close()

	var checklists []structures.Checklist

	for rows.Next() {
		var c structures.Checklist
		err := rows.Scan(&c.Id, &c.Title, &c.Description, &c.ForAge, &c.Slug)
		if err != nil {
			log.Error("failed to scan checklist", sl.Err(err))
			continue
		}
		checklists = append(checklists, c)
	}

	if err = rows.Err(); err != nil {
		log.Error("row iteration error", sl.Err(err))
		return nil, fmt.Errorf("%s: %w", op, err)
	}

	return checklists, nil
}

func (r *ChecklistRepo) SelectChecklistByID(id int64) (structures.Checklist, error) {
	const op = "postgres.checklist_repo.SelectChecklistByID"
	log := r.log.With("op", op)

	var c structures.Checklist

	query := `
		SELECT id, title, description, for_age, slug
		FROM checklists
		WHERE id = $1
	`

	err := r.db.QueryRow(query, id).Scan(&c.Id, &c.Title, &c.Description, &c.ForAge, &c.Slug)
	if err != nil {
		log.Error("failed to select checklist by ID", sl.Err(err))
		return c, fmt.Errorf("%s: %w", op, err)
	}

	return c, nil
}

func (r *ChecklistRepo) UpdateChecklist(c *structures.Checklist) error {
	const op = "postgres.checklist_repo.UpdateChecklist"
	log := r.log.With("op", op)

	query := `
		UPDATE checklists
		SET title = $1,
		    description = $2,
		    for_age = $3,
		    slug = $4
		WHERE id = $5
	`

	result, err := r.db.Exec(query, c.Title, c.Description, c.ForAge, c.Slug, c.Id)
	if err != nil {
		log.Error("failed to update checklist", sl.Err(err))
		return fmt.Errorf("%s: %w", op, err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		log.Error("failed to get rows affected", sl.Err(err))
		return fmt.Errorf("%s: %w", op, err)
	}

	if rowsAffected == 0 {
		log.Info("no checklist found with ID", slog.Int64("id", c.Id))
		return fmt.Errorf("%s: no checklist with id=%d", op, c.Id)
	}

	log.Info("checklist updated", slog.Int64("id", c.Id))
	return nil
}

func (r *ChecklistRepo) DeleteChecklist(id int64) error {
	const op = "postgres.checklist_repo.DeleteChecklist"
	log := r.log.With("op", op)

	query := `DELETE FROM checklists WHERE id = $1`

	result, err := r.db.Exec(query, id)
	if err != nil {
		log.Error("failed to delete checklist", sl.Err(err))
		return fmt.Errorf("%s: %w", op, err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		log.Error("failed to get affected rows", sl.Err(err))
		return fmt.Errorf("%s: %w", op, err)
	}

	if rowsAffected == 0 {
		log.Warn("no checklist found to delete", slog.Int64("id", id))
		return fmt.Errorf("%s: checklist with id=%d not found", op, id)
	}

	log.Info("checklist deleted", slog.Int64("id", id))
	return nil
}
