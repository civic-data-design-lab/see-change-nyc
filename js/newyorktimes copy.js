var dataset = d3.csv("./data/nyt_data3.csv").then(function (data) {
  data.forEach(function (d, i) {
    d.yearindex = +d.yearindex;
    d.topicindex = +d.topicindex;
    d.color = d.color;
    d.year = +d.year;
    d.topic = d.topic;
    d.count = +d.count;
    d.radius = +d.radius;
    d.countall = +d.countall;
    // debugger;
  });

  for (var i = 0; i < years.length; i++) {
    let year = years[i];
    positionCount = data.filter(d => d.year < year).length;
    yearPosition.push(positionCount);
  }

  createGrid(svg, data);
});

var circleRadius = 6;
var width = 1000,
  height = 700;

var svg = d3.select('#chart')
  .append('svg')
  .attr('width', width)
  .attr('height', height)

var spacing = 3;
var margin = 10;
var numPerRow = 50;

let years = [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020];
var forceStrength = 0.02;
var yearPosition = [];
var topicPosition = [];

var radiusScale = d3.scaleLinear().domain([1, 200]).range([6, 100]);
var scale = d3.scaleLinear()
  .domain([0, numPerRow - 1])
  .range([0, circleRadius * numPerRow]);

function positionX(i) {
  return scale(spacing * (i % numPerRow)) + margin
}

function positionY(i) {
  return scale(spacing * Math.floor(i / numPerRow) + margin)
}



function createGrid(svg, dataset) {
  const oldDataset = _.cloneDeep(dataset);
  Object.freeze(oldDataset);

  function circle() {
    // debugger;
    var circles = svg.selectAll('circle')
      .data(dataset, d => d.yearindex)
      .join(
        enter => enter
        .append('circle')
        .attr("class", "circle")
        .attr('cx', (d, i) => positionX(i))
        .attr('cy', (d, i) => positionY(i)),
        update => update,
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

    circles
      .filter((d => d.category === "topicblank") || (d => d.topic === "yearblank"))
      .classed("circle", false)
  }

  circle();
  setTimeout(yearTextAppend, 800);

  //buttons for different arrangements
  d3.select("#yearButton")
    .on('click', yearAscend)

  d3.select("#countAscendButton")
    .on('click', countAscend)

  d3.select("#groupButton")
    .on('click', groupBubble)


  function yearTextAppend() {
    var texts = svg.selectAll("text")
      .data(dataset).enter()
      .filter(d => d.countall == 0)
      .append('text')
      .style("opacity", 0)
      .attr('x', (d, i) => positionX(yearPosition[i]) - 3)
      .attr('y', (d, i) => positionY(yearPosition[i]) + 4)
      .transition().duration(800)
      .text(d => d.year)
      .style("opacity", 1)
      .attr("class", "yeartext")
  }

  function topicTextAppend() {
    var texts = svg.selectAll("text")
      .data(dataset).enter()
      .filter(d => d.count == 9999)
      .append('text')
      .style("opacity", 0)
      .attr('x', (d, i) => positionX(topicPosition[i]) - 3)
      .attr('y', (d, i) => positionY(topicPosition[i]) +4)
      .transition().duration(800)
      .text(d => d.topic)
      .style("opacity", 1)
      .attr("class", "topictext")
  }
  //sort by year
  function yearAscend() {
    svg.selectAll('text').remove()
    dataset = _.cloneDeep(oldDataset);
    dataset.sort(function (a, b) {
      return a.yearindex - b.yearindex
    })
    removeBlank(dataset, "category", "topicblank")
    circle();
    setTimeout(yearTextAppend, 750);
  }

  //sort by count
  function countAscend() {
    svg.selectAll('text').remove()
    dataset = _.cloneDeep(oldDataset);
    dataset.sort(function (a, b) {
      return a.topicindex - b.topicindex
    })

      // store topic text positions to array
    let topics = [];
    for (var i = 0; i < dataset.length; i++) {
      topics.push(dataset[i].topic);
    }
    topics = _.uniq(topics)
    topics.pop()
    var x = 0;
    topicPosition.push(0)
    for (var i = 0; i < topics.length; i++) {
      let topic = topics[i];
      positionCount = dataset.filter(d => d.topic == topic).length;
      x = x + positionCount;
      topicPosition.push(x);
    }

    removeBlank(dataset, "topic", "yearblank")
    circle();
    setTimeout(topicTextAppend, 750);
  }


  //visual aggregation to bubble
  function groupBubble() {
    svg.selectAll('text').remove()
    //populalte a new dataset with key elements
    var newdataset = [];
    for (var i = 0; i < dataset.length - 1; i++) {
      if ((dataset[i].topic != dataset[i + 1].topic) || (dataset[i].year != dataset[i + 1].year)) {
        newdataset.push(dataset[i])
      }
    }
    removeBlank(newdataset, "topic", "yearblank")
    removeBlank(newdataset, "category", "topicblank")

    //replace dataset with the new set
    dataset = _.cloneDeep(newdataset);
    circle();
    //adjust the radius corresponding to the count
    for (var i = 0; i < dataset.length; i++) {
      dataset[i].radius = radiusScale(dataset[i].count);
    }
    setTimeout(circle, 1000);
    setTimeout(simulation, 2000);
    setTimeout(groupTextAppend, 3500);


    function yearpositionX(i) {
      return ((width +140) / 5) * ((i % 4) + 1) -70
    }
    function yearpositionY(i) {
      return (Math.floor(i/4)+1) * height/3 +50
    }

    function groupTextAppend() {
      var texts = svg.selectAll("text")
        .data(years).enter()
        .append('text')
        .style("opacity", 0)
        .attr('x', (d, i) => yearpositionX(i))
        .attr('y', (d, i) => yearpositionY(i))

        .transition().duration(800)
        .text((d, i) => years[i])

        .style("opacity", 1)
        .attr("class", "yeartext")
    }

    function simulation() {
      //initialize the circles' positions when forced
      dataset.forEach(function (d, i) {
        d.x = positionX(i)
        d.y = positionY(i)
        d.vx = d.vy = 0;
      });

      setTimeout(center, 200);
      setTimeout(year, 2000)

      //force to center
      function center() {
        d3.forceSimulation(dataset)
          .force("x", forceXAll)
          .force("y", forceYAll)
          .force("collide", forceCollide)
          .on('tick', ticked)
      }

      //force to be grouped by year
      function year() {
        d3.forceSimulation(dataset)
          .force("x", forceXYear)
          .force("y", forceYYear)
          .force("collide", forceCollide)
          .on('tick', ticked)
      }

      function ticked() {
        circles = svg.selectAll('circle')
          .attr('cx', (d, i) => d.x)
          .attr('cy', (d, i) => d.y)
      }
    }
  }

  // force simulation for big bubbles

  var forceXAll = d3.forceX(width / 2).strength(forceStrength)
  var forceYAll = d3.forceY(height / 2).strength(forceStrength)

  var forceXYear = d3.forceX(d => {
    if (d.year == 2013 || d.year == 2017) {
      return width / 5 - 50
    } else if (d.year == 2014 || d.year == 2018) {
      return width * 2 / 5 -5
    } else if (d.year == 2015 || d.year == 2019) {
      return width * 3 / 5 +25
    } else {
      return width * 4 / 5 + 60
    }
  }).strength(0.1)

  var forceYYear = d3.forceY(d => {
    if (d.year == 2013 || d.year == 2014 || d.year == 2015 || d.year == 2016) {
      return height / 3 -60
    } else {
      return height * 2 / 3 -60
    }
  }).strength(0.1)

  var forceCollide = d3.forceCollide(d => radiusScale(d.count) + 3)
}

//remove topic == blank
function removeBlank(arr, key, value) {
  var i = 0;
  while (i < arr.length) {
    if (arr[i][key] === value) {
      arr.splice(i, 1);
    } else {
      ++i;
    }
  }
  return arr;
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
    .html(" <span class='topic'>" + d.currentTarget.__data__.topic +
      "</span></b><br><hr> was covered " + d.currentTarget.__data__.count +
      " times in " + d.currentTarget.__data__.year)
    .style("left", (d.clientX) + 20 + "px")
    .style("top", (d.clientY) + 20 + "px")
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