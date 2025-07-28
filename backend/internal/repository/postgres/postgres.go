package postgres

import (
	"database/sql"
	"fmt"
	"log/slog"

	"github.com/QwaQ-dev/bala/internal/config"
	"github.com/QwaQ-dev/bala/pkg/sl"
	_ "github.com/lib/pq"
)

func InitDatabase(cfg config.Database, log *slog.Logger) (*sql.DB, error) {
	db, err := sql.Open("postgres", fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		cfg.DBhost, cfg.Port, cfg.DBusername, cfg.DBpassword, cfg.DBname, cfg.SSLMode,
	))
	if err != nil {
		log.Error("Error with connecting to database", sl.Err(err))
		return nil, err
	}

	err = db.Ping()

	if err != nil {
		log.Error("Error with pinging database", sl.Err(err))
		return nil, err
	}

	log.Info("Database connect successfully")
	return db, nil
}
