package services

import (
	"fmt"
	"log/slog"

	"github.com/QwaQ-dev/bala/internal/config"
	"github.com/QwaQ-dev/bala/internal/repository/postgres"
	"github.com/QwaQ-dev/bala/internal/structures"
)

type ChecklistService struct {
	repo *postgres.ChecklistRepo
	log  *slog.Logger
	cfg  *config.Config
}

func NewChecklistService(repo *postgres.ChecklistRepo, log *slog.Logger, cfg *config.Config) *ChecklistService {
	return &ChecklistService{
		repo: repo,
		log:  log,
		cfg:  cfg,
	}
}

func (s *ChecklistService) CreateChecklist(c structures.Checklist) error {
	const op = "service.checklist.CreateChecklist"
	log := s.log.With("op", op)

	log.Info("Creating checklist", slog.String("title", c.Title))

	err := s.repo.InsertChecklist(c)
	if err != nil {
		log.Error("failed to create checklist", slog.Any("err", err))
		return fmt.Errorf("%s: %w", op, err)
	}

	log.Info("Checklist created", slog.String("slug", c.Slug))
	return nil
}

func (s *ChecklistService) GetAllChecklists() ([]structures.Checklist, error) {
	const op = "service.checklist.GetAllChecklists"
	log := s.log.With("op", op)

	checklists, err := s.repo.SelectAllChecklists()
	if err != nil {
		log.Error("failed to get all checklists", slog.Any("err", err))
		return nil, fmt.Errorf("%s: %w", op, err)
	}

	return checklists, nil
}

func (s *ChecklistService) GetChecklistByID(id int64) (structures.Checklist, error) {
	const op = "service.checklist.GetChecklistByID"
	log := s.log.With("op", op)

	checklist, err := s.repo.SelectChecklistByID(id)
	if err != nil {
		log.Error("failed to get checklist by id", slog.Int64("id", id), slog.Any("err", err))
		return checklist, fmt.Errorf("%s: %w", op, err)
	}

	return checklist, nil
}

func (s *ChecklistService) UpdateChecklist(c *structures.Checklist) error {
	const op = "service.checklist.UpdateChecklist"
	log := s.log.With("op", op)

	err := s.repo.UpdateChecklist(c)
	if err != nil {
		log.Error("failed to update checklist", slog.Int64("id", c.Id), slog.Any("err", err))
		return fmt.Errorf("%s: %w", op, err)
	}

	s.log.Info("Checklist updated", slog.Int64("id", c.Id))
	return nil
}

func (s *ChecklistService) DeleteChecklist(id int64) error {
	const op = "service.checklist.DeleteChecklist"
	log := s.log.With("op", op)

	err := s.repo.DeleteChecklist(id)
	if err != nil {
		log.Error("failed to delete checklist", slog.Int64("id", id), slog.Any("err", err))
		return fmt.Errorf("%s: %w", op, err)
	}

	s.log.Info("Checklist deleted", slog.Int64("id", id))
	return nil
}
