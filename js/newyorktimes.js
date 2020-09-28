var dataset = d3.csv("./data/nyt_data.csv").then(function (data) {
  data.forEach(function (d, i) {
    d.index = +d.index;
    d.color = d.color;
    d.year = +d.year;
    d.topic = d.topic;
    d.count = +d.count;
    d.radius = 6;
    d.countall = +d.countall;
    // debugger;
  });
  createGrid(svg, data);
});

var dotRadius = 6;
var width = 1000,
  height = 700;

var svg = d3.select('#chart')
  .append('svg')
  .attr('width', width)
  .attr('height', height)

var spacing = 3;
var margin = 5;
var numPerRow = 50;

var radiusScale = d3.scaleLinear().domain([1, 200]).range([6, 100])
var scale = d3.scaleLinear()
  .domain([0, numPerRow - 1])
  .range([0, dotRadius * numPerRow])

function positionX(i) {
  return scale(spacing * (i % numPerRow)) + margin
}

function positionY(i) {
  return scale(spacing * Math.floor(i / numPerRow) + margin)
}

var forceStrength = 0.02;




function createGrid(svg, dataset) {
  const oldDataset = _.cloneDeep(dataset);
  Object.freeze(oldDataset);


  function circle() {

    var circles = svg.selectAll('circle')
      .data(dataset, d => d.index)
      .join(
        enter => enter.append('circle'),
        update => update
        .attr("class", "key")
        //   .call(update => update.transition().duration(1000)
        // .attr("fill", "red"))
        ,
        exit => exit
        .transition()
        .duration(1000)
        .attr('r', 0)
        .remove()
      )

    circles.attr('fill', d => d.color)

      .style("opacity", 0.7)
      .style("stroke", "none")

      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave)

      .transition()
      .duration(1000)
      .attr('cx', (d, i) => positionX(i))
      .attr('cy', (d, i) => positionY(i))
      .attr('r', d => d.radius)
  }

  circle();


  //buttons for different arrangements
  d3.select("#yearButton")
    .on('click', yearAscend)

  d3.select("#countAscendButton")
    .on('click', countAscend)

  d3.select("#groupButton")
    .on('click', groupBubble)


  //sort by year
  function yearAscend() {

    dataset = _.cloneDeep(oldDataset);
    dataset.sort(function (a, b) {
      return a.year - b.year
    })
    circle();
  }

  //sort by count
  function countAscend() {
    dataset = _.cloneDeep(oldDataset);
    dataset.sort(function (a, b) {
      return a.countall - b.countall
    })
    circle();
  }



  //visual aggregation to bubble
  function groupBubble() {
    var newdataset = [];
    for (var i = 0; i < dataset.length - 1; i++) {
      if ((dataset[i].topic != dataset[i + 1].topic) || (dataset[i].year != dataset[i + 1].year)) {
        newdataset.push(dataset[i])
      }
    }
    dataset = newdataset;
    circle();

    for (var i = 0; i < newdataset.length; i++) {
      newdataset[i].radius = radiusScale(newdataset[i].count);
    }
    setTimeout(circle, 1000);
    // setTimeout(simul, 2000);

    function simul() {
      // simulation
      // circle();

      // circles = svg.selectAll('circle')
      // var simulation = d3.forceSimulation(circles)

      //   //STEP ONE: get them to the middle
      //   .force("x", forceXAll)
      //   .force("y", forceYAll)
      //   //SETP TWO: don't have them collide!
      //   .force("collide", forceCollide)
      //   .on('tick', ticked)

      // function ticked() {
      //   circles = svg.selectAll('circle')
      //     .attr('cx', (d, i) => d.x)
      //     .attr('cy', (d, i) => d.y)
      // }
    }
  }

  // force simulation for big bubbles

  var forceXAll = d3.forceX(width / 2).strength(forceStrength)
  var forceYAll = d3.forceY(height / 2).strength(forceStrength)

  var forceXYear = d3.forceX(d => {
    if (d.year == 2013 || d.year == 2017) {
      return width / 5
    } else if (d.year == 2014 || d.year == 2018) {
      return width * 2 / 5
    } else if (d.year == 2015 || d.year == 2019) {
      return width * 3 / 5
    } else {
      return width * 4 / 5
    }
  }).strength(0.1)

  var forceYYear = d3.forceY(d => {
    if (d.year == 2013 || d.year == 2014 || d.year == 2015 || d.year == 2016) {
      return height / 3
    } else {
      return height * 2 / 3
    }
  }).strength(0.1)

  var forceCollide = d3.forceCollide(d => radiusScale(d.count) + 3)

}





//Tooltip and mouse interaction

var Tooltip = d3.select("#chart")
  .append("div")
  .style("opacity", 0)
  .attr("class", "tooltip")

var mouseover = function (d) {
  Tooltip
    .style("opacity", 1)
  d3.select(this)
    .style("stroke", "grey")
    .style("opacity", 1)
}

var mousemove = function (d) {
  // debugger;
  Tooltip
    .html(" <span class='topic'>" + d.currentTarget.__data__.topic + "</span></b><br><hr> was covered " + d.currentTarget.__data__.count + " times in " + d.currentTarget.__data__.year)
    .style("left", (d.clientX) + "px")
    .style("top", (d.clientY) + "px")
}

var mouseleave = function (d) {
  Tooltip
    .style("opacity", 0)
  d3.select(this)
    .style("stroke", "none")
    .style("opacity", 0.7)
}


$(document).ready(function () {
  $('.btn').click(function () {
    $('.btn').removeClass('active')
    $(this).addClass('active');
  });
})