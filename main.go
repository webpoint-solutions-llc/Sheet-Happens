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

var servflag = flag.Bool("serv", false, "serve http server ui")

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

	if len(os.Args) < 2 {
		log.Fatal("please provide the git directory")
	}

	folder := os.Args[1]

	services.GenerateCSV(folder)
}
