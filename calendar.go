package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"sync"
	"time"

	"bytes"

	ical "github.com/arran4/golang-ical"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"google.golang.org/api/calendar/v3"
	"google.golang.org/api/option"
)

const (
	credentialsPath = "client_secret_783324530652-psgiulir4cdlp0i2gqsinq492d2e2u1p.apps.googleusercontent.com.json"
	tokenPath       = "token.json"
)

// Event represents a calendar event
type Event struct {
	Summary string `json:"summary"`
	Start   struct {
		DateTime string `json:"dateTime,omitempty"`
		Date     string `json:"date,omitempty"`
	} `json:"start"`
	End struct {
		DateTime string `json:"dateTime,omitempty"`
		Date     string `json:"date,omitempty"`
	} `json:"end"`
	CalendarName string `json:"calendarName"`
}

// EventResult represents the result of fetching events from a calendar
type EventResult struct {
	Events []Event
	Error  error
}

func main() {
	if err := fetchCalendarEvents(); err != nil {
		log.Fatalf("Error fetching calendar events: %v", err)
	}
}

func getConfig() (*oauth2.Config, error) {
	b, err := os.ReadFile(credentialsPath)
	if err != nil {
		return nil, fmt.Errorf("unable to read client secret file: %v", err)
	}

	config, err := google.ConfigFromJSON(b, calendar.CalendarReadonlyScope)
	if err != nil {
		return nil, fmt.Errorf("unable to parse client secret file to config: %v", err)
	}
	return config, nil
}

func getClient(config *oauth2.Config) (*http.Client, error) {
	tok, err := tokenFromFile()
	if err != nil {
		return nil, fmt.Errorf("error loading token: %v", err)
	}

	// Check if token is expired
	if tok.Expiry.Before(time.Now()) {
		tok, err = config.TokenSource(context.Background(), tok).Token()
		if err != nil {
			return nil, fmt.Errorf("error refreshing token: %v", err)
		}
		saveToken(tok)
	}

	return config.Client(context.Background(), tok), nil
}

func getTokenFromWeb(config *oauth2.Config) (*oauth2.Token, error) {
	authURL := config.AuthCodeURL("state-token", oauth2.AccessTypeOffline)
	fmt.Printf("Go to the following link in your browser then type the authorization code: \n%v\n", authURL)

	var authCode string
	if _, err := fmt.Scan(&authCode); err != nil {
		return nil, fmt.Errorf("unable to read authorization code: %v", err)
	}

	tok, err := config.Exchange(context.TODO(), authCode)
	if err != nil {
		return nil, fmt.Errorf("unable to retrieve token from web: %v", err)
	}
	return tok, nil
}

func tokenFromFile() (*oauth2.Token, error) {
	f, err := os.Open(tokenPath)
	if err != nil {
		return nil, err
	}
	defer f.Close()
	tok := &oauth2.Token{}
	err = json.NewDecoder(f).Decode(tok)
	return tok, err
}

func saveToken(token *oauth2.Token) {
	f, err := os.OpenFile(tokenPath, os.O_RDWR|os.O_CREATE|os.O_TRUNC, 0600)
	if err != nil {
		log.Fatalf("Unable to cache oauth token: %v", err)
	}
	defer f.Close()
	json.NewEncoder(f).Encode(token)
}

func getOnCallEvents() ([]Event, error) {
	resp, err := http.Get("https://rootly.com/account/shifts/ical/eyJfcmFpbHMiOnsiZGF0YSI6NTg2NywicHVyIjoibWVtYmVyc2hpcC9pY2FsIn19--cea7a5a4dd3a2b1da590b67ed1daf76fe3443846dcc3f746b5106c053f72d12d?user_ids=5785")
	if err != nil {
		return nil, fmt.Errorf("error fetching on-call events: %v", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("error reading response body: %v", err)
	}

	cal, err := ical.ParseCalendar(bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("error parsing iCal data: %v", err)
	}

	var events []Event
	for _, event := range cal.Events() {
		if event.GetProperty(ical.ComponentPropertyDtStart) == nil || event.GetProperty(ical.ComponentPropertyDtEnd) == nil {
			continue
		}

		start, err := event.GetStartAt()
		if err != nil {
			log.Printf("Warning: skipping event with invalid start time: %v", err)
			continue
		}

		end, err := event.GetEndAt()
		if err != nil {
			log.Printf("Warning: skipping event with invalid end time: %v", err)
			continue
		}

		e := Event{
			Summary:      "On-Call",
			CalendarName: "On-Call Schedule",
		}
		e.Start.DateTime = start.Format(time.RFC3339)
		e.End.DateTime = end.Format(time.RFC3339)
		events = append(events, e)
	}

	return events, nil
}

func fetchCalendarEvents() error {
	config, err := getConfig()
	if err != nil {
		return err
	}

	client, err := getClient(config)
	if err != nil {
		return err
	}

	srv, err := calendar.NewService(context.Background(), option.WithHTTPClient(client))
	if err != nil {
		return fmt.Errorf("unable to retrieve Calendar client: %v", err)
	}

	// Get calendar list
	calendarList, err := srv.CalendarList.List().Do()
	if err != nil {
		return fmt.Errorf("unable to retrieve calendar list: %v", err)
	}

	// Create channels for concurrent processing
	eventChan := make(chan EventResult, len(calendarList.Items))
	var wg sync.WaitGroup

	// Process each calendar concurrently
	for _, cal := range calendarList.Items {
		wg.Add(1)
		go func(calendar *calendar.CalendarListEntry) {
			defer wg.Done()
			events, err := srv.Events.List(calendar.Id).
				TimeMin(time.Now().Format(time.RFC3339)).
				MaxResults(50).
				SingleEvents(true).
				OrderBy("startTime").
				Do()

			if err != nil {
				eventChan <- EventResult{Error: fmt.Errorf("error fetching events for calendar %s: %v", calendar.Summary, err)}
				return
			}

			var calEvents []Event
			for _, event := range events.Items {
				e := Event{
					Summary:      event.Summary,
					CalendarName: calendar.Summary,
				}
				if event.Start.DateTime != "" {
					e.Start.DateTime = event.Start.DateTime
				} else if event.Start.Date != "" {
					e.Start.Date = event.Start.Date
				}
				if event.End.DateTime != "" {
					e.End.DateTime = event.End.DateTime
				} else if event.End.Date != "" {
					e.End.Date = event.End.Date
				}
				calEvents = append(calEvents, e)
			}
			eventChan <- EventResult{Events: calEvents}
		}(cal)
	}

	// Start a goroutine to close the channel when all workers are done
	go func() {
		wg.Wait()
		close(eventChan)
	}()

	// Collect results
	var allEvents []Event
	for result := range eventChan {
		if result.Error != nil {
			log.Printf("Warning: %v", result.Error)
			continue
		}
		allEvents = append(allEvents, result.Events...)
	}

	// Add on-call events
	onCallEvents, err := getOnCallEvents()
	if err != nil {
		log.Printf("Warning: error fetching on-call events: %v", err)
	} else {
		allEvents = append(allEvents, onCallEvents...)
	}

	// Sort events by start time
	sort.Slice(allEvents, func(i, j int) bool {
		var iTime, jTime time.Time
		var err error

		if allEvents[i].Start.DateTime != "" {
			iTime, err = time.Parse(time.RFC3339, allEvents[i].Start.DateTime)
		} else {
			iTime, err = time.Parse("2006-01-02", allEvents[i].Start.Date)
		}
		if err != nil {
			return false
		}

		if allEvents[j].Start.DateTime != "" {
			jTime, err = time.Parse(time.RFC3339, allEvents[j].Start.DateTime)
		} else {
			jTime, err = time.Parse("2006-01-02", allEvents[j].Start.Date)
		}
		if err != nil {
			return false
		}

		return iTime.Before(jTime)
	})

	// Save events to JSON files
	eventsJSON, err := json.MarshalIndent(allEvents, "", "  ")
	if err != nil {
		return fmt.Errorf("error marshaling events: %v", err)
	}

	paths := []string{
		filepath.Join("dashboard", "public", "data", "calendar.json"),
		filepath.Join("dashboard", "build", "data", "calendar.json"),
	}

	for _, path := range paths {
		if err := os.MkdirAll(filepath.Dir(path), 0755); err != nil {
			return fmt.Errorf("error creating directory for %s: %v", path, err)
		}
		if err := os.WriteFile(path, eventsJSON, 0644); err != nil {
			return fmt.Errorf("error writing events to %s: %v", path, err)
		}
	}

	fmt.Printf("Saved %d events to calendar.json\n", len(allEvents))
	return nil
}
