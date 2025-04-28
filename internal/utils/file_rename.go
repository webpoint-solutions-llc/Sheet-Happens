package utils

import (
	"path/filepath"
	"strings"
)

func GetDestinationPath(filename string) string {
	ext := filepath.Ext(filename) // file extension
	name := strings.TrimSuffix(filename, ext)
	finalName := name + "_final" + ext

	return filepath.Join("out", finalName)
}
