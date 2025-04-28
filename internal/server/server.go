package server

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/webpointsolutions/sheet-happens/internal/types"
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

	mux.POST("/login", func(c echo.Context) error {
		var body types.LoginRequest
		if err := c.Bind(&body); err != nil {
			return echo.NewHTTPError(http.StatusUnauthorized, err)
		}

		if !strings.Contains(body.Email, "@webpoint.io") {
			return echo.NewHTTPError(http.StatusUnauthorized, "invalid email provided")
		}

		emailSplited := strings.Split(body.Email, "@")

		username := func() string {
			name := emailSplited[0]
			capitalize := func(s string) string {
				if len(s) == 0 {
					return s
				}
				return strings.ToUpper(s[:1]) + strings.ToLower(s[1:])
			}

			if !strings.Contains(name, ".") {
				return capitalize(name)
			}

			names := strings.Split(name, ".")
			return fmt.Sprintf("%s %s", capitalize(names[0]), capitalize(names[1]))
		}()

		res := types.LoginResponse{Name: username}

		return c.JSON(http.StatusOK, types.ApiResponese{Success: true, Payload: res})
	})

	return mux
}
