package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
)

type CSVuploadResponse struct {
	Success bool    `json:"success"`
	Payload Payload `json:"payload"`
}

type Payload struct {
	Filename string `json:"filename"`
	Message  string `json:"message"`
}

func UploadCSVFromBuffer(csvData *bytes.Buffer, backendURL, filename string) (string, error) {
	var body bytes.Buffer
	writer := multipart.NewWriter(&body)

	part, err := writer.CreateFormFile("file", filename)
	if err != nil {
		return "", fmt.Errorf("failed to create form file: %w", err)
	}

	// Copy in-memory CSV into the form
	if _, err := io.Copy(part, csvData); err != nil {
		return "", fmt.Errorf("failed to copy CSV data: %w", err)
	}

	if err := writer.Close(); err != nil {
		return "", fmt.Errorf("failed to close multipart writer: %w", err)
	}

	req, err := http.NewRequest("POST", backendURL+"/csv", &body)
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("upload failed: %s", string(respBody))
	}

	var res CSVuploadResponse
	_ = json.Unmarshal(respBody, &res)

	return res.Payload.Filename, nil
}
