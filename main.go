package main

import (
	"fmt"
	"net/http"

	"github.com/webpointsolutions/sheet-happens/internal/config"
	"github.com/webpointsolutions/sheet-happens/internal/server"
)

func init() {
	config.LoadEnv()
}

func main() {
	handler := server.NewServer()

	fmt.Println("Lisening on port 8080")
	http.ListenAndServe("0.0.0.0:8080", handler)
}
