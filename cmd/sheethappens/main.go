package main

import (
	"flag"
	"log"
	"os"

	"github.com/webpointsolutions/sheet-happens/internal/services"
)

var (
	branch = flag.String("b", "", "Specific branch name (optional)")
	days   = flag.Int("t", 0, "Number of days to look back for commits (0 = all history)")
	dir    = flag.String("d", ".", "Git repository directory (default: current directory)")
)

func init() {
	flag.Parse()
}

func main() {
	if _, err := os.Stat(*dir); os.IsNotExist(err) {
		log.Fatalf("Provided directory does not exist: %s", *dir)
	}

	services.GenerateCSV(*dir, *branch, *days)
}
