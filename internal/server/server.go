package server

import (
	"html/template"
	"io"
	"net/http"

	"github.com/labstack/echo/v4"
)

type TemplateRenderer struct {
	templates *template.Template
}

func (t *TemplateRenderer) Render(w io.Writer, name string, data any, c echo.Context) error {
	return t.templates.ExecuteTemplate(w, name, data)
}

func NewServer() *echo.Echo {
	renderer := &TemplateRenderer{
		templates: template.Must(template.ParseFiles("templates/index.html")),
	}

	mux := echo.New()

	mux.Renderer = renderer

	mux.GET("/", func(c echo.Context) error {
		data := map[string]any{
			"Title": "Welcome to My Page",
		}

		return c.Render(http.StatusOK, "index.html", data)
	})

	return mux
}
