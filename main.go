package main

import (
	"flag"
	"fmt"

	"github.com/webpointsolutions/sheet-happens/internal/server"
)

var uiflag = flag.Bool("serv", false, "serve http server ui")

func init() {
	flag.Parse()
}

func main() {
	if *uiflag {
		mux := server.NewServer()
		fmt.Println("Lisening on port 8080")

		mux.Logger.Fatal(mux.Start("0.0.0.0:8080"))
	}

	// TODO: add cli args
}
