package config

import (
	"fmt"
	"os"

	_ "github.com/joho/godotenv/autoload"
)

type envStruct struct {
	SMTPUsername string
	SMTPPassword string
	SMTPHost     string
	SMTPPort     string
	FrontHost    string
}

var Env *envStruct

func LoadEnv() *envStruct {
	Env = &envStruct{
		SMTPUsername: getEnv("SMTP_USERNAME"),
		SMTPPassword: getEnv("SMTP_PASSWORD"),
		SMTPHost:     getEnv("SMTP_HOST"),
		SMTPPort:     getEnv("SMTP_PORT"),
		FrontHost:    getEnv("FRONTEND_HOST"),
	}
	return Env
}

// getEnv retrieves the value of the environment variable or panics if not set
func getEnv(varName string) string {
	value, exists := os.LookupEnv(varName)
	if !exists {
		panic(fmt.Sprintf("%s must be set", varName))
	}
	return value
}

// // getOptEnv retrieves the value of the environment variable or returns a default value if not set
// func getOptEnv(varName, defaultValue string) string {
// 	value, exists := os.LookupEnv(varName)
// 	if !exists {
// 		return defaultValue
// 	}
// 	return value
// }
