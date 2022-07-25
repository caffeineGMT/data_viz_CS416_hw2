import * as d3 from "https://cdn.skypack.dev/d3@7";

class ToiletPaper {
  width = window.innerWidth;
  height = window.innerHeight;
  margin = { top: 10, left: 10, bottom: 10, right: 10 };
  lastIndex = -1;
  activeIndex = 0;

  squareSize = window.innerWidth / 200;
  squarePad = this.squareSize;
  numPerRow = this.width / (this.squareSize + this.squarePad);

  svg = null;

  activateFunctions = [];
  updateFunctions = [];

  // data: https://www.statista.com/chart/15676/cmo-toilet-paper-consumption/
  rollsRaw = [
    { Country: "US", Rolls: 141 },
    { Country: "Germany", Rolls: 134 },
    { Country: "UK", Rolls: 127 },
    { Country: "Japan", Rolls: 91 },
    { Country: "Australia", Rolls: 88 },
    { Country: "Spain", Rolls: 81 },
    { Country: "France", Rolls: 71 },
    { Country: "Italy", Rolls: 70 },
    { Country: "China", Rolls: 49 },
    { Country: "Brazil", Rolls: 38 },
  ];

  init() {
    this.setupCanvas(d3.select("#root"));
    this.generateRolls();
    this.setupGrid();

    // first slide
    this.showSquares();

    this.setupClickHandlers();
  }

  setupCanvas = (selection) => {
    this.svg = selection
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom);
  };

  generateRolls = () => {
    this.rollsProcessed = [];
    this.rollsRaw.forEach((d, _) => {
      for (let count = 0; count < d.Rolls; count++) {
        this.rollsProcessed.push({
          Country: d.Country,
        });
      }
    });
    this.rollsProcessed.map((d, i) => {
      d.col = i % this.numPerRow;
      d.row = Math.floor(i / this.numPerRow);
      d.x = d.col * (this.squareSize + this.squarePad);
      d.y = d.row * (this.squareSize + this.squarePad);
      return d;
    });
  };

  setupGrid = () => {
    const countryList = [
      "US",
      "Germany",
      "UK",
      "Japan",
      "Australia",
      "Spain",
      "France",
      "Italy",
      "China",
      "Brazil",
    ];

    this.colorScale = d3.scaleOrdinal().domain(countryList).range([
      // "#ab2668", // purple
      "#ef3f5d", // light-red
      "#00aaa9", // green-blue
      // "#bfc0c2", // light-grey
      "#fcf001", // light-yellow
      // "#c2272d", // dark red
      // "#c9da29", // blue-yellow
      // "#03a7c1", // blue-green
      // "#be1a8b", // dark pink
      "#75d1f3", // light blue
      // "#7f65aa", // light purple
      // "#01aef0", // blue
      "#ed0477", // pink
      // "#5d2d91", // dark purple
      // "#015aaa", // blue
      "#84bc41", // light green
      "#01954e", // green
      "#ffc60e", // yellow
      // "#94238e", // purple
      "#ec6aa0", // light pink
      // "#d71b32", // red
      "#f69324", // orange
    ]);

    let squares = this.svg
      .append("g")
      .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
      .selectAll(".square")
      .data(this.rollsProcessed)
      .enter()
      .append("rect")
      .classed("square", true)
      .attr("width", this.squareSize)
      .attr("height", this.squareSize)
      .attr("fill", (d) => this.colorScale(d.Country))
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y)
      .attr("opacity", 0);

    const legend = this.svg
      .selectAll(".legend")
      .data(countryList)
      .enter()
      .append("rect")
      .classed("legend", true)
      .attr("width", this.squareSize)
      .attr("height", this.squareSize)
      .attr("fill", (d) => this.colorScale(d))
      .attr("x", (d, i) => i * this.squareSize * 6)
      .attr("y", 0)
      .attr("opacity", 0);

    const legendText = this.svg
      .selectAll(".legend-text")
      .data(countryList)
      .enter()
      .append("text")
      .attr("class", "legend-text")
      .text((d) => d)
      .attr("x", (d, i) => i * this.squareSize * 6)
      .attr("y", 0)
      .attr("transform", `translate(0, ${this.squareSize + 15})`)
      .style("font-size", 10)
      .attr("fill", "white")
      .attr("opacity", 0);
  };

  setupClickHandlers = () => {
    this.activateFunctions.push(
      this.showSquares,
      this.expandGrid,
      this.highlightGrid
    );

    document
      .querySelector("#slide1")
      .addEventListener("click", this.showSquares);
    document
      .querySelector("#slide2")
      .addEventListener("click", this.expandGrid);
    document
      .querySelector("#slide3")
      .addEventListener("click", this.highlightGrid);
  };

  /**
   * 1st slide
   */
  showSquares = () => {
    // show cur
    this.svg
      .selectAll(".square")
      .transition()
      .delay((d) => 80 * d.row)
      .attr("x", 0)
      .attr("y", (d) => d.y)
      .attr("fill", (d) => this.colorScale(d.Country))
      .transition()
      .duration(600)
      .attr("opacity", 1);

    this.svg.selectAll(".legend").transition().duration(600).attr("opacity", 1);
    this.svg
      .selectAll(".legend-text")
      .transition()
      .duration(1000)
      .attr("opacity", 1);
  };

  /**
   * 2nd slide
   */
  expandGrid = () => {
    // show cur
    this.svg
      .selectAll(".square")
      .transition()
      .duration(600)
      .delay((d) => 5 * d.row)
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y)
      .attr("fill", (d) => this.colorScale(d.Country))
      .attr("opacity", 1.0);

    this.svg.selectAll(".legend").transition().duration(600).attr("opacity", 1);
    this.svg
      .selectAll(".legend-text")
      .transition()
      .duration(600)
      .attr("opacity", 1);
  };

  /**
   * 3rd slide
   */
  highlightGrid = () => {
    this.svg
      .selectAll(".square")
      .transition()
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y)
      .delay((d) => 5 * d.col)
      .duration(600)
      .attr("opacity", 1.0);
    this.svg.selectAll(".legend").transition().duration(0).attr("opacity", 1);
    this.svg
      .selectAll(".legend-text")
      .transition()
      .duration(0)
      .attr("opacity", 1);

    // use named transition to ensure move happens even if other transitions are interrupted.
    this.svg
      .selectAll(".square")
      .transition("move-fills")
      .duration(800)
      .attr("opacity", 1.0)
      .attr("fill", (d) =>
        d.Country === "US" ? this.colorScale("US") : "lightgrey"
      );
  };
}

// driver function
function main() {
  let tp = new ToiletPaper();
  tp.init();
}

// execution
main();
