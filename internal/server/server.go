package server

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func NewServer() http.Handler {
	mux := echo.New()

	mux.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:     []string{"*"},
		AllowHeaders:     []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept},
		ExposeHeaders:    []string{echo.HeaderContentDisposition},
		AllowCredentials: true,
	}))

	mux.GET("/csv/:id", func(c echo.Context) error {
		id := c.Param("id")
		filename := id + ".csv"
		filePath := filepath.Join("out", filename) // looks inside ./out/{id}

		if _, err := os.Stat(filePath); os.IsNotExist(err) {
			fmt.Println("")
			return echo.NewHTTPError(http.StatusNotFound, "file not found")
		}

		return c.File(filePath)
	})

	return mux
}
