package postgres

import (
	"database/sql"
	"embed"
	"fmt"
	"log/slog"

	"github.com/QwaQ-dev/bala/internal/config"
	"github.com/QwaQ-dev/bala/pkg/sl"
	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	migrateiofs "github.com/golang-migrate/migrate/v4/source/iofs"
	_ "github.com/lib/pq"
)

//go:embed migrations/*.sql
var migrationsFS embed.FS

func InitDatabase(cfg config.Database, log *slog.Logger) (*sql.DB, error) {
	db, err := sql.Open("postgres", fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		cfg.DBhost, cfg.Port, cfg.DBusername, cfg.DBpassword, cfg.DBname, cfg.SSLMode,
	))
	if err != nil {
		log.Error("Error with connecting to database", sl.Err(err))
		return nil, err
	}

	if err = db.Ping(); err != nil {
		log.Error("Error with pinging database", sl.Err(err))
		return nil, err
	}

	driver, err := postgres.WithInstance(db, &postgres.Config{})
	if err != nil {
		log.Error("failed to create migrate driver", sl.Err(err))
		return nil, err
	}

	sourceDriver, err := migrateiofs.New(migrationsFS, "migrations")
	if err != nil {
		log.Error("failed to create iofs source driver", sl.Err(err))
		return nil, err
	}

	m, err := migrate.NewWithInstance(
		"iofs",
		sourceDriver,
		"postgres",
		driver,
	)
	runMigrations(m, "down")
	runMigrations(m, "up")
	if err != nil {
		log.Error("failed to create migrate instance", sl.Err(err))
		return nil, err
	}

	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		log.Error("migration up failed", sl.Err(err))
		return nil, err
	}

	log.Info("Database connected successfully")
	return db, nil
}

func runMigrations(m *migrate.Migrate, direction string) error {
	switch direction {
	case "up":
		err := m.Up()
		if err != nil && err != migrate.ErrNoChange {
			return err
		}
	case "down":
		err := m.Down()
		if err != nil && err != migrate.ErrNoChange {
			return err
		}
	case "drop":
		err := m.Drop()
		if err != nil {
			return err
		}
	default:
		return fmt.Errorf("unknown migration direction: %s", direction)
	}
	return nil
}
