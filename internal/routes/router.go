package routes

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"net/mail"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/webpointsolutions/sheet-happens/internal/responder"
	"github.com/webpointsolutions/sheet-happens/internal/services"
	"github.com/webpointsolutions/sheet-happens/internal/types"
	"github.com/webpointsolutions/sheet-happens/internal/utils"
)

func Routes(r *echo.Group) {
	r.GET("/csv/:id", func(c echo.Context) error {
		id := c.Param("id")
		filename := id + ".csv"
		filePath := filepath.Join("out", filename) // looks inside ./out/{id}

		if _, err := os.Stat(filePath); os.IsNotExist(err) {
			fmt.Println("")
			return echo.NewHTTPError(http.StatusNotFound, "file not found")
		}

		return c.File(filePath)
	})

	r.POST("/login", func(c echo.Context) error {
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

		return responder.Success(c, res)
	})

	r.POST("/csv", func(c echo.Context) error {
		var to string
		var cc []string
		receiver := c.QueryParam("receiver")
		if receiver == "" {
			to = "aashutosh.poudel@webpoint.io"
		} else {
			addressList, err := mail.ParseAddressList(receiver)
			if err != nil {
				return echo.NewHTTPError(http.StatusBadRequest, "invalid receiver format")
			}

			if len(addressList) > 0 {
				to = addressList[0].Address
			}

			if len(addressList) > 1 {
				for _, addr := range addressList[1:] {
					cc = append(cc, addr.Address)
				}
			}
		}

		file, err := c.FormFile("file")
		if err != nil {
			return err
		}

		src, err := file.Open()
		if err != nil {
			return err
		}
		defer src.Close()

		// Create destination file
		dstPath, newFileName := utils.GetDestinationPath(file.Filename)
		dst, err := os.Create(dstPath)
		if err != nil {
			return err
		}
		defer dst.Close()

		// Copy content
		if _, err := io.Copy(dst, src); err != nil {
			return err
		}

		// send email on background
		go func() {
			attachment := services.EmailAttachment{
				FileName:    newFileName,
				ContentType: "application/octet-stream",
			}

			attachment.Data, err = os.ReadFile(dstPath)
			if err != nil {
				log.Printf("could not read the file after saving: %v \n", err)
				return
			}

			data := map[string]any{
				"Name": "Aashutosh",
				"Link": services.GetFileFrontendUrl(newFileName),
			}

			reponame := utils.GetRepoNameFromFileName(file.Filename)

			location, err := time.LoadLocation("Asia/Kathmandu")
			if err != nil {
				fmt.Println("Error loading location:", err)
				return
			}

			// Get the current time in UTC +5:45
			currentTime := time.Now().In(location)

			// Format the time as "March 25 2024, 5:45 PM"
			formattedTime := currentTime.Format("January 2 2006, 3:04 PM")

			subject := fmt.Sprintf("TimeSheet received for %s, %s", reponame, formattedTime)

			emailParams := services.EmailRequestParams{
				To:              to,
				CC:              cc,
				EmailAttachment: []services.EmailAttachment{attachment},
				EmailTemplate:   "email",
				Subject:         subject,
				TemplateParams:  data,
			}

			emailError := services.SendEmailWithAttachment(emailParams)

			if emailError != nil {
				log.Println("", emailError)
				return
			}
		}()

		return responder.Success(c, "Successfully uploaded the CSV")
	})
}
