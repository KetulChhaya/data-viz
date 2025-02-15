# Assignment 1

To replicate the visualization given in the link using D3.js: https://padlet.com/rmwillia2/assignment-1-visualizations-data-4zfmrymkyzvf9vzo/wish/lkROZPkLJnLwQjMg

---

## File Info

This assignment contains 3 files: 

**/src/components/treemap.js** : This file contains the implementation logic to fetch data from a Google Sheets CSV, process the data, and render SVG using D3.js

**/src/data/treemap-data.js** : This file contains configuration data such as color schemes, custom layout settings, and font sizes used in the visualization

**/src/assignment-one.md** : This file contains markdown content with instructions, description and createTreemap() function call 

---

## Instructions: How to Run

#### 1. Clone the Repository
```sh
git clone https://github.com/KetulChhaya/data-viz
cd data-viz
```

#### 2. Install Dependencies
```sh
npm install
```
#### 3. Start the Local Server
```sh
npm run dev
```
#### 4. View App
Open the browser and enter the url -- http://localhost:3000/

#### 5. Open Assignment
Open sidebar of an app, using icon: |-> and click on the Assignment Link


---


## Loading & Formatting Data
For reading the data directly from the google spreadsheet url, modify the url by replacing <code>/edit?gid=</code> to <code>/export?format=csv&gid=</code>

Ensure that, the project runs on local server instead of opening a file directly on browser as it may conflict with CORS policy and the data may not be accessible using url

On calling fetch api asynchronously, we get the reponse text which then split by the delimiter <code>\n</code> to access rows

Skip initial rows and columns as per the requirement by logging the data into the console to view the actual data output

Choose final header names for each and map the description for reference

In order to add custom data such as custom font-size, custom colors and custom width of tiles, export the data from <code>treemap-data.js</code> along ith the spreadsheetUrl and import it to <code>treemap.js</code> to get access by adding the custom keys and values based on the index

---

## Adjusting Parameters and Styles

First thing, create a hierarchyData object which contains name of the root node and proper structure of its children by adding all the relevant <code>key: value</code> pairs of data 

Set the total width and total height of the canvas, here 800 x 700

In order to make it properly align with the notebook content section, append SVG to a container

After that, add necessary attributes and parameters to the element such as bgcolor, x and y positions, text-alignment, font-family, color, border-radius, etc.

For creation of title and subtitle element, their properties are handled using index mapping and validation

Create treemap making the tile to use squarify and ratio of 1, and adjust the padding and positions for the same

Handle tile - text content using indexing and other attributes to make it different for specific indices and same for others

Here, width and height ratios of each tiles is handled by introducing one custom field as treemap automatically sets the ratio of width:height as per the assigned value
 
Once, everything gets set up, import and call the function <code>createTreemap()</code> in the markdown file to render SVG / Canvas

---

## Code

### src/data/treemap-data.js
```code
export const cityColors = {
    Antwerp: "#174d68",
    Bern: "#174d68",
    Paris: "#174d68",
    Bordeaux: "#3e87a5",
    "Tel Aviv": "#3e87a5",
    Hangzhou: "#3e87a5",
    Oslo: "#668f9d",
    Helsinki: "#819590",
    Nantes: "#8f968b",
    Seville: "#939889",
    Nice: "#939889",
    Brussels: "#999a85",
    Dublin: "#9d9b83",
    Barcelona: "#a79d7b",
    Singapore: "#ab9e78",
  };
  
  export const custom = {
    Antwerp: 1000,
    Bern: 1000,
    Paris: 800,
    Hangzhou: 600,
    Oslo: 400,
    Bordeaux: 550,
    "Tel Aviv": 500,
    Helsinki: 250,
    Nantes: 250,
    Seville: 240,
    Nice: 350,
    Brussels: 350,
    Dublin: 350,
    Barcelona: 380,
    Singapore: 320,
  };
  
  export const fontSizeCustom = {
    Antwerp: 28,
    Bern: 28,
    Paris: 28,
    Hangzhou: 28,
    Oslo: 28,
    Bordeaux: 28,
    "Tel Aviv": 28,
    Helsinki: 22,
    Nantes: 22,
    Seville: 24,
    Nice: 22,
    Brussels: 22,
    Dublin: 22,
    Barcelona: 20,
    Singapore: 22,
  };
  
  export const spreadsheetUrl = "https://docs.google.com/spreadsheets/d/1uqP9MXx48_VrEHNzkUwK-Pkpz2_seYF7haE1PNbn7-Q/export?format=csv&gid=0";
```

### src/components/treemap.js
```code js
import * as d3 from "https://cdn.skypack.dev/d3@7";
import {
  cityColors,
  custom,
  fontSizeCustom,
  spreadsheetUrl,
} from "../data/treemap-data.js";

async function fetchAndProcessCSV() {
  let data = [];
  try {
    const response = await fetch(spreadsheetUrl);
    const csvText = await response.text();

    let rows = csvText.split("\n");

    // Skip the first 3 rows and map required columns as per the data
    rows = rows.slice(3);

    // Extract columns 0 to 4
    const selectedData = rows.map((row) => {
      const columns = row.split(",");
      return columns.slice(0, 5); // Selected columns 0 to 4 only
    });

    if (selectedData && selectedData.length > 0) {
      const headers = [
        "city",
        "country",
        "numberOfSharedBicyclesPer100k",
        "numberOfBicycleSharingAndRentalStationsPer100k",
        "percentBicycleUsage",
        "customWidths",
        "customHeights",
        "custom",
        "fontSizeCustom",
      ];
      const formattedData = selectedData.map((row, index) => {
        // Add the custom values for font and sizes from the arrays based on the index
        return Object.fromEntries(
          headers.map((key, i) => {
            if (key == "custom") {
              return [key, custom[row[0]]];
            }
            if (key == "fontSizeCustom") {
              return [key, fontSizeCustom[row[0]]];
            }
            return [key, row[i]];
          })
        );
      });
      data = formattedData;
      console.log("Data: ", data);
      return data;
    }
  } catch (error) {
    console.error("Error fetching CSV data: ", error);
  }
  return data;
}

export async function createTreemap() {
  const data = await fetchAndProcessCSV();

  if (data && data.length > 0) {
    const hierarchyData = {
      name: "cities",
      children: data.map((d, ind) => ({
        name: d.city,
        value: +d["numberOfSharedBicyclesPer100k"],
        density: +d["numberOfBicycleSharingAndRentalStationsPer100k"],
        share: +d["percentBicycleUsage"],
        custom: +d["custom"],
        index: ind + 1,
        fontSizeCustom: +d["fontSizeCustom"],
      })),
    };

    // Total width and height of the SVG
    const totalWidth = 800;
    const totalHeight = 700;

    const container = d3
      .select("body")
      .append("div")
      .style("display", "flex")
      .style("justify-content", "center")
      .style("border-radius", "10px");

    // Append SVG to the container
    const svg = container
      .append("svg")
      .attr("width", totalWidth)
      .attr("height", totalHeight)
      .style("background", "#8ec3cd");

    // Caption (Title and Subtitle) for Treemap
    svg
      .append("text")
      .attr("x", 5)
      .attr("y", 30)
      .attr("text-anchor", "start")
      .attr("font-family", "'Montserrat', sans-serif")
      .attr("fill", "white")
      .selectAll("tspan")
      .data([
        "These Cities Are Leading the World’s",
        "Bike-Sharing Revolution",
        "Rental Bicycles per 100,000",
      ])
      .enter()
      .append("tspan")
      .attr("x", 10)
      .attr("dy", (d, i) => (i != 2 ? i * 35 : 35))
      .attr("font-weight", (d, i) => (i < 2 ? "bold" : "normal"))
      .attr("font-size", (d, i) => (i != 2 ? "28px" : "24px"))
      .text((d) => d);

    const root = d3.hierarchy(hierarchyData).sum((d) => d.custom);

    // Creation of a treemap layout with ratio 1
    const treemap = d3
      .treemap()
      .tile(d3.treemapSquarify.ratio(1))
      .size([totalWidth, totalHeight - 120]) // Offset for caption
      .padding(2); // Spacing between tiles

    treemap(root);

    const nodes = svg
      .selectAll("g")
      .data(root.leaves())
      .enter()
      .append("g")
      .attr("transform", (d) => `translate(${d.x0},${d.y0 + 120})`);

    nodes
      .append("rect")
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("fill", (d) => cityColors[d.data.name] || "black")
      .style("rx", "5")
      .style("ry", "5");

    nodes
      .append("text")
      .attr("x", 5)
      .attr("y", 30)
      .attr("font-family", "'Montserrat', sans-serif")
      .attr("font-weight", "normal")
      .attr("font-size", (d) => `${d.data.fontSizeCustom}px`) // Adjusted font-size as per city names
      .attr("fill", "white")
      .text((d) => d.data.name);

    nodes
      .append("text")
      .attr("x", 5)
      .attr("y", 60)
      .attr("font-family", "'Montserrat', sans-serif")
      .attr("font-weight", "normal")
      .attr("font-size", "24px")
      .attr("fill", "white")
      .text(
        (d) =>
          `${Math.round(d.data.value)} ${d.data.value == 100 ? "bikes" : ""}`
      );
  }
}

```

---
## Caption:
(Fig1. ) shows distribution of bikes on rental basis per 100,000 people across various cities. Each rectangular tile encodes a city possessing bike-sharing proportion as a quantitative attribute. The color channel further differentiate cities as a categorical attribute.

---

## Output (Fig1. )
#### Note: This is a live rendered output using async function call (Not a Screenshot)
```js
import {createTreemap} from "./components/treemap.js"
createTreemap()
```
