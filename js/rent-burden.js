// nav display on load
$(document).ready(function(){
	$("#nav>ul>li>ul>li").addClass("grey");
})

// nav borough filter display
function filterBoroughNav(boroughId) {
	$("#city").addClass("grey").css("color", "#aaa");
	$("#borough").removeClass("grey").css("color", "#000");

	$("#nav>ul>li>ul>li").addClass("grey").css("color", "#aaa");
	$("#" + boroughId).removeClass("grey").css("color", "#000");
	if (boroughId == "nyc") {
		$("#currentborough").html("&mdash;All");
	} else if (boroughId == "statenisland") {
		$("#currentborough").html("&mdash;Staten Island");
	}
	else {
		$("#currentborough").html("&mdash;" + boroughId);
	}
}

// nav clicks
$("#city").on("click", function() {
	$(this).removeClass("grey").css("color", "#000");
	$("#borough").addClass("grey").css("color", "#aaa");

	$("#nav>ul>li>ul>li").addClass("grey").css("color", "#aaa");
	$("#currentborough").html("");


});
$("#borough").on("click", function() {
	$(this).removeClass("grey").css("color", "#000");
	$("#city").addClass("grey").css("color", "#aaa");

	$("#nav>ul>li>ul>li").addClass("grey").css("color", "#aaa");
	$("#nyc").removeClass("grey").css("color", "#000");
	$("#currentborough").html("&mdash;All");

});
// nav click by filtering boroughs
$("#nav>ul>li>ul>li").on("click", function() {
	filterBoroughNav($(this).attr("id"));

	let chartBoroughClass = ".chart" + $(this).attr("id");
	$(chartBoroughClass).css("display", "block");
})



//RENT BURDEN CHART


var width = window.innerWidth-100, height = window.innerHeight-100, sizeDivisor = 100, nodePadding = 1;

var graphwidth = 890
var graphheight = 600

var svg = d3.select("#chart-rentburden")
		.append("svg")
		.attr("class", "box")
		.attr("width", width)
		.attr("height", height)
		.attr("viewBox", "30, 110, 665, 665") ;


tooltip = d3.select("body")
		.append("div")
		.attr("class", "tooltip")
tooltip2 = d3.select("body")
		.append("div")
		.attr("class", "tooltip2")
tooltip3 = d3.select("body")
		.append("div")
		.attr("class", "tooltip2")

	
  //VISUALIZATION
  
  d3.csv('./data/nyc_pums_count_names.csv')
			.then(function(data) {
  
		  //WEIGH DATA
  
			  var length = data.length
			  var weighted = []
			  for (i = 0; i < length; i++) {
				  row = data[i]
				  weight = data[i].n
				  for (j = 0; j<weight; j++) {
					  weighted.push(row)
				  }
			  }
  
		  //SORT DATA
  
			  //BOROUGH
  
			  var categories = ["Bronx", "Queens", "Brooklyn", "Staten Island", "Manhattan"]
				var n = categories.length
  
				var borough = {}
				for (i = 0; i < n; i++) {
				  key = categories[i]
				  filterborough = weighted.filter(function(d) {return d.borough == key})
				  len = filterborough.length
				  b = []
				  for (j = 0; j < len; j++) {
					  m = filterborough[j].GRPIP
					  b.push(m)
				  }
				  borough[key] = b
				} 
			  
  
			  //DISTRICTS
  
				  var bronx = {}
				  var brooklyn = {}
				  var manhattan = {}
				  var statenisland = {}
				  var queens = {}
  
				  var bronxdistricts = []
				  var brooklyndistricts = []
				  var manhattandistricts = []
				  var statenislanddistricts = []
				  var queensdistricts = []
  
				  for (i = 0; i < n; i++) {
					  var key = categories[i]
					  var filterborough =  data.filter(function(d) {return d.borough == key})
					  var districts = d3.map(filterborough, function(d){return(d.nyc_pums_Name)}).keys()
						  if (key == "Bronx") { bronxdistricts.push(districts)}
							  else if (key == "Brooklyn") { brooklyndistricts.push(districts)}
							  else if (key == "Manhattan") { manhattandistricts.push(districts)}
							  else if (key == "Staten Island") { statenislanddistricts.push(districts)}
							  else if (key == "Queens") {queensdistricts.push(districts)}
					  var m = districts.length
					  for (j = 0; j < m; j++) {
						  var keyd = districts[j]
						  filterdistrict = filterborough.filter(function(d) {return d.nyc_pums_Name == keyd})		
						  len = filterdistrict.length
						  b = []
						  for (k = 0; k < len; k++) {
							  p = filterdistrict[k].GRPIP
							  b.push(p)
						  }
						  if (key == "Bronx") { bronx[keyd] = b}
						  else if (key == "Brooklyn") { brooklyn[keyd] = b}
						  else if (key == "Manhattan") { manhattan[keyd] = b}
						  else if (key == "Staten Island") { statenisland[keyd] = b}
						  else if (key == "Queens") {queens[keyd] = b}
						  }
				  }

		//SUMMARY STATS

		allstats = []
		alllength = weighted.length
		allnot = 0
		allburdened = 0
		allsevere = 0
		for (i = 0; i < alllength; i++) {
			if (weighted[i].GRPIP <= 30) { allnot += 1 }
			else if (weighted[i].GRPIP > 30 && weighted[i].GRPIP <= 50 ) { allburdened +=1 }
			else if (weighted[i].GRPIP > 50) {allsevere += 1}
		}
		allstats.push({not: allnot, burdened: allburdened, severe: allsevere})

		boroughstats = {}
		for (i = 0; i < n; i++) {
			var key = categories[i]
			not = 0
			burdened = 0
			severe = 0
			borolength = borough[key].length
			for (j = 0; j < borolength; j++) {
				if (borough[key][j] <= 30) { not += 1 }
				else if (borough[key][j] > 30 && borough[key][j] <= 50 ) { burdened +=1 }
				else if (borough[key][j] > 50) {severe += 1}
			}
			stat = {not: not, burdened: burdened, severe: severe}
			boroughstats[key] = stat
		}

		  //X AXIS
				var x = d3.scaleLinear()
					  .domain([0, 100])
					  .range([ 0, graphwidth ]);
				  svg.append("g")
					  .attr("class", "axis")
					  .attr("transform", "translate(0," + (700) + ")")
					  .call(d3.axisBottom(x).tickValues([0,30,50,100]).tickSize(0) )
					  .select(".domain").remove()
				  svg.append("text")
					  .attr("text-anchor", "end")
					  .attr("class", "axislabel")
					  .attr("x", graphwidth)
					  .attr("y", 745)
					  .text("% INCOME SPENT ON RENT");
  
		  //Y AXIS
				  var y = d3.scaleLinear()
					  .domain([0, 0.13])
					  .range([ height+140, 120]);
				  var yName = d3.scaleBand()
					  .domain(["BRONX", "QUEENS", "BROOKLYN", "STATEN ISLAND", "MANHATTAN"])
					  .range([440, 665])
					  .paddingInner(0)
				  svg.append("g")
					  .call(d3.axisLeft(yName).tickSize(0))
					  .attr("class", "axis")
					  .attr("id", "yaxis")
					  .attr("transform", "translate(" + -10  + "," + "5)")
					  .select(".domain").remove()
  
  
		  //GRAPH BACKGROUND
  
			  svg.append("rect")
				  .attr("width", (graphwidth))
				  .attr("id", "bg")
				  .attr("height", graphheight)
				  .attr("transform", "translate(0," + (100) + ")")
				  .attr("fill", "#3E52C2");
			  svg.append("rect")
				  .attr("width", (graphwidth)*0.5)
				  .attr("height", graphheight)
				  .attr("transform", "translate(0," + (100) + ")")
				  .attr("fill", "#5896B7");
			  svg.append("rect")
				  .attr("width", (graphwidth)*0.3)
				  .attr("height", graphheight)
				  .attr("transform", "translate(0," + (100) + ")")
				  .attr("fill", "#72DAAC");


			svg.append("text")
				.text("NOT BURDENED")
				.attr("class", "statstitle")
				.attr("text-anchor", "middle")
				.attr("x", (graphwidth*0.15))
				.attr("y", 190);
			svg.append("text")
				.html(allstats[0].not + "HOUSEHOLDS CAN PAY RENT")
				.attr("class", "stats")
				.attr("text-anchor", "middle")
				.attr("id", "notburdened")
				.attr("x", (graphwidth*0.15))
				.attr("y", 205);
			svg.append("text")
				.html("WITHOUT BURDEN")
				.attr("class", "stats")
				.attr('dy', '1em')
				.attr("text-anchor", "middle")
				.attr("x", (graphwidth*0.15))
				.attr("y", 205);

			svg.append("text")
				.text("RENT BURDENED")
				.attr("class", "statstitle")
				.attr("text-anchor", "middle")
				.attr("x", (graphwidth*0.4))
				.attr("y", 190);
			svg.append("text")
				.attr("class", "stats")
				.html(allstats[0].burdened + " HOUSEHOLDS STRUGGLE")
				.attr("text-anchor", "middle")
				.attr("id", "burdened")
				.attr("x", (graphwidth*0.4))
				.attr("y", 205);
			svg.append("text")
				.attr("class", "stats")
				.attr('dy', '1em')
				.html("TO PAY RENT")
				.attr("text-anchor", "middle")
				.attr("x", (graphwidth*0.4))
				.attr("y", 205);
			
			svg.append("text")
				.text("SEVERELY RENT BURDENED")
				.attr("class", "statstitle")
				.attr("text-anchor", "middle")
				.attr("x", (graphwidth*0.75))
				.attr("y", 190);
			svg.append("text")
				.html(allstats[0].severe + " HOUSEHOLDS SEVERELY STRUGGLE")
				.attr("class", "stats")
				.attr("text-anchor", "middle")
				.attr("id", "severelyburdened")
				.attr("x", (graphwidth*0.75))
				.attr("y", 205)
			svg.append("text")
				.html("TO PAY RENT")
				.attr('dy', '1em')
				.attr("class", "stats")
				.attr("text-anchor", "middle")
				.attr("x", (graphwidth*0.75))
				.attr("y", 205)


  
  
		  //DENSITY & FREQUENCY CALCULATIONS
  
			  //ALl BOROUGHS
  
				  var kde = kernelDensityEstimator(kernelEpanechnikov(5), x.ticks(80)) // increase this 40 for more accurate density.
					  var allDensity = []
					  for (i = 0; i < n; i++) {
						  key = categories[i]
						  density = kde(borough[key])
						  len = borough[key].length
						  var freq = {}
						  for(var j = 0; j < len; j++){
							  var num = borough[key][j];
							  freq[num] = freq[num] ? freq[num] + 1 : 1;
						  }
						  allDensity.push({key: key.toUpperCase(), density: density, frequency: freq})
					  }
  
				  //DISTRICTS
  
					  var bronxdensity = []
					  var brooklyndensity = []
					  var manhattandensity = []
					  var statenislanddensity = []
					  var queensdensity = []
  
					  for (i = 0; i < n; i++) {
						  var key = categories[i]
						  if (key == "Bronx") { 
							  values = bronx
							  districts = bronxdistricts
							  densityb = bronxdensity}
						  else if (key == "Brooklyn") { 
							  values = brooklyn
							  districts = brooklyndistricts
							  densityb = brooklyndensity}
						  else if (key == "Manhattan") { 
							  values = manhattan
							  districts = manhattandistricts
							  densityb = manhattandensity}
						  else if (key == "Staten Island") { 
							  values = statenisland
							  districts = statenislanddistricts
							  densityb = statenislanddensity}
						  else if (key == "Queens") {
							  values = queens
							  districts = queensdistricts
							  densityb = queensdensity}
						  m = districts[0].length
						  for (j = 0; j < m; j++) {
							  keyd = districts[0][j]
							  density = kde(values[keyd])
						  densityb.push({key: keyd, density: density})
						  }
					  }
  
  
		  //RIDGELINE PLOT
  
			  //ALL BOROUGHS
  
				  svg.selectAll("areas")
				  .data(allDensity)
				  .enter()
				  .append("path")
					  .attr("transform", function(d){return("translate(0," + (yName(d.key)-height-100) +")" )})
				  .attr("fill", "white")
				  .attr("fill-opacity", 0.35)
				  .attr("stroke", "white")
				  .attr("stroke-width", 3)
				  .attr("id", "borough-chart")
				  .style("visibility", "visible")
				  .datum(function(d){return(d.density)})
				  .attr("d",  d3.line()
					  .curve(d3.curveBasis)
					  .x(function(d) { return x(d[0]); })
					  .y(function(d) { return y(d[1]); })
				  )
  
			  //BY BOROUGH
				  y.domain([0, 0.25])
				  yName.domain(bronxdistricts[0]).range([300, 665])
			  
				  svg.selectAll("areas")
				  .data(bronxdensity)
				  .enter()
				  .append("path")
					  .attr("transform", function(d){return("translate(0," + (yName(d.key)-height-100) +")" )})
				  .attr("fill", "white")
				  .attr("fill-opacity", 0.45)
				  .attr("stroke", "white")
				  .attr("stroke-width", 2)
				  .attr("id", "bronx-chart")
				  .style("visibility", "hidden")
				  .datum(function(d){return(d.density)})
				  .attr("d",  d3.line()
					  .curve(d3.curveBasis)
					  .x(function(d) { return x(d[0]); })
					  .y(function(d) { return y(d[1]); })
				  )

				  y.domain([0, 0.25])
				  yName.domain(brooklyndistricts[0]).range([250, 665])
			  
				  svg.selectAll("areas")
				  .data(brooklyndensity)
				  .enter()
				  .append("path")
					  .attr("transform", function(d){return("translate(0," + (yName(d.key)-height-100) +")" )})
				  .attr("fill", "white")
				  .attr("fill-opacity", 0.45)
				  .attr("stroke", "white")
				  .attr("stroke-width", 2)
				  .attr("id", "brooklyn-chart")
				  .style("visibility", "hidden")
				  .datum(function(d){return(d.density)})
				  .attr("d",  d3.line()
					  .curve(d3.curveBasis)
					  .x(function(d) { return x(d[0]); })
					  .y(function(d) { return y(d[1]); })
				  )

				  y.domain([0, 0.25])
				  yName.domain(queensdistricts[0]).range([250, 665])
			  
				  svg.selectAll("areas")
				  .data(queensdensity)
				  .enter()
				  .append("path")
					  .attr("transform", function(d){return("translate(0," + (yName(d.key)-height-100) +")" )})
				  .attr("fill", "white")
				  .attr("fill-opacity", 0.45)
				  .attr("stroke", "white")
				  .attr("stroke-width", 2)
				  .attr("id", "queens-chart")
				  .style("visibility", "hidden")
				  .datum(function(d){return(d.density)})
				  .attr("d",  d3.line()
					  .curve(d3.curveBasis)
					  .x(function(d) { return x(d[0]); })
					  .y(function(d) { return y(d[1]); })
				  )

				  y.domain([0, 0.25])
				  yName.domain(manhattandistricts[0]).range([300, 665])
			  
				  svg.selectAll("areas")
				  .data(manhattandensity)
				  .enter()
				  .append("path")
					  .attr("transform", function(d){return("translate(0," + (yName(d.key)-height-100) +")" )})
				  .attr("fill", "white")
				  .attr("fill-opacity", 0.45)
				  .attr("stroke", "white")
				  .attr("stroke-width", 2)
				  .attr("id", "manhattan-chart")
				  .style("visibility", "hidden")
				  .datum(function(d){return(d.density)})
				  .attr("d",  d3.line()
					  .curve(d3.curveBasis)
					  .x(function(d) { return x(d[0]); })
					  .y(function(d) { return y(d[1]); })
				  )

				  y.domain([0, 0.25])
				  yName.domain(statenislanddistricts[0]).range([400, 665])
			  
				  svg.selectAll("areas")
				  .data(statenislanddensity)
				  .enter()
				  .append("path")
					  .attr("transform", function(d){return("translate(0," + (yName(d.key)-height-100) +")" )})
				  .attr("fill", "white")
				  .attr("fill-opacity", 0.45)
				  .attr("stroke", "white")
				  .attr("stroke-width", 2)
				  .attr("id", "statenisland-chart")
				  .style("visibility", "hidden")
				  .datum(function(d){return(d.density)})
				  .attr("d",  d3.line()
					  .curve(d3.curveBasis)
					  .x(function(d) { return x(d[0]); })
					  .y(function(d) { return y(d[1]); })
				  )
  
  
		  //BUTTONS

  
			  d3.select("#bronx").on("click", function() { 
			  d3.selectAll("#borough-chart, #brooklyn-chart, #queens-chart, #manhattan-chart, #statenisland-chart")
			  .transition()
				  .duration(300)
				  .style("visibility", "hidden")
			  d3.selectAll("#bronx-chart")
			  .style("opacity", 0)
			  .transition() 
				  .delay(100)
				  .style("visibility", "visible")
				  .duration(200)
				  .ease(d3.easeLinear).style("opacity",0.7)
			  y.domain([0, 0.25])
			  yName.domain(bronxdistricts[0]).range([300, 665])
			  svg.select("#yaxis")
			  .call(d3.axisLeft(yName).tickSize(0))
				  .style("font-size", "10px")
				  .attr("transform", "translate(" + -10  + ", "+ 12 + ")")
				  .select(".domain").remove()
				boroughnumber = 0
				tooltip2.style("opacity", 0)
				tooltip3.style("opacity", 0.9)
				d3.selectAll("#notburdened").html(boroughstats.Bronx.not + " HOUSEHOLDS CAN PAY RENT")
				d3.selectAll("#burdened").html(boroughstats.Bronx.burdened +  " HOUSEHOLDS STRUGGLE")
				d3.selectAll("#severelyburdened").html(boroughstats.Bronx.severe +  " HOUSEHOLDS SEVERELY STRUGGLE")
			
			})

			  d3.select("#brooklyn").on("click", function() { 
				d3.selectAll("#borough-chart, #bronx-chart, #queens-chart, #manhattan-chart, #statenisland-chart")
				.transition()
					.duration(300)
					.style("visibility", "hidden")
				d3.selectAll("#brooklyn-chart")
				.style("opacity", 0)
				.transition() 
					.delay(100)
					.style("visibility", "visible")
					.duration(200)
					.ease(d3.easeLinear).style("opacity",0.7)
				y.domain([0, 0.25])
				yName.domain(brooklyndistricts[0]).range([250, 665])
				svg.select("#yaxis")
				.call(d3.axisLeft(yName).tickSize(0))
					.style("font-size", "10px")
					.attr("transform", "translate(" + -10  + ", "+ 20 + ")")
					.select(".domain").remove()
				boroughnumber = 2
				tooltip2.style("opacity", 0)
				tooltip3.style("opacity", 0.9)
				d3.selectAll("#notburdened").html(boroughstats.Brooklyn.not + " HOUSEHOLDS CAN PAY RENT")
				d3.selectAll("#burdened").html(boroughstats.Brooklyn.burdened +  " HOUSEHOLDS STRUGGLE")
				d3.selectAll("#severelyburdened").html(boroughstats.Brooklyn.severe +  " HOUSEHOLDS SEVERELY STRUGGLE")

			})

			d3.select("#queens").on("click", function() { 
				d3.selectAll("#borough-chart, #bronx-chart, #brooklyn-chart, #manhattan-chart, #statenisland-chart")
				.transition()
					.duration(300)
					.style("visibility", "hidden")
				d3.selectAll("#queens-chart")
				.style("opacity", 0)
				.transition() 
					.delay(100)
					.style("visibility", "visible")
					.duration(200)
					.ease(d3.easeLinear).style("opacity",0.7)
				y.domain([0, 0.25])
				yName.domain(queensdistricts[0]).range([250, 665])
				svg.select("#yaxis")
				.call(d3.axisLeft(yName).tickSize(0))
					.style("font-size", "10px")
					.attr("transform", "translate(" + -10  + ", "+ 15 + ")")
					.select(".domain").remove()
				boroughnumber = 1
				tooltip2.style("opacity", 0)
				tooltip3.style("opacity", 0.9)
				d3.selectAll("#notburdened").html(boroughstats.Queens.not + " HOUSEHOLDS CAN PAY RENT")
				d3.selectAll("#burdened").html(boroughstats.Queens.burdened +  " HOUSEHOLDS STRUGGLE")
				d3.selectAll("#severelyburdened").html(boroughstats.Queens.severe +  " HOUSEHOLDS SEVERELY STRUGGLE")
			
			})

			d3.select("#manhattan").on("click", function() { 
				d3.selectAll("#borough-chart, #bronx-chart, #brooklyn-chart, #queens-chart, #statenisland-chart")
				.transition()
					.duration(300)
					.style("visibility", "hidden")
				d3.selectAll("#manhattan-chart")
				.style("opacity", 0)
				.transition() 
					.delay(100)
					.style("visibility", "visible")
					.duration(200)
					.ease(d3.easeLinear).style("opacity",0.7)
				y.domain([0, 0.25])
				yName.domain(manhattandistricts[0]).range([300, 665])
				svg.select("#yaxis")
				.call(d3.axisLeft(yName).tickSize(0))
					.style("font-size", "10px")
					.attr("transform", "translate(" + -10  + ", "+ 13 + ")")
					.select(".domain").remove()
				boroughnumber = 4
				tooltip2.style("opacity", 0)
				tooltip3.style("opacity", 0.9)
				d3.selectAll("#notburdened").html(boroughstats.Manhattan.not + " HOUSEHOLDS CAN PAY RENT")
				d3.selectAll("#burdened").html(boroughstats.Manhattan.burdened +  " HOUSEHOLDS STRUGGLE")
				d3.selectAll("#severelyburdened").html(boroughstats.Manhattan.severe +  " HOUSEHOLDS SEVERELY STRUGGLE")
			
			})

			d3.select("#statenisland").on("click", function() { 
				d3.selectAll("#borough-chart, #bronx-chart, #brooklyn-chart, #queens-chart, #manhattan-chart")
				.transition()
					.duration(300)
					.style("visibility", "hidden")
				d3.selectAll("#statenisland-chart")
				.style("opacity", 0)
				.transition() 
					.delay(100)
					.style("visibility", "visible")
					.duration(200)
					.ease(d3.easeLinear).style("opacity",0.7)
				y.domain([0, 0.25])
				yName.domain(statenislanddistricts[0]).range([400, 665])
				svg.select("#yaxis")
				.call(d3.axisLeft(yName).tickSize(0))
					.style("font-size", "10px")
					.attr("transform", "translate(" + -10  + ", "+ 0 + ")")
					.select(".domain").remove()
				boroughnumber = 3
				tooltip2.style("opacity", 0)
				tooltip3.style("opacity", 0.9)
				d3.selectAll("#notburdened").html(boroughstats['Staten Island'].not + " HOUSEHOLDS CAN PAY RENT")
				d3.selectAll("#burdened").html(boroughstats['Staten Island'].burdened +  " HOUSEHOLDS STRUGGLE")
				d3.selectAll("#severelyburdened").html(boroughstats['Staten Island'].severe +  " HOUSEHOLDS SEVERELY STRUGGLE")
			
			})

			d3.select("#nyc").on("click", function() { 
				d3.selectAll("#bronx-chart, #brooklyn-chart, #queens-chart, #manhattan-chart, #statenisland-chart")
				.transition()
					.duration(300)
					.style("visibility", "hidden")
				d3.selectAll("#borough-chart")
				.style("opacity", 0)
				.transition() 
					.delay(100)
					.style("visibility", "visible")
					.duration(200)
					.ease(d3.easeLinear).style("opacity",0.7)
				y.domain([0, 0.13])
				yName.domain(["BRONX", "QUEENS", "BROOKLYN", "STATEN ISLAND", "MANHATTAN"]).range([440, 665])
				svg.select("#yaxis")
				.call(d3.axisLeft(yName).tickSize(0))
					.style("font-size", "12px")
					.attr("transform", "translate(" + -10  + ",0)")
					.select(".domain").remove()
				tooltip2.style("opacity", 0.9)
				tooltip3.style("opacity", 0)
				d3.selectAll("#notburdened").html(allstats[0].not + " HOUSEHOLDS CAN PAY RENT")
				d3.selectAll("#burdened").html(allstats[0].burdened +  " HOUSEHOLDS STRUGGLE")
				d3.selectAll("#severelyburdened").html(allstats[0].severe +  " HOUSEHOLDS SEVERELY STRUGGLE")
			
			})
  
		  //TOOLTIP
		var boroughnumber = 0

		var mouseG = svg.append("g")
		  .attr("class", "mouse-over-effects");
  
		  mouseG.append("path")
		  .attr("class", "mouse-line")
		  .style("stroke", "white")
		  .style("stroke-width", "1px")
		  .style("opacity", "0");
  
		  mouseG.append('svg:rect') 
		  .attr('width', graphwidth) 
		  .attr('height', graphheight+100)
		  .attr('fill', 'none')
		  .attr('id', 'rect1')
		  .attr('pointer-events', 'all')
		  .on('mouseout', function() { 
			  d3.select(".mouse-line")
			  .style("opacity", "0")
			  .style("color", "white");
			  tooltip.style("visibility", "hidden")
			  tooltip2.style("visibility", "hidden")
			  tooltip3.style("visibility", "hidden")
			  })
		  .on('mouseover', function() { 
			  d3.select(".mouse-line")
			  .style("opacity", "1")
			  .style("color", "white");
			  tooltip.style("visibility", "visible")
			  tooltip2.style("visibility", "visible")
			  tooltip3.style("visibility", "visible")
			  })
		  .on('mousemove', function() { 
			  var mouse = d3.mouse(this);
			  d3.select(".mouse-line")
			  .attr("d", function() {
				  var d = "M" + mouse[0] +  "," + graphheight+100;
				  d += " " + mouse[0]  + "," + 100;
				  return d;
				  })
			  var x = document.getElementById('bg').getBoundingClientRect().height
			  var y = Math.round((mouse[0]/(graphwidth))*100)
			  var percentcolor = ""
				  if (y<=30){percentcolor = "#72DAAC"}
				  else if (y>30 && y<=50 ){percentcolor = "#5896B7"}
				  else if (y>50){percentcolor = "#3E52C2"}
			  tooltip.style("top", (x+20)+"px").style("left",(d3.event.pageX-10)+"px").html(  y + "%" ).style("color", percentcolor)
			  tooltip2.style("top", (d3.event.pageY-200)+"px").style("left",(d3.event.pageX+10)+"px")
				  .html("<p style = 'font-family: Graphik-Bold; color:" + percentcolor + "';>" + "<span style = 'font-size: 16px;'>" + y + "%" + "</span>" + "<span>" + " OF INCOME IS SPENT ON RENT BY " + "</span></p>"
					  + "<p>" + allDensity[0].frequency[y] + " households in " + allDensity[0].key + "<br>"
					  + allDensity[1].frequency[y] + " households in " + allDensity[1].key + "<br>"
					  + allDensity[2].frequency[y] + " households in " + allDensity[2].key + "<br>"
					  + allDensity[3].frequency[y] + " households in " + allDensity[3].key + "<br>"
					  + allDensity[4].frequency[y] + " households in " + allDensity[4].key + "</p>"
					  )
			 tooltip3.style("top", (d3.event.pageY-120)+"px").style("left",(d3.event.pageX+10)+"px")
					  .html("<p style = 'font-family: Graphik-Bold; color:" + percentcolor + "';>" + "<span style = 'font-size: 16px;'>" + y + "%" + "</span>" + "<span>" + " OF INCOME IS SPENT ON RENT BY " + "</span></p>"
						  + "<p>" + allDensity[boroughnumber].frequency[y] + " households in " + allDensity[boroughnumber].key + "</p>")
			  })
			tooltip3.style("opacity", 0)
  })
  
  //DENSITY FUNCTIONS
  function kernelDensityEstimator(kernel, X) {
	return function(V) {
	  return X.map(function(x) {
		return [x, d3.mean(V, function(v) { return kernel(x - v); })];
	  });
	};
  }
  function kernelEpanechnikov(k) {
	return function(v) {
	  return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
	};
  }
  