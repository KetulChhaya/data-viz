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
