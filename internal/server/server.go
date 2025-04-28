package server

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/webpointsolutions/sheet-happens/internal/routes"
)

func NewServer() http.Handler {
	mux := echo.New()

	mux.Pre(middleware.RemoveTrailingSlash())
	mux.Use(middleware.Secure())
	mux.Use(middleware.RequestID())
	mux.Use(middleware.Logger())

	mux.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:     []string{"*"},
		AllowHeaders:     []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept},
		ExposeHeaders:    []string{echo.HeaderContentDisposition},
		AllowCredentials: true,
	}))

	mux.GET("/", func(c echo.Context) error {
		return c.String(http.StatusOK, "up and running")
	})

	routes.Routes(mux.Group(""))

	mux.RouteNotFound("/*", func(c echo.Context) error {
		return echo.NewHTTPError(http.StatusNotFound, "Route not found")
	})

	return mux
}
