import * as d3 from "https://cdn.skypack.dev/d3@7";

class ToiletPaper {
  width = (window.innerWidth * 1.0) / 4;
  height = this.width * 1.7;
  mainTextAreaWidth = 100;
  margin = { top: 10, left: 10, bottom: 10, right: 10 };
  lastIndex = -1;
  activeIndex = 0;

  squareSize = window.innerWidth / 200;
  squarePadding = this.squareSize;
  numPerRow = this.width / (this.squareSize + this.squarePadding);

  svg = null;
  canvas = null;
  mainTextArea = null;

  activateFunctions = [];
  updateFunctions = [];

  // data: https://www.statista.com/chart/15676/cmo-toilet-paper-consumption/
  // https://www.qssupplies.co.uk/world-toilet-paper-consumed-visualised.html
  rollsRawData = [
    { Country: "US", Rolls: 141 },
    { Country: "Germany", Rolls: 134 },
    { Country: "UK", Rolls: 127 },
    { Country: "Japan", Rolls: 91 },
    { Country: "Australia", Rolls: 88 },
    { Country: "Spain", Rolls: 81 },
    { Country: "France", Rolls: 71 },
    { Country: "Italy", Rolls: 70 },
    { Country: "China", Rolls: 49 },
    // { Country: "Brazil", Rolls: 38 },
  ];

  init() {
    // init everything
    this.setupCanvas(d3.select("#root"));
    this.generateRolls();
    this.setupGrid();
    this.setupButtons();

    // show first slide
    this.showSquares();
  }

  setupCanvas = (selection) => {
    this.svg = selection
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr(
        "height",
        this.height +
          this.margin.top +
          this.margin.bottom +
          this.mainTextAreaWidth
      )
      .attr(
        "transform",
        `translate(${window.innerWidth / 2 - this.width / 2}, ${
          window.innerHeight / 2 - this.height / 2
        })`
      )
      .append("g")
      .attr("id", "canvas");
    this.canvas = d3.select("#canvas");
  };

  generateRolls = () => {
    function Roll(country, col, row, x, y) {
      this.Country = country;
      this.col = col;
      this.row = row;
      this.x = x;
      this.y = y;
    }
    this.rollsProcessedData = [];
    this.rollsRawData.forEach((d, _) => {
      for (let count = 0; count < d.Rolls; count++) {
        this.rollsProcessedData.push(new Roll(d.Country));
      }
    });

    this.rollsProcessedData.map((d, i) => {
      d.col = i % this.numPerRow;
      d.row = Math.floor(i / this.numPerRow);
      d.x = d.col * (this.squareSize + this.squarePadding);
      d.y = d.row * (this.squareSize + this.squarePadding);
      return d;
    });

    this.numOfCol = this.numPerRow;
    this.numOfRow =
      this.rollsProcessedData[this.rollsProcessedData.length - 1].row;
  };

  setupGrid = () => {
    const countryList = this.rollsRawData.map((item) => item.Country);

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

    const squares = this.canvas
      .append("g")
      .attr("transform", `translate(${0}, ${5 * this.squareSize})`)
      .selectAll(".square")
      .data(this.rollsProcessedData)
      .enter()
      .append("rect")
      .classed("square", true)
      .attr("width", this.squareSize)
      .attr("height", this.squareSize)
      .attr("fill", (d) => this.colorScale(d.Country))
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y)
      .attr("opacity", 0);

    const legend = this.canvas
      .append("g")
      .selectAll(".legend")
      .data(countryList)
      .enter()
      .append("rect")
      .classed("legend", true)
      .attr("width", this.squareSize)
      .attr("height", this.squareSize)
      .attr("fill", (d) => this.colorScale(d))
      .attr("x", (_, i) => i * this.squareSize * 6)
      .attr("y", 0)
      .attr("opacity", 0);

    const legendText = this.canvas
      .append("g")
      .attr("transform", `translate(0, ${3 * this.squareSize})`)
      .selectAll(".legend-text")
      .data(countryList)
      .enter()
      .append("text")
      .attr("class", "legend-text")
      .text((d) => d)
      .attr("x", (_, i) => i * this.squareSize * 6)
      .attr("y", 0)
      .style("font-size", this.squareSize)
      .attr("fill", "white")
      .attr("opacity", 0);
  };

  setupButtons = () => {
    this.activateFunctions.push(
      this.showSquares,
      this.expandGridHorizontally,
      this.highlightGrid
    );

    document
      .querySelector("#slide1")
      .addEventListener("click", this.showSquares);
    document
      .querySelector("#slide2")
      .addEventListener("click", this.expandGridHorizontally);
    document
      .querySelector("#slide3")
      .addEventListener("click", this.highlightGrid);
    document
      .querySelector("#slide4")
      .addEventListener("click", this.shrinkGridDiagonally);
    document
      .querySelector("#slide5")
      .addEventListener("click", this.expandGridDiagonally);
  };

  /**
   * 1st slide
   */
  showSquares = () => {
    d3.selectAll("rect").attr("pointer-events", "none");

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

    this.svg.selectAll("#mainTextArea").remove();
    this.mainTextArea = this.svg
      .append("text")
      .text("The US is taking a lead on toilet paper consumption per capita")
      .attr("id", "mainTextArea")
      .attr("transform", `translate(${this.width / 8}, ${this.height / 1.05})`)
      .style("font-size", this.squareSize * 1.5)
      .attr("fill", "white")
      .transition()
      .duration(1000)
      .attr("opacity", 1);
    this.svg
      .append("text")
      .text(
        "(The num of square represents the relative rankings between countries)"
      )
      .attr("id", "mainTextArea")
      .attr("transform", `translate(${this.width / 20}, ${this.height / 1.1})`)
      .style("font-size", this.squareSize * 1.5)
      .attr("fill", "white")
      .transition()
      .duration(1000)
      .attr("opacity", 1);
  };

  /**
   * 2nd slide
   */
  expandGridHorizontally = () => {
    d3.selectAll("rect").attr("pointer-events", "all");

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

    this.svg.selectAll("#mainTextArea").remove();
    this.mainTextArea = this.svg
      .append("text")
      .text(
        "If each square represents a roll, the US uses 141 rolls per capita per year"
      )
      .attr("id", "mainTextArea")
      .attr("transform", `translate(${0}, ${this.height / 1.05})`)
      .style("font-size", this.squareSize * 1.5)
      .attr("fill", "white")
      .transition()
      .duration(1000)
      .attr("opacity", 1);
    this.svg
      .append("text")
      .text(
        "(Hover over to see miles of toilet paper usage per capita in lifetime)"
      )
      .attr("id", "mainTextArea")
      .attr("transform", `translate(${this.width / 20}, ${this.height / 1.1})`)
      .style("font-size", this.squareSize * 1.5)
      .attr("fill", "white")
      .transition()
      .duration(1000)
      .attr("opacity", 1);

    d3.selectAll(".square")
      .on("mouseenter", (event, curData) => {
        d3.selectAll(".square")
          .transition()
          .duration(0)
          .attr("opacity", (d) => {
            return d.Country != curData.Country ? 0.2 : 1;
          });
        d3.select(".tooltip").style("opacity", 1);
      })
      .on("mouseover", (event, curData) => {
        let mile = 0;
        switch (curData.Country) {
          case "US":
            mile = 633.78;
            break;
          case "Germany":
            mile = 623.4;
            break;
          case "UK":
            mile = 590.04;
            break;
          case "Japan":
            mile = 439.64;
            break;
          case "Australia":
            mile = 419.7;
            break;
          case "Spain":
            mile = 386.54;
            break;
          case "France":
            mile = 335.35;
            break;
          case "Italy":
            mile = 334.13;
            break;
          case "China":
            mile = 215.68;
            break;
        }
        const [x, y] = d3.pointer(event);
        d3.select(".tooltip")
          .style("left", window.innerWidth / 2 - this.width / 1.1 + "px")
          .style("top", y + window.innerHeight / 2 - this.height / 2.5 + "px")
          .text(`${curData.Country} - ${mile} miles`);
      })
      .on("mouseout", function (event, curData) {
        d3.selectAll(".square").transition().duration(250).attr("opacity", 1);
        d3.select(".tooltip").style("opacity", 0);
      });
  };

  /**
   * 3rd slide
   */
  calcPercentage = () => {
    let sum = 0;
    this.rollsRawData.forEach((v, i) => {
      sum += v.Rolls;
    });

    return Math.round((141 / sum) * 100);
  };

  highlightGrid = () => {
    d3.selectAll("rect").attr("pointer-events", "all");

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

    this.svg.selectAll("#mainTextArea").remove();
    this.mainTextArea = this.svg
      .append("text")
      .text(
        `And the US represents ${this.calcPercentage()}% of the top 9 countries`
      )
      .attr("id", "mainTextArea")
      .attr("transform", `translate(${this.width / 6}, ${this.height / 1.05})`)
      .style("font-size", this.squareSize * 1.5)
      .attr("fill", "white")
      .transition()
      .duration(1000)
      .attr("opacity", 1);
    this.svg
      .append("text")
      .text("(Hover over to see num of toilet paper usage per capita per year)")
      .attr("id", "mainTextArea")
      .attr("transform", `translate(${this.width / 20}, ${this.height / 1.1})`)
      .style("font-size", this.squareSize * 1.5)
      .attr("fill", "white")
      .transition()
      .duration(1000)
      .attr("opacity", 1);

    d3.selectAll(".square")
      .on("mouseenter", (event, curData) => {
        d3.selectAll(".square")
          .transition()
          .duration(0)
          .attr("opacity", (d) => {
            if (curData.Country === "US") {
              return d.Country !== "US" ? 0.2 : 1;
            }
            return d.Country === "US" ? 0.2 : 1;
          });
        d3.select(".tooltip").style("opacity", 1);
      })
      .on("mouseover", (event, curData) => {
        const [x, y] = d3.pointer(event);
        let numOfRolls =
          curData.Country === "US"
            ? 141
            : Math.round((141 * 100) / this.calcPercentage());
        let text =
          curData.Country === "US"
            ? `US - ${numOfRolls} rolls`
            : `The rest of the 8 countries - ${numOfRolls} rolls`;
        d3.select(".tooltip")
          .style("left", window.innerWidth / 2 - this.width / 1 + "px")
          .style("top", y + window.innerHeight / 2 - this.height / 2.5 + "px")
          .text(text);
      })
      .on("mouseout", function (event, curData) {
        d3.selectAll(".square").transition().duration(250).attr("opacity", 1);
        d3.select(".tooltip").style("opacity", 0);
      });
  };

  /**
   * 4th slide
   */
  shrinkGridDiagonally = () => {
    d3.selectAll("rect").attr("pointer-events", "none");

    this.svg
      .selectAll(".square")
      .transition()
      .duration(600)
      .delay((d) => 5 * (d.row + d.col))
      .attr(
        "x",
        (this.numOfCol / 2) * (this.squareSize + this.squarePadding) -
          this.squarePadding
      )
      .attr("y", (this.numOfRow / 2) * (this.squareSize + this.squarePadding))
      .attr("fill", "#84bc41")
      .attr("opacity", 1.0);

    this.svg.selectAll(".legend").transition().duration(600).attr("opacity", 1);
    this.svg
      .selectAll(".legend-text")
      .transition()
      .duration(600)
      .attr("opacity", 1);

    this.svg.selectAll("#mainTextArea").remove();
    this.mainTextArea = this.svg
      .append("text")
      .text("If 1 square represents 250k trees")
      .attr("id", "mainTextArea")
      .attr(
        "transform",
        `translate(${this.width / 3.5}, ${this.height / 1.05})`
      )
      .style("font-size", this.squareSize * 1.5)
      .attr("fill", "white")
      .transition()
      .duration(1000)
      .attr("opacity", 1);
  };

  /**
   * 5th slide
   */
  expandGridDiagonally = () => {
    d3.selectAll("rect").attr("pointer-events", "none");

    this.svg
      .selectAll(".square")
      .transition()
      .duration(600)
      .delay((d) => 5 * (d.row + d.col))
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y)
      .attr("fill", "#84bc41")
      .attr("opacity", 1.0);

    this.svg.selectAll(".legend").transition().duration(600).attr("opacity", 1);
    this.svg
      .selectAll(".legend-text")
      .transition()
      .duration(600)
      .attr("opacity", 1);

    this.svg.selectAll("#mainTextArea").remove();
    this.mainTextArea = this.svg
      .append("text")
      .text("Then the US needs 31,114,249 trees per year for toilet papers")
      .attr("id", "mainTextArea")
      .attr("transform", `translate(${this.width / 8}, ${this.height / 1.05})`)
      .style("font-size", this.squareSize * 1.5)
      .attr("fill", "white")
      .transition()
      .duration(1000)
      .attr("opacity", 1);
  };
}

// driver function
function main() {
  const tp = new ToiletPaper();
  tp.init();
}

// execution
main();
