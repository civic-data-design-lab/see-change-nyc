var screenwidth = $(window).width();

const dataset = d3.csv("./data/nyt_data_.csv").then(function (data) {
  data.forEach(function (d, i) {
    d.yearindex = +d.yearindex;
    d.topicindex = +d.topicindex;
    d.color = d.color;
    d.year = +d.year;
    d.topic = d.topic;
    d.count = +d.count;
    d.radius = +d.radius;
    d.countall = +d.countall;
  });

  for (var i = 0; i < years.length; i++) {
    let year = years[i];
    positionCount = data.filter(d => d.year < year).length;
    yearPosition.push(positionCount);
  }
  createGrid(svg, data);
});

var forceXYear = d3.forceX(d => {if (winWidth > 820) {
  return d.year == 2013 || d.year == 2017 ? width() / 5 - 50 :
    d.year == 2014 || d.year == 2018 ? width() * 2 / 5 - 5 :
    d.year == 2015 || d.year == 2019 ? width() * 3 / 5 + 25 :
    width() * 4 / 5 + 60
}else return width()/2-50}).strength(0.1)

var forceYYear = d3.forceY(d =>{if (winWidth > 820) {
  return d.year == 2013 || d.year == 2014 || d.year == 2015 || d.year == 2016 ? height / 3 - 60 :
    height * 2 / 3 - 60
  }else return (height+80)/8*(d.year%2013)+130}).strength(0.1)

var forceCollide = d3.forceCollide(d => radiusScale(d.count) + 3)
const circleRadius = 6;

//adapt to the screen size 
var winWidth = $(window).width();

var height;
var width = function () {
  if (winWidth > 1100) {
    numPerRow = 55;
    height = 700;
    return 1100;
  } else if (winWidth > 820) {
    numPerRow = 40;
    height = 1000;
    return 800;
  } else {
    numPerRow = 15;
    height = 2300;
    return 380;

  }
};

$(window).resize(function () {
  if (winWidth > 1050) {
    numPerRow = 55;
    height = 900;
    width = 1100;
  } else if (winWidth > 820) {
    numPerRow = 40;
    height = 1000;
    width = 800;
  } else {
    numPerRow = 15;
    height = 2300;
    width = 380;
  }
  location.reload(true);
});





var svg = d3.select('#chart')
  .append('svg')
  .attr('width', width)
  .attr('height', height)

var simulation =
  d3.forceSimulation()
  .force("x", forceXYear)
  .force("y", forceYYear)
  .force("collide", forceCollide)

const spacing = 3;
const margin = 5;
var numPerRow;

const years = [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020];
const forceStrength = 0.02;
var yearPosition = [];
var topicPosition = [];

var radiusScale = d3.scaleLinear().domain([1, 200]).range([6, 100]);
var scale = d3.scaleLinear()
  .domain([0, numPerRow - 1])
  .range([0, circleRadius * numPerRow]);

function positionX(i) {
  return scale(spacing * (i % numPerRow)) + margin +20
}

function positionY(i) {
  return scale(spacing * Math.floor(i / numPerRow) + margin)
}



function createGrid(svg, dataset) {
  const oldDataset = _.cloneDeep(dataset);
  Object.freeze(oldDataset);
  countAscend();

  function circle() {
    // debugger;
    simulation.stop()
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

      .style("opacity", 0.9)
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
      .attr('y', (d, i) => positionY(topicPosition[i]) + 4)
      .transition().duration(800)
      .text(d => d.topic)
      .style("opacity", 1)
      .attr("class", "topictext")
  }
  //sort by year
  function yearAscend() {
    simulation.stop()
    svg.selectAll('text').remove()
    dataset = _.cloneDeep(oldDataset);
    dataset.sort(function (a, b) {
      return a.yearindex - b.yearindex
    })
    removeBlank(dataset, "category", "topicblank")
    circle();
    setTimeout(yearTextAppend, 500);
  }

  //sort by count
  function countAscend() {
    simulation.stop()
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
    setTimeout(topicTextAppend, 500);
  }


  //visual aggregation to bubble
  function groupBubble() {
    simulation.stop()
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
    setTimeout(blow, 1000);
    setTimeout(forceYear, 2000);
    setTimeout(groupTextAppend, 2500);

    function blow() {
      //adjust the radius corresponding to the count
      for (var i = 0; i < dataset.length; i++) {
        dataset[i].radius = radiusScale(dataset[i].count);
      }
      circle();
    }



    function forceYear() {
      dataset.forEach(function (d, i) {
        d.x = positionX(i)
        d.y = positionY(i)

      });
      simulation.nodes(dataset)
        .restart()
        .on('tick', ticked)
        .alpha(0.45)

    };

    function ticked() {
      circles = svg.selectAll('circle')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
    }

    function groupTextAppend() {
      var texts = svg.selectAll("text")
        .data(years).enter()
        .append('text')
        .style("opacity", 0)
        .attr('x', function (d, i) {
          if (winWidth > 820) {
            return ((width() + 140) / 5) * ((i % 4) + 1) - 70
          } else return width() / 2-50
        })
        .attr('y', function (d, i) {
            if (winWidth > 820) {
              return (Math.floor(i / 4) + 1) * height / 3 + 50
          } else return (height / 8) * (i+1) -60
        })
    .transition().duration(800)
      .text((d, i) => years[i])

      .style("opacity", 1)
      .attr("class", "yeartext")
  }
}
}


//disable buttons during forcesimulation
$(document).ready(function () {
  $('#countAscendButton, #yearButton').click(function () {
    $('.btns').removeClass('active').attr("disabled", false);
    $(this).addClass('active').attr("disabled", true);
  });

  $("#groupButton").click(function () {
    $('.btns').removeClass('active').attr("disabled", true);
    $(this).addClass('active');
    // debugger;
    setTimeout(function () {
      $('#countAscendButton, #yearButton').attr("disabled", false)
    }, 2500);
  })
})

//remove topic == blank
function removeBlank(arr, key, value) {
  var i = 0;
  while (i < arr.length) {
    arr[i][key] === value ? arr.splice(i, 1) :
      ++i;
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
    .style("opacity", 0.7)
}

var mousemove = function (d) {
  Tooltip
    .html(" <span class='topic'>" + d.currentTarget.__data__.topic +
      "</span></b><br><hr> was covered " + d.currentTarget.__data__.count +
      " times in " + d.currentTarget.__data__.year)
    .style("left", (d.clientX) -30+ "px")
    .style("top", (d.clientY) - 100 + "px")
}

var mouseleave = function (d) {
  Tooltip
    .style("opacity", 0)
  d3.select(this)
    .style("stroke", "none")
    .style("opacity", 0.9)
}
