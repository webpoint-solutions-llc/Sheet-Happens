package services

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
)

type blockPayload struct {
	Blocks []block `json:"blocks"`
}

type block struct {
	Type    string      `json:"type"`
	Text    *textObject `json:"text,omitempty"`
	BlockID string      `json:"block_id,omitempty"`
}

type textObject struct {
	Type string `json:"type"`
	Text string `json:"text"`
}

type MessageBody struct {
	FileName string `json:"file_name"`
	Url      string `json:"url"`
}

func sendSlackNotification(webhookURL string, body MessageBody) error {
	payload := blockPayload{
		Blocks: []block{
			{
				Type: "section",
				Text: &textObject{
					Type: "mrkdwn",
					Text: "*󱝏 Notice: Work Log Sent*",
				},
			},
			{
				Type: "section",
				Text: &textObject{
					Type: "mrkdwn",
					Text: fmt.Sprintf(
						"FileName: *%s*\nURL: *%s*",
						body.FileName,
						body.Url,
					),
				},
			},
		},
	}

	// Convert the message payload to JSON
	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("could not marshal message payload: %w", err)
	}

	// Send POST request to the Slack webhook
	resp, err := http.Post(webhookURL, "application/json", bytes.NewBuffer(jsonPayload))
	if err != nil {
		return fmt.Errorf("failed to send message to Slack: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("non-OK HTTP status: %s", resp.Status)
	}

	return nil
}

func SendSlackMessage(message MessageBody) error {
	webhookURL := os.Getenv("SLACK_WEBHOOK_URL")
	if webhookURL == "" {
		return errors.New("Slack Webhook url not found")
	}
	return sendSlackNotification(webhookURL, message)
}
