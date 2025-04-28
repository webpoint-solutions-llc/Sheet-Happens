package services

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"html/template"
	"log"
	"net/smtp"
	"os"
	"strings"
	"time"

	"github.com/webpointsolutions/sheet-happens/internal/config"
)

func SendEmailWithAttachment(
	params EmailRequestParams,
) error {
	smtpHost := config.Env.SMTPHost
	smtpPort := config.Env.SMTPPort
	username := config.Env.SMTPUsername
	password := config.Env.SMTPPassword

	html, err := getHTMLTemplate(params.EmailTemplate, params.TemplateParams)
	if err != nil {
		return nil
	}
	params.html = html
	params.From = config.Env.SMTPUsername

	address := smtpHost + ":" + smtpPort
	auth := smtp.PlainAuth("", username, password, smtpHost)

	var recipients []string

	recipients = append(recipients, params.To)
	recipients = append(recipients, params.CC...)

	emailTmpl, err := smtpWithAttachmentEmailSender(params)
	if err != nil {
		log.Println("Error creating SMTP content: ", err.Error())
		return err
	}

	err = smtp.SendMail(address, auth, params.From, recipients, emailTmpl)
	if err != nil {
		log.Println("Unable send mail to", err.Error())
		return err
	}

	return nil
}

func smtpWithAttachmentEmailSender(params EmailRequestParams) ([]byte, error) {
	env := config.Env
	senderEmail := env.SMTPUsername

	if params.From != "" {
		senderEmail = params.From
	}
	// Prepare recipients

	// Email Headers
	var msg bytes.Buffer
	msg.WriteString(fmt.Sprintf("From: %s\r\n", senderEmail))
	msg.WriteString(fmt.Sprintf("To: %s\r\n", params.To))
	msg.WriteString(fmt.Sprintf("Cc: %s\r\n", strings.Join(params.CC, ", ")))
	msg.WriteString(fmt.Sprintf("Bcc: %s\r\n", strings.Join(params.BCC, ", ")))
	msg.WriteString(fmt.Sprintf("Subject: %s\r\n", params.Subject))
	msg.WriteString("MIME-Version: 1.0\r\n")

	boundary := "MIMEBoundary"

	msg.WriteString(fmt.Sprintf(`Content-Type: multipart/mixed; boundary="%s"`+"\r\n\r\n", boundary))

	msg.WriteString(fmt.Sprintf("--%s\r\n", boundary))
	msg.WriteString(`Content-Type: text/html; charset="UTF-8"` + "\r\n\r\n")
	msg.WriteString(params.html + "\r\n\r\n")

	// Attach Files
	for _, attachment := range params.EmailAttachment {
		encoded := base64.StdEncoding.EncodeToString(attachment.Data)
		msg.WriteString(fmt.Sprintf("--%s\r\n", boundary))
		msg.WriteString(fmt.Sprintf(`Content-Type: %s; name="%s"`+"\r\n", attachment.ContentType, attachment.FileName))
		msg.WriteString("Content-Transfer-Encoding: base64\r\n")
		msg.WriteString(fmt.Sprintf(`Content-Disposition: attachment; filename="%s"`+"\r\n\r\n", attachment.FileName))
		msg.WriteString(encoded + "\r\n\r\n")
	}

	msg.WriteString(fmt.Sprintf("--%s--", boundary))

	return msg.Bytes(), nil
}

type EmailRequestParams struct {
	To   string
	From string
	CC   []string
	BCC  []string

	Subject         string
	html            string
	EmailAttachment []EmailAttachment

	TemplateParams any
	EmailTemplate  string
}

type EmailAttachment struct {
	FileName    string
	Data        []byte
	ContentType string
}

func getHTMLTemplate(templateName string, data any) (string, error) {
	var templateBuffer bytes.Buffer

	temp := fmt.Sprintf("./templates/%s.html", templateName)
	htmlData, err := os.ReadFile(temp)
	if err != nil {
		return "", err
	}

	funcMap := template.FuncMap{
		"eq": func(a, b string) bool {
			return a == b
		},
		"currentYear": func() string {
			// Get the current year dynamically
			return fmt.Sprintf("%d", time.Now().Year())
		},
		"add": func(a, b int) int {
			return a + b
		},
	}

	htmlTemplate, err := template.New("email.html").Funcs(funcMap).Parse(string(htmlData))
	if err != nil {
		return "", err
	}

	err = htmlTemplate.ExecuteTemplate(&templateBuffer, "email.html", data)
	if err != nil {
		return "", err
	}

	return templateBuffer.String(), nil
}
