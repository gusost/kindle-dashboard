package main

import (
	"encoding/xml"
	"fmt"
	"os"
	"path/filepath"
)

type Glyph struct {
	Name string `xml:"glyph-name,attr"`
	D    string `xml:"d,attr"`
}

type Font struct {
	Glyphs []Glyph `xml:"glyph"`
}

type SVG struct {
	Font Font `xml:"defs>font"`
}

func main() {
	inputFile := "WeatherIcons.svg"
	outputDir := "glyphs"

	data, err := os.ReadFile(inputFile)
	if err != nil {
		panic(err)
	}

	var svg SVG
	if err := xml.Unmarshal(data, &svg); err != nil {
		panic(err)
	}

	if err := os.MkdirAll(outputDir, 0755); err != nil {
		panic(err)
	}

	for _, glyph := range svg.Font.Glyphs {
		if glyph.Name == "" || glyph.D == "" {
			continue
		}
		out := fmt.Sprintf(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <path d="%s"/>
</svg>`, glyph.D)

		outPath := filepath.Join(outputDir, glyph.Name+".svg")
		if err := os.WriteFile(outPath, []byte(out), 0644); err != nil {
			panic(err)
		}
	}

	fmt.Printf("Extracted %d glyphs to %s/\n", len(svg.Font.Glyphs), outputDir)
}
