package main

import (
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
)

type Response[T any] struct {
	Success bool `json:"success"`
	Data    T    `json:"data"`
}

type PostPasteData struct {
	Id      string `json:"id"`
	Message string `json:"message"`
	Content string `json:"content"`
}

func main() {
	switch flag.Arg(0) {
	case "config":
		if flag.NArg() != 2 {
			log.Printf("Usage: %s config <key> <value>\n", os.Args[0])
			return
		}
	default:
		stat, _ := os.Stdin.Stat()

		if (stat.Mode() & os.ModeNamedPipe) == 0 {
			log.Println("Input must be through a pipe")
			return
		}

		instanceApi := flag.String("api", "https://paste-api.b68.dev", "The instance to use")
		instance := flag.String("i", "https://paste.b68.dev", "The instance to use")
		markdown := flag.Bool("md", false, "Markdown mode")

		flag.Parse()

		buf, _ := io.ReadAll(os.Stdin)
		content := string(buf)

		if *markdown {
			content = "md " + content
		}

		resp, err := Post(*instanceApi, content)

		if err != nil {
			fmt.Println(err)
			os.Exit(1)
		}

		body, err := io.ReadAll(resp.Body)

		if err != nil {
			fmt.Println(err)
			os.Exit(1)
		}

		var response Response[PostPasteData]
		err = json.Unmarshal(body, &response)

		if err != nil {
			fmt.Println(err)
			os.Exit(1)
		}

		if !response.Success {
			fmt.Println(response.Data.Message)
			os.Exit(1)
		}

		url := fmt.Sprintf("%s/p/r/%s", *instanceApi, response.Data.Id)
		url2 := fmt.Sprintf("%s/%s", *instance, response.Data.Id)

		fmt.Println(url)
		fmt.Println(url2)
	}
}

func Post(instance string, content string) (*http.Response, error) {
	values := map[string]interface{}{
		"content":     content,
		"single_view": false,
	}

	payload, err := json.Marshal(values)

	if err != nil {
		return nil, err
	}

	return http.Post(instance+"/p/n", "application/json",
		bytes.NewBuffer(payload))
}
