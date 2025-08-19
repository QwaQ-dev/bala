package handlers

import (
	"log/slog"
	"strconv"

	"github.com/QwaQ-dev/bala/internal/services"
	"github.com/QwaQ-dev/bala/internal/structures"
	"github.com/QwaQ-dev/bala/pkg/sl"
	"github.com/gofiber/fiber/v2"
)

type ChecklistHandler struct {
	checklistService *services.ChecklistService
	log              *slog.Logger
}

func NewChecklistHandler(checklistService *services.ChecklistService, log *slog.Logger) *ChecklistHandler {
	return &ChecklistHandler{
		checklistService: checklistService,
		log:              log,
	}
}

func (h *ChecklistHandler) CreateChecklist(c *fiber.Ctx) error {
	const op = "handlers.checklist_handler.CreateChecklist"
	log := h.log.With("op", op)

	var checklist structures.Checklist
	if err := c.BodyParser(&checklist); err != nil {
		log.Error("failed to parse checklist", slog.Any("err", err))
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid body"})
	}

	if err := h.checklistService.CreateChecklist(checklist); err != nil {
		log.Error("failed to create checklist", slog.Any("err", err))
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create checklist"})
	}

	return c.Status(201).JSON(fiber.Map{
		"message": "Checklist created",
	})
}

func (h *ChecklistHandler) GetAllChecklists(c *fiber.Ctx) error {
	const op = "handlers.checklist_handler.GetAllChecklists"
	log := h.log.With("op", op)

	checklists, err := h.checklistService.GetAllChecklists()
	if err != nil {
		log.Error("failed to fetch checklists", sl.Err(err))
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch checklists"})
	}

	log.Info("checklists", checklists)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"checklists": checklists,
	})
}

func (h *ChecklistHandler) GetOneChecklist(c *fiber.Ctx) error {
	const op = "handlers.checklist_handler.GetOneChecklist"
	log := h.log.With("op", op)

	idStr := c.Params("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		log.Error("invalid checklist id", slog.String("id", idStr))
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid ID"})
	}

	checklist, err := h.checklistService.GetChecklistByID(id)
	if err != nil {
		log.Error("failed to get checklist by id", slog.Any("err", err))
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Checklist not found"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"checklist": checklist,
	})
}

func (h *ChecklistHandler) UpdateChecklist(c *fiber.Ctx) error {
	const op = "handlers.checklist_handler.UpdateChecklist"
	log := h.log.With("op", op)

	var checklist structures.Checklist
	if err := c.BodyParser(&checklist); err != nil {
		log.Error("failed to parse checklist body", slog.Any("err", err))
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid body"})
	}

	if checklist.Id == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "ID is required"})
	}

	if err := h.checklistService.UpdateChecklist(&checklist); err != nil {
		log.Error("failed to update checklist", slog.Int64("id", checklist.Id), slog.Any("err", err))
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update checklist"})
	}

	return c.Status(200).JSON(fiber.Map{
		"message": "Checklist has been updated",
	})
}

func (h *ChecklistHandler) DeleteChecklist(c *fiber.Ctx) error {
	const op = "handlers.checklist_handler.DeleteChecklist"
	log := h.log.With("op", op)

	idStr := c.Params("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		log.Error("invalid checklist id", slog.String("id", idStr))
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid ID"})
	}

	if err := h.checklistService.DeleteChecklist(id); err != nil {
		log.Error("failed to delete checklist", slog.Int64("id", id), slog.Any("err", err))
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete checklist"})
	}

	return c.Status(200).JSON(fiber.Map{
		"message": "Checklist has been deleted",
	})
}
