package responder

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/webpointsolutions/sheet-happens/internal/types"
)

func Success(c echo.Context, res any, status ...int) error {
	statusCode := http.StatusOK
	if len(status) != 0 {
		statusCode = status[0]
	}

	return c.JSON(statusCode, types.ApiResponese{Success: true, Payload: res})
}
