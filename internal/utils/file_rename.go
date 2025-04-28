package utils

import (
	"log"
	"path/filepath"
	"strings"

	"github.com/go-git/go-git/v5"
)

func GetDestinationPath(filename string) string {
	ext := filepath.Ext(filename) // file extension
	name := strings.TrimSuffix(filename, ext)
	finalName := name + "_final" + ext

	return filepath.Join("out", finalName)
}

func GetRepoNameFromPath(path string) string {
	_, repoName := filepath.Split(path)

	repoName = strings.TrimSuffix(repoName, ".git")
	return repoName
}

func GetRepoNameFromFileName(filename string) string {
	baseName := filepath.Base(filename)

	ext := filepath.Ext(baseName)
	baseName = baseName[:len(baseName)-len(ext)]

	parts := strings.Split(baseName, "_")
	if len(parts) > 1 {
		return parts[1]
	}
	return ""
}

func GetRepoNameFromRepo(repo *git.Repository) string {
	worktree, err := repo.Worktree()
	if err != nil {
		log.Fatal("Error getting worktree:", err)
	}

	repoDir := worktree.Filesystem.Root()

	_, repoName := filepath.Split(repoDir)

	repoName = strings.TrimSuffix(repoName, ".git")
	return repoName
}
