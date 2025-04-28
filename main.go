package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/webpointsolutions/sheet-happens/internal/config"
	"github.com/webpointsolutions/sheet-happens/internal/server"
	"github.com/webpointsolutions/sheet-happens/internal/services"
)

var (
	servflag = flag.Bool("serv", false, "serve http server ui")
	branch   = flag.String("b", "", "Specific branch name (optional)")
	days     = flag.Int("t", 0, "Number of days to look back for commits (0 = all history)")
	dir      = flag.String("d", ".", "Git repository directory (default: current directory)")
)

func init() {
	flag.Parse()
	config.LoadEnv()
}

func main() {
	if *servflag {
		handler := server.NewServer()

		fmt.Println("Lisening on port 8080")
		http.ListenAndServe("0.0.0.0:8080", handler)
	}

	if _, err := os.Stat(*dir); os.IsNotExist(err) {
		log.Fatalf("Provided directory does not exist: %s", *dir)
	}

	services.GenerateCSV(*dir, *branch, *days)
}
