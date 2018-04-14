package main

import (
	"fmt"
	"net/http"
)

func main() {
	fmt.Printf("Starting server on port 8080")
	http.Handle("/", http.FileServer(http.Dir("./ui")))
	http.ListenAndServe(":8080", nil)
}
