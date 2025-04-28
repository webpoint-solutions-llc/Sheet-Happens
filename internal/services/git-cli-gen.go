package services

import (
	"encoding/csv"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
	"time"

	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/plumbing"
	"github.com/go-git/go-git/v5/plumbing/object"

	"github.com/webpointsolutions/sheet-happens/internal/config"
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

	var records [][]string
	records = append(records, []string{"Date", "Author Name", "Commit Type", "Scope", "Description", "TimeLog"})

	var sinceTime time.Time
	if sinceDays > 0 {
		sinceTime = time.Now().AddDate(0, 0, -sinceDays)
	}

	seenCommits := make(map[string]bool)

	processCommits := func(commitIter object.CommitIter) {
		defer commitIter.Close()
		commitIter.ForEach(func(c *object.Commit) error {
			hash := c.Hash.String()

			if seenCommits[hash] {
				return nil
			}

			if !sinceTime.IsZero() && c.Author.When.Before(sinceTime) {
				return nil
			}

			seenCommits[hash] = true

			date := c.Author.When.Format("2006-01-02 15:04:05")
			author := c.Author.Name
			message := strings.TrimSpace(c.Message)

			commitType, scope, desc := parseSemanticCommit(message)

			records = append(records, []string{date, author, commitType, scope, desc, ""})

			return nil
		})
	}

	if branchName != "" {
		ref, err := repo.Reference(plumbing.NewBranchReferenceName(branchName), true)
		if err != nil {
			log.Fatalf("Branch %s not found: %v", branchName, err)
		}

		commitIter, err := repo.Log(&git.LogOptions{From: ref.Hash()})
		if err != nil {
			log.Fatal("Couldn't retrieve commits from branch:", err)
		}

		processCommits(commitIter)

	} else {
		branches, err := repo.Branches()
		if err != nil {
			log.Fatal(err)
		}

		branches.ForEach(func(ref *plumbing.Reference) error {
			commitIter, err := repo.Log(&git.LogOptions{From: ref.Hash()})
			if err != nil {
				log.Println("Couldn't find commits from log history:", err.Error())
				return nil
			}

			processCommits(commitIter)
			return nil
		})
	}

	sort.Slice(records[1:], func(i, j int) bool {
		return records[i+1][0] < records[j+1][0]
	})

	nowtime := time.Now().Unix()
	filename := fmt.Sprintf("%d_%s_%s_log", nowtime, repoName, utils.Generate4DigitCode())
	outName := fmt.Sprintf("out/%s.csv", filename)

	if err := os.MkdirAll("out", 0o755); err != nil {
		log.Fatal("Failed to create output directory:", err)
	}

	f, err := os.Create(outName)
	if err != nil {
		log.Fatal("Error creating CSV:", err)
	}
	defer f.Close()

	w := csv.NewWriter(f)
	err = w.WriteAll(records)
	if err != nil {
		log.Fatal("Error writing CSV:", err)
	}
	w.Flush()

	fmt.Println("URL: ", GetFileFrontendUrl(filename))
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
	return config.Env.FrontHost + "/dashboard/" + filename
}
