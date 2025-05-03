package services

import (
	"bytes"
	"encoding/csv"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/plumbing"
	"github.com/go-git/go-git/v5/plumbing/object"

	"github.com/webpointsolutions/sheet-happens/internal/utils"
)

// eg: feat(auth): impliment 2fa and token refresh cycle
var semanticRegex = regexp.MustCompile(`^(?P<type>\w+)(\((?P<scope>[^)]+)\))?: (?P<description>.+)$`)

// GenerateCSV generates a CSV file from git commits
// `folder` (optional) is the repository path (empty = current directory)
// `branchName` (optional) filters commits from a specific branch (empty = all branches)
// `sinceDays` (optional) filters commits since given number of days ago (0 = no time filter)
func GenerateCSV(folder string, branchName string, sinceDays int) {
	if folder == "" {
		folder = "." // default to current directory
	}

	// Clean the folder path
	absFolder, err := filepath.Abs(folder)
	if err != nil {
		log.Fatal("Failed to resolve folder path:", err)
	}

	repo, err := git.PlainOpen(absFolder)
	if err != nil {
		log.Fatal("Failed to open git repository:", err)
	}

	repoName := utils.GetRepoNameFromRepo(repo)

	records := [][]string{
		{"Date", "Author Name", "Commit Type", "Scope", "Description", "TimeStamp"},
	}

	sinceTime := time.Time{}
	if sinceDays > 0 {
		sinceTime = time.Now().AddDate(0, 0, -sinceDays)
	}

	seenCommits := make(map[string]bool)
	var allCommits []*object.Commit

	// Centralized function for collecting commits
	collectCommits := func(iter object.CommitIter) {
		defer iter.Close()
		iter.ForEach(func(c *object.Commit) error {
			if seenCommits[c.Hash.String()] || (!sinceTime.IsZero() && c.Author.When.Before(sinceTime)) {
				return nil
			}
			seenCommits[c.Hash.String()] = true
			allCommits = append(allCommits, c)
			return nil
		})
	}

	if branchName != "" {
		ref, err := repo.Reference(plumbing.NewBranchReferenceName(branchName), true)
		if err != nil {
			log.Fatalf("Branch %s not found: %v", branchName, err)
		}
		iter, err := repo.Log(&git.LogOptions{From: ref.Hash()})
		if err != nil {
			log.Fatalf("Couldn't retrieve commits from branch: %v", err)
		}
		collectCommits(iter)
	} else {
		branches, err := repo.Branches()
		if err != nil {
			log.Fatal(err)
		}
		branches.ForEach(func(ref *plumbing.Reference) error {
			iter, err := repo.Log(&git.LogOptions{From: ref.Hash()})
			if err == nil {
				collectCommits(iter)
			}
			return nil
		})
	}

	// Reverse commits (newest first)
	for i := len(allCommits) - 1; i >= 0; i-- {
		c := allCommits[i]

		date := c.Author.When.Format("2006-01-02 15:04:05")
		author := c.Author.Name
		commitType, scope, desc := parseSemanticCommit(strings.TrimSpace(c.Message))

		timeDiff := ""
		if i < len(allCommits)-1 {
			next := allCommits[i+1]
			diff := c.Author.When.Sub(next.Author.When)
			h := int(diff.Hours())
			m := int(diff.Minutes()) % 60
			if h > 0 {
				timeDiff = fmt.Sprintf("%dh %dm", h, m)
			} else {
				timeDiff = fmt.Sprintf("%dm", m)
			}
		}

		records = append(records, []string{date, author, commitType, scope, desc, timeDiff})
	}

	// Prepare output
	filename := fmt.Sprintf("%d_%s_%s_log", time.Now().Unix(), repoName, utils.Generate4DigitCode())
	fileNameWithExt := filename + ".csv"

	backendURL := os.Getenv("BACKEND_URL")
	if backendURL != "" {
		var buf bytes.Buffer
		w := csv.NewWriter(&buf)
		if err := w.WriteAll(records); err != nil {
			log.Fatalf("Error writing CSV to buffer: %v", err)
		}
		w.Flush()

		// Upload from memory buffer
		file, err := UploadCSVFromBuffer(&buf, backendURL, fileNameWithExt)
		if err != nil {
			log.Fatalf("Failed to upload CSV: %v", err)
			return
		}
		fileDownloadUrl := backendURL + "/csv/" + file
		fmt.Println("Get your csv from here: ", fileDownloadUrl)
		return
	}

	file, err := os.Create(fileNameWithExt)
	if err != nil {
		log.Fatalf("Error creating CSV: %v", err)
	}
	defer file.Close()

	w := csv.NewWriter(file)
	if err := w.WriteAll(records); err != nil {
		log.Fatalf("Error writing CSV: %v", err)
	}
	w.Flush()

	fmt.Println("CSV generated")
}

func parseSemanticCommit(message string) (commitType, scope, description string) {
	matches := semanticRegex.FindStringSubmatch(message)
	if matches == nil {
		return "unknown", "", message
	}

	result := make(map[string]string)
	for i, name := range semanticRegex.SubexpNames() {
		if i != 0 && name != "" {
			result[name] = matches[i]
		}
	}

	return result["type"], result["scope"], result["description"]
}

func GetFileFrontendUrl(filename string) string {
	host := os.Getenv("FRONTEND_HOST")
	return host + "/dashboard/" + filename
}
