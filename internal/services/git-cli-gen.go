package services

import (
	"encoding/csv"
	"fmt"
	"log"
	"os"
	"regexp"
	"sort"
	"strings"
	"time"

	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/plumbing"
	"github.com/go-git/go-git/v5/plumbing/object"

	"github.com/webpointsolutions/sheet-happens/internal/utils"
)

// eg: feat(auth): impliment 2fa and token refresh cycle
var semanticRegex = regexp.MustCompile(`^(?P<type>\w+)(\((?P<scope>[^)]+)\))?: (?P<description>.+)$`)

func GenerateCSV(folder string) {
	repo, err := git.PlainOpen(folder)
	if err != nil {
		log.Fatal(err)
	}

	branches, err := repo.Branches()
	if err != nil {
		log.Fatal(err)
	}

	var records [][]string
	records = append(records, []string{"Date", "Author Name", "Branch", "Commit Type", "Scope", "Description", "Commit Hash"})

	seenCommits := make(map[string]bool)

	branches.ForEach(func(ref *plumbing.Reference) error {
		branchName := ref.Name().Short()

		commitIter, err := repo.Log(&git.LogOptions{From: ref.Hash()})
		if err != nil {
			log.Println("Couldn't find commits from log history:", err.Error())
			return nil
		}
		defer commitIter.Close()

		commitIter.ForEach(func(c *object.Commit) error {
			hash := c.Hash.String()

			if seenCommits[hash] {
				// NOTE: already processed commit thus exclude
				return nil
			}

			seenCommits[hash] = true // mark this commit as seen

			date := c.Author.When.Format("2006-01-02 15:04:05")
			author := c.Author.Name
			message := strings.TrimSpace(c.Message)

			commitType, scope, desc := parseSemanticCommit(message)

			records = append(records, []string{date, author, branchName, commitType, scope, desc, hash})

			return nil
		})

		return nil
	})

	sort.Slice(records[1:], func(i, j int) bool {
		return records[i+1][0] < records[j+1][0]
	})

	nowtime := time.Now().Unix()

	outName := fmt.Sprintf("out/%d_%s_log.csv", nowtime, utils.Generate4DigitCode())

	f, err := os.Create(outName)
	if err != nil {
		log.Fatal("Error creating CSV:", err)
	}

	w := csv.NewWriter(f)
	w.WriteAll(records)
	w.Flush()
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
