package utils

import (
	"fmt"
	"math/rand"
	"time"
)

func Generate4DigitCode() string {
	src := rand.NewSource(time.Now().UnixNano())
	r := rand.New(src)
	code := r.Intn(9000) + 1000
	return fmt.Sprintf("%04d", code)
}
