// nav display on load
$(document).ready(function(){
	$("#nav>ul>li>ul>li").addClass("grey");
	$("#nyc").removeClass("grey").css("color", "#000");
})

// nav borough filter display
function filterBoroughNav(boroughId) {
	$("#nav>ul>li>ul>li").addClass("grey").css("color", "#d1d3d4");
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
$("#borough").on("click", function() {
	$("#nav>ul>li>ul>li").addClass("grey").css("color", "#d1d3d4");
	$("#nyc").removeClass("grey").css("color", "#000");
	filterBoroughNav("#nyc");
});
// nav click by filtering boroughs
$("#nav>ul>li>ul>li").on("click", function() {
	filterBoroughNav($(this).attr("id"));

	let chartBoroughClass = ".chart" + $(this).attr("id");
	$(chartBoroughClass).css("display", "block");
})

//RENT BURDEN CHART

//PARSE DATA
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
	alllength = weighted.length

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


	//GRAPH BACKGROUND
	svg.append("text")
		.html(allstats[0].not.toLocaleString() + " HOUSEHOLDS")
		.attr("class", "stats")
		.attr("text-anchor", "middle")
		.attr("id", "notburdened")
		.attr("x", (graphwidth*0.15))
		.attr("y", 205);
	svg.append("text")
		.attr("class", "stats")
		.html(allstats[0].burdened.toLocaleString() + " HOUSEHOLDS")
		.attr("text-anchor", "middle")
		.attr("id", "burdened")
		.attr("x", (graphwidth*0.4))
		.attr("y", 205);
	svg.append("text")
		.html(allstats[0].severe.toLocaleString() + " HOUSEHOLDS")
		.attr("class", "stats")
		.attr("text-anchor", "middle")
		.attr("id", "severelyburdened")
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
			var perc = {}
			for(var j = 0; j < len; j++){
				var num = borough[key][j];
				freq[num] = freq[num] ? freq[num] + 1 : 1;
			}
			for (var k = 1; k < 101; k++){
				if (freq[k] > 0){
				perc[k] = (freq[k] / len)*100}
				else {perc[k] = 0}
			}
			allDensity.push({key: key.toUpperCase(), density: density, frequency: freq, percent: perc})
		}
		for (i = 0; i < n; i++) {
			allDensity[i].density[0][1] = 0
		}

		console.log(allDensity)


	//DISTRICTS
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
			var freq = {}
			var perc = {}
			var len = values[keyd].length
			for(var k = 0; k < len; k++){
				var num = values[keyd][k];
				freq[num] = freq[num] ? freq[num] + 1 : 1;
			}
			for (var l = 1; l < 101; l++){
				if (freq[l] > 0){
				perc[l] = (freq[l] / len)*100}
				else {perc[l] = 0}
			}
			densityb.push({key: keyd, density: density, frequency: freq, percent: perc})
		}
	  }

	for (i = 0; i < bronxdistricts[0].length; i++) {
		bronxdensity[i].density[0][1] = 0
	}
	for (i = 0; i < brooklyndistricts[0].length; i++) {
		brooklyndensity[i].density[0][1] = 0
	}
	for (i = 0; i < queensdistricts[0].length; i++) {
		queensdensity[i].density[0][1] = 0
	}
	for (i = 0; i < manhattandistricts[0].length; i++) {
		manhattandensity[i].density[0][1] = 0
	}
	for (i = 0; i < statenislanddistricts[0].length; i++) {
		statenislanddensity[i].density[0][1] = 0
	}

	//RIDGELINE PLOT

	//ALL BOROUGHS
	svg.selectAll("areas")
		.append("g")
			.attr("class", "ridgeline")
		.data(allDensity)
		.enter()
		.append("path")
			.attr("transform", function(d){return("translate(0," + (yName(d.key)-height-100) +")" )})
			.attr("fill", "white")
			.attr("fill-opacity", 0.35)
			.attr("stroke", "white")
			.attr("stroke-width", 3)
			.attr("class", "borough-chart")
			.attr("id", function(d){return( d.key.replace(/\s+/g, '')+"-path")})
			.style("visibility", "visible")
		.datum(function(d){return(d.density)})
			.attr("d",  d3.line()
			.curve(d3.curveBasis)
			.x(function(d) { return x(d[0]); })
			.y(function(d) { return y(d[1]); })
		)

	//BY BOROUGH
	plotBoroguhRidgeline("bronx");
	plotBoroguhRidgeline("brooklyn");
	plotBoroguhRidgeline("manhattan");
	plotBoroguhRidgeline("queens");
	plotBoroguhRidgeline("statenisland");

	//TOOLTIP

		//TEMP TOOLTIP
		svg.append("line")
		  .attr("x1", 600)
		  .attr("x2", 600)
		  .attr("y1", 100)
		  .attr("y2", graphheight+100)
		  .style("stroke", "white")
		  .style("stroke-width", "1px")
		  .attr("id", "temptooltip")
		  .attr("visibility", "visible")
		svg.append("text")
			.html("67%")
			.attr("x", 595)
			.attr("y", graphheight+100+25)
			.attr("id", "temptooltip")
			.attr("font-family", "Graphik-Bold")
			.attr("font-size", "20px")
			.attr("fill", "#3E52C2")
			.attr("visibility", "visible")



	//var boroughnumber = 0

	var mouseG = svg.append("g")
	  .attr("class", "mouse-over-effects");

	  mouseG.append("path")
	  .attr("class", "mouse-line")
	  .style("stroke", "white")
	  .style("stroke-width", "1px")
	  .style("opacity", "0");

	  mouseG.append("path")
	  .attr("class", "mouse-line-temp")
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
		  d3.select(".mouse-line, .mouse-line-temp")
		  .style("opacity", "0")
		  .style("color", "white");
		  tooltip.style("visibility", "hidden")
		  tooltip2.style("visibility", "hidden")
		  tooltip3.style("visibility", "hidden")
		  tooltip4.style("visibility", "hidden")
		  tooltip5.style("visibility", "hidden")
		  tooltip6.style("visibility", "hidden")
		  tooltip7.style("visibility", "hidden")
		  })
	  .on('mouseover', function() { 
		  d3.select(".mouse-line")
		  .style("opacity", "1")
		  .style("color", "white");
		  tooltip.style("visibility", "visible")
		  tooltip2.style("visibility", "visible")
		  tooltip3.style("visibility", "visible")
		  tooltip4.style("visibility", "visible")
		  tooltip5.style("visibility", "visible")
		  tooltip6.style("visibility", "visible")
		  tooltip7.style("visibility", "visible")
		  d3.selectAll("#temptooltip").style("visibility","hidden")
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
		  tooltip.style("left",(d3.event.pageX-10)+"px").html(  y + "%" ).style("color", percentcolor)

		  if (y>0){

			nyctoolstat = []
			nycless=0
			for (i = 0; i < weighted.length; i++) {
				if (weighted[i].GRPIP <= y) { nycless += 1 }
			}
			nyclesspct = Math.round((nycless/weighted.length)*100)
			nycmorepct = Math.round( (100-nyclesspct))
			nyctoolstat.push({less: nyclesspct, more: nycmorepct})

			tooltip2.style("top", (d3.event.pageY-180)+"px").style("left",(d3.event.pageX-110)+"px")
		//	.html("<div class='ttp'><div class = 'ttplabel'>IN NYC</div>" + 
		//	"<div class='ttpbar'><span style = 'padding-top: 0.2em; float: right; background-color: #3E52C2; text-align: right; height: 12px; width:" + (nyctoolstat[0].more)*0.99 +"%;'>" + nyctoolstat[0].more + "%</span><span style = 'padding-top: 0.2em; height: 12px; float: left; background-color: #72DAAC; text-align: left; width:" + (nyctoolstat[0].less)*0.99 + "%'>" + nyctoolstat[0].less + "%</span></div>"
		//	+ "<div class='barlabel'><span style = 'text-align:left; float: left;'>PAY LESS</span><span style = 'text-align: center; floath: middle'>HOUSEHOLDS</span><span style = 'text-align: right; float: right;'>PAY MORE</span></div></div>")

			.html("<div class='ttp'><div class = 'ttplabel'>IN NYC</div>" + 
			"<div class='ttpbar'><span style = 'padding-top: 0.2em; float: right; background-color: #3E52C2; text-align: right; height: 12px; width:" + (nyctoolstat[0].more)*0.99 +"%;'>" + "</span><span style = 'padding-top: 0.2em; height: 12px; float: left; background-color: #72DAAC; text-align: left; width:" + (nyctoolstat[0].less)*0.99 + "%'>" +  "</span></div>"
			+ "<div class='barlabel'><span style = 'text-align:left; float: left; font-size: 12px;'>" + nyctoolstat[0].less + "%</span><span style = 'text-align: center; float: middle;'>HOUSEHOLDS</span><span style = 'text-align: right; float: right; font-size: 12px'>" + nyctoolstat[0].more + "%</span></div><div class = 'barlabel'><span style = 'float: left; text-align; left;'>PAY LESS</span><span style = 'float: right; text-align: right;'>PAY MORE</span></div></div>")
			}

/*
				bronxtext = []
					for (i = 0; i < bronxdensity.length; i++){
						if (typeof bronxdensity[i].frequency[y] === 'undefined'){
						  line = "<br>" +  0 +  " households (" +  0 + "%) in " + bronxdensity[i].key 
						  bronxtext.push(line)}
						else {
							line = "<br>" +  bronxdensity[i].frequency[y] +  " households (" +  Math.round(bronxdensity[i].percent[y] *10)/10 + "%) in " + bronxdensity[i].key 
							bronxtext.push(line)}
					}
				queenstext = []
					for (i = 0; i < queensdensity.length; i++){
						if (typeof queensdensity[i].frequency[y] === 'undefined'){
							line = "<br>" +  0 +  " households (" +  0 + "%) in " + queensdensity[i].key
							queenstext.push(line)}
						else {
						line = "<br>" +  queensdensity[i].frequency[y] + " households (" +  Math.round(queensdensity[i].percent[y] *10)/10 + "%) in " + queensdensity[i].key 
						queenstext.push(line)}
					}
				brooklyntext = []
					for (i = 0; i < brooklyndensity.length; i++){
						if (typeof brooklyndensity[i].frequency[y] === 'undefined'){
							line = "<br>" +  0 +  " households (" +  0 + "%) in " + brooklyndensity[i].key
							brooklyntext.push(line)}
						else {
						line = "<br>" +  brooklyndensity[i].frequency[y] + " households (" +  Math.round(brooklyndensity[i].percent[y] *10)/10 + "%) in " + brooklyndensity[i].key 
						brooklyntext.push(line)}
					}
				statentext = []
					for (i = 0; i < statenislanddensity.length; i++){
						if (typeof statenislanddensity[i].frequency[y] === 'undefined'){
							line = "<br>" +  0 +  " households (" +  0 + "%) in " + statenislanddensity[i].key
							statentext.push(line)}
						else {
						line = "<br>" +  statenislanddensity[i].frequency[y] + " households (" +  Math.round(statenislanddensity[i].percent[y] *10)/10 + "%) in " + statenislanddensity[i].key 
						statentext.push(line)}
					}
				manhattantext = []
					for (i = 0; i < manhattandensity.length; i++){
						if (typeof manhattandensity[i].frequency[y] === 'undefined'){
							line = "<br>" +  0 +  " households (" +  0 + "%) in " + manhattandensity[i].key
							manhattantext.push(line)}
						else {
						line = "<br>" +  manhattandensity[i].frequency[y] + " households (" +  Math.round(manhattandensity[i].percent[y] *10)/10 + "%) in " + manhattandensity[i].key 
						manhattantext.push(line)} 
						}*/

			boropct = {}
			for (i = 0; i < n; i++) {
				var key = categories[i]
				boroless = 0
				borolength = borough[key].length
				for (j = 0; j < borolength; j++) {
					if (weighted[i].GRPIP <= y) { boroless += 1 }
				}
				borolesspct =  Math.round((boroless/weighted.length)*100)
				boromorepct = Math.round( (100-borolesspct))
					pct = {less: borolesspct, more: boromorepct}
							boropct[key] = pct
					}

		tooltip3.style("top", (d3.event.pageY-220)+"px").style("left",(d3.event.pageX+20)+"px")
				  .html("<p style = 'font-family: Graphik-Bold; color:" + percentcolor + "';>" + "<span style = 'font-size: 16px;'>" + y + "%" + "</span>" + "<span>" + " OF INCOME IS SPENT ON RENT BY " + "</span></p>"
				 +bronxtext +"<p>" + "" + "</p>"
				 )
		tooltip4.style("top", (d3.event.pageY-310)+"px").style("left",(d3.event.pageX+20)+"px")
				 .html("<p style = 'font-family: Graphik-Bold; color:" + percentcolor + "';>" + "<span style = 'font-size: 16px;'>" + y + "%" + "</span>" + "<span>" + " OF INCOME IS SPENT ON RENT BY " + "</span></p>"
				+brooklyntext +"<p>" + "" + "</p>"
				)
		tooltip5.style("top", (d3.event.pageY-260)+"px").style("left",(d3.event.pageX+20)+"px")
				.html("<p style = 'font-family: Graphik-Bold; color:" + percentcolor + "';>" + "<span style = 'font-size: 16px;'>" + y + "%" + "</span>" + "<span>" + " OF INCOME IS SPENT ON RENT BY " + "</span></p>"
			   +queenstext +"<p>" + "" + "</p>"
			   )
		tooltip6.style("top", (d3.event.pageY-130)+"px").style("left",(d3.event.pageX+20)+"px")
			   .html("<p style = 'font-family: Graphik-Bold; color:" + percentcolor + "';>" + "<span style = 'font-size: 16px;'>" + y + "%" + "</span>" + "<span>" + " OF INCOME IS SPENT ON RENT BY " + "</span></p>"
			  +statentext +"<p>" + "" + "</p>"
			  )
		tooltip7.style("top", (d3.event.pageY-220)+"px").style("left",(d3.event.pageX+20)+"px")
			  .html("<p style = 'font-family: Graphik-Bold; color:" + percentcolor + "';>" + "<span style = 'font-size: 16px;'>" + y + "%" + "</span>" + "<span>" + " OF INCOME IS SPENT ON RENT BY " + "</span></p>"
			 +manhattantext +"<p>" + "" + "</p>"
			 )
			})

		d3.selectAll("#bronxttp, #brooklynttp, #queensttp, #statenttp, #manhattanttp").style("opacity", 0).style("visibility", "hidden")

		

		axisall()

		scrollToProfile();

		

})

//SVG
var width = window.innerWidth-100, height = window.innerHeight-100, sizeDivisor = 100, nodePadding = 1;

var graphwidth = 890
var graphheight = 600

var svg = d3.select("#chart-rentburden")
		.append("svg")
		.attr("class", "box")
		// .attr("width", width)
		// .attr("height", height)
		.attr("viewBox", "-350, 100, 1265, 650") ;

//TOOLTIP
tooltip = d3.select("#chart-rentburden")
		.append("div")
		.attr("class", "tooltip")
tooltip2 = d3.select("body")
		.append("div")
		.attr("class", "tooltip2")
		.attr("id", "nycttp")
tooltip3 = d3.select("body")
		.append("div")
		.attr("class", "tooltip2")
		.attr("id", "bronxttp")
tooltip4 = d3.select("body")
		.append("div")
		.attr("class", "tooltip2")
		.attr("id", "brooklynttp")
tooltip5 = d3.select("body")
		.append("div")
		.attr("class", "tooltip2")
		.attr("id", "queensttp")
tooltip6 = d3.select("body")
		.append("div")
		.attr("class", "tooltip2")
		.attr("id", "statenttp")
tooltip7 = d3.select("body")
		.append("div")
		.attr("class", "tooltip2")
		.attr("id", "manhattanttp")


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

var bronxdensity = []
var brooklyndensity = []
var manhattandensity = []
var statenislanddensity = []
var queensdensity = []

//SUMMARY STATS
allstats = []
allnot = 0
allburdened = 0
allsevere = 0

//X AXIS
var x = d3.scaleLinear()
	.domain([0, 100])
	.range([ 0, graphwidth ]);
svg.append("g")
	.attr("class", "x-axis")
	.attr("transform", "translate(0," + (705) + ")")
	.call(d3.axisBottom(x).tickValues([0,30,50,100]).tickSize(0).tickFormat(function(d,i) {
		return d + "%";
	}))
	.select(".domain").remove()
svg.append("g")
	.attr("class", "label-axis")
	.append("text")
	.attr("text-anchor", "end")
	.attr("class", "axislabel")
	.attr("x", graphwidth - 15)
	.attr("y", 745)
	.text("% INCOME SPENT ON RENT");

//Y AXIS
var y = d3.scaleLinear()
	.domain([0, 0.13])
	.range([ height+127, 120]);
var yName = d3.scaleBand()
	.domain(["BRONX", "QUEENS", "BROOKLYN", "STATEN ISLAND", "MANHATTAN"])
	.range([440, 665])
	.paddingInner(0)
svg.append("g")
	.attr("id", "yaxis")
	.attr("class", "axis")
	.call(d3.axisLeft(yName).tickSize(0))
	.attr("transform", "translate(" + -10  + "," + "5)")
	.select(".domain").remove()
svg.append("g")
	.attr("class", "label-axis")
	.append("text")
	.attr("text-anchor", "end")
	.attr("class", "axislabel")
	.attr("x", graphwidth - 915)
	.attr("y", 145)
	.text("NUMBER OF HOUSEHOLDS");
	


//GRAPH BACKGROUND

svg.append("g")
	.attr("class", "background")
	.append("rect")
	.attr("width", (graphwidth))
	.attr("id", "bg")
	.attr("height", graphheight)
	.attr("transform", "translate(0," + (100) + ")")
	.attr("fill", "#3E52C2");
svg.select(".background")
	.append("rect")
	.attr("width", (graphwidth)*0.5)
	.attr("height", graphheight)
	.attr("transform", "translate(0," + (100) + ")")
	.attr("fill", "#5896B7");
svg.select(".background")
	.append("rect")
	.attr("width", (graphwidth)*0.3)
	.attr("height", graphheight)
	.attr("transform", "translate(0," + (100) + ")")
	.attr("fill", "#72DAAC");

svg.select(".background")
	.append("text")
	.text("NOT BURDENED")
	.attr("class", "statstitle")
	.attr("text-anchor", "middle")
	.attr("x", (graphwidth*0.15))
	.attr("y", 190);
svg.select(".background")
	.append("text")
	.html("PAY RENT WITHOUT BURDEN")
	.attr("class", "stats")
	.attr('dy', '1em')
	.attr("text-anchor", "middle")
	.attr("x", (graphwidth*0.15))
	.attr("y", 210);

svg.select(".background")
	.append("text")
	.text("RENT BURDENED")
	.attr("class", "statstitle")
	.attr("text-anchor", "middle")
	.attr("x", (graphwidth*0.4))
	.attr("y", 190);
svg.select(".background")
	.append("text")
	.attr("class", "stats")
	.attr('dy', '1em')
	.html("STRUGGLE TO PAY RENT")
	.attr("text-anchor", "middle")
	.attr("x", (graphwidth*0.4))
	.attr("y", 210);

svg.select(".background")
	.append("text")
	.text("SEVERELY RENT BURDENED")
	.attr("class", "statstitle")
	.attr("text-anchor", "middle")
	.attr("x", (graphwidth*0.75))
	.attr("y", 190);
svg.select(".background")
	.append("text")
	.html("SEVERELY STRUGGLE TO PAY RENT")
	.attr('dy', '1em')
	.attr("class", "stats")
	.attr("text-anchor", "middle")
	.attr("x", (graphwidth*0.75))
	.attr("y", 210)
svg.append("g")
	.attr("class", "label-axis")
	.append("text")
	.attr("text-anchor", "end")
	.style("font-size", "10px")
	.style("font-family", "Graphik-regular")
	.attr("x", graphwidth - 905)
	.attr("y", 170)
	.html("Move cursor to see how many households are rent burdened")
svg.append("g")
	.attr("class", "label-axis")
	.append("text")
	.attr("text-anchor", "end")
	.style("font-size", "10px")
	.style("font-family", "Graphik-regular")
	.attr("x", graphwidth - 905)
	.attr("y", 185)
	.html("Click on axis or navigation bar to view individual boroughs");

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

// PLOT RIDGELINE
function plotBoroguhRidgeline(borough) {
	y.domain([0, 0.25])
	yName.domain(borough + "districts"[0]).range([300, 665])
	if (borough == "bronx") {
		dataset = bronxdensity;
		yName.domain(bronxdistricts[0]).range([320, 665])
	}
	else if (borough == "brooklyn") {
		dataset = brooklyndensity;
		yName.domain(brooklyndistricts[0]).range([260, 665])
	}
	else if (borough == "queens") {
		dataset = queensdensity;
		yName.domain(queensdistricts[0]).range([250, 665])
	}
	else if (borough == "manhattan") {
		dataset = manhattandensity;
		yName.domain(manhattandistricts[0]).range([310, 665])
	}
	else if (borough == "statenisland") {
		dataset = statenislanddensity;
		yName.domain(statenislanddistricts[0]).range([430, 665])
	};
	
	svg.selectAll("areas")
		.data(dataset)
		.enter()
		.append("path")
			.attr("transform", function(d){return("translate(0," + (yName(d.key)-height-100) +")" )})
			.attr("fill", "white")
			.attr("fill-opacity", 0.45)
			.attr("stroke", "white")
			.attr("stroke-width", 2)
			.attr("class", borough + "-chart")
			.attr("id", function(d){return( d.key.replace(/\s+/g, '').replace(/[.,\/#!$%\^&\*;:{}=\-_`~()']/g,"")+"-path")})
//			.attr("id", borough + "-chart")
			.style("visibility", "hidden")
		.datum(function(d){return(d.density)})
			.attr("d",  d3.line()
			.curve(d3.curveBasis)
			.x(function(d) { return x(d[0]); })
			.y(function(d) { return y(d[1]); })
		)
		
}

//BUTTONS
function toggleDataset(boroughId) {
	d3.select(boroughId)
};

d3.select("#bronx").on("click", clickbronx)
d3.select("#brooklyn").on("click", clickbrooklyn)
d3.select("#manhattan").on("click", clickmanhattan)
d3.select("#queens").on("click", clickqueens)
d3.select("#statenisland").on("click", clickstaten)
d3.select("#nyc").on("click", clicknyc)



function clickbronx(){
	d3.selectAll(".borough-chart, .brooklyn-chart, .queens-chart, .manhattan-chart, .statenisland-chart")
		.transition()
			.duration(300)
			.style("visibility", "hidden")
	d3.selectAll(".bronx-chart")
		.style("opacity", 0)
		.transition() 
			.delay(100)
			.style("visibility", "visible")
			.duration(200)
			.ease(d3.easeLinear).style("opacity",0.7)
	y.domain([0, 0.25])
	yName.domain(bronxdistricts[0]).range([320, 665])
	svg.select("#yaxis")
		.call(d3.axisLeft(yName).tickSize(0))
			.style("font-size", "10px")
			.attr("transform", "translate(" + -10  + ", "+ 12 + ")")
			.select(".domain").remove()
	axisborough = "bronx"
	tooltip2.style("opacity", 0)
	d3.selectAll("#bronxttp").style("opacity", 0.9).style("visibility", "visible")
	d3.selectAll("#brooklynttp, #queensttp, #statenttp, #manhattanttp").style("opacity", 0).style("visibility", "hidden")
	d3.selectAll("#notburdened").html(boroughstats.Bronx.not.toLocaleString() + " HOUSEHOLDS")
	d3.selectAll("#burdened").html(boroughstats.Bronx.burdened.toLocaleString() +  " HOUSEHOLDS")
	d3.selectAll("#severelyburdened").html(boroughstats.Bronx.severe.toLocaleString() +  " HOUSEHOLDS")

	axishoverborough()
}

function clickbrooklyn(){

	d3.selectAll(".borough-chart, .bronx-chart, .queens-chart, .manhattan-chart, .statenisland-chart")
		.transition()
			.duration(300)
			.style("visibility", "hidden")
	d3.selectAll(".brooklyn-chart")
		.style("opacity", 0)
		.transition() 
			.delay(100)
			.style("visibility", "visible")
			.duration(200)
			.ease(d3.easeLinear).style("opacity",0.7)
	y.domain([0, 0.25])
	yName.domain(brooklyndistricts[0]).range([253, 665])
	svg.select("#yaxis")
		.call(d3.axisLeft(yName).tickSize(0))
			.style("font-size", "10px")
			.attr("transform", "translate(" + -10  + ", "+ 20 + ")")
			.select(".domain").remove()
	axisborough = "brooklyn"
	tooltip2.style("opacity", 0)
	d3.selectAll("#brooklynttp").style("opacity", 0.9).style("visibility", "visible")
	d3.selectAll("#bronxttp, #queensttp, #statenttp, #manhattanttp").style("opacity", 0).style("visibility", "hidden")
	d3.selectAll("#notburdened").html(boroughstats.Brooklyn.not.toLocaleString() + " HOUSEHOLDS")
	d3.selectAll("#burdened").html(boroughstats.Brooklyn.burdened.toLocaleString() +  " HOUSEHOLDS")
	d3.selectAll("#severelyburdened").html(boroughstats.Brooklyn.severe.toLocaleString() +  " HOUSEHOLDS")

	axishoverborough()
}

function clickmanhattan(){
	d3.selectAll(".borough-chart, .bronx-chart, .brooklyn-chart, .queens-chart, .statenisland-chart")
		.transition()
			.duration(300)
			.style("visibility", "hidden")
	d3.selectAll(".manhattan-chart")
		.style("opacity", 0)
		.transition() 
			.delay(100)
			.style("visibility", "visible")
			.duration(200)
			.ease(d3.easeLinear).style("opacity",0.7)
	y.domain([0, 0.25])
	yName.domain(manhattandistricts[0]).range([310, 665])
	svg.select("#yaxis")
		.call(d3.axisLeft(yName).tickSize(0))
			.style("font-size", "10px")
			.attr("transform", "translate(" + -10  + ", "+ 13 + ")")
			.select(".domain").remove()
	axisborough = "manhattan"
	tooltip2.style("opacity", 0)
	d3.selectAll("#manhattanttp").style("opacity", 0.9).style("visibility", "visible")
	d3.selectAll("#bronxttp, #queensttp, #statenttp, #brooklynttp").style("opacity", 0).style("visibility", "hidden")
	d3.selectAll("#notburdened").html(boroughstats.Manhattan.not.toLocaleString() + " HOUSEHOLDS")
	d3.selectAll("#burdened").html(boroughstats.Manhattan.burdened.toLocaleString() +  " HOUSEHOLDS")
	d3.selectAll("#severelyburdened").html(boroughstats.Manhattan.severe.toLocaleString() +  " HOUSEHOLDS")
	axishoverborough()
}

function clickqueens(){
	d3.selectAll(".borough-chart, .bronx-chart, .brooklyn-chart, .manhattan-chart, .statenisland-chart")
		.transition()
			.duration(300)
			.style("visibility", "hidden")
	d3.selectAll(".queens-chart")
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
	axisborough = "queens"
	tooltip2.style("opacity", 0)
	d3.selectAll("#queensttp").style("opacity", 0.9).style("visibility", "visible")
	d3.selectAll("#bronxttp, #brooklynttp, #statenttp, #manhattanttp").style("opacity", 0).style("visibility", "hidden")
	d3.selectAll("#notburdened").html(boroughstats.Queens.not.toLocaleString() + " HOUSEHOLDS")
	d3.selectAll("#burdened").html(boroughstats.Queens.burdened.toLocaleString() +  " HOUSEHOLDS")
	d3.selectAll("#severelyburdened").html(boroughstats.Queens.severe.toLocaleString() +  " HOUSEHOLDS")
	axishoverborough()
}

function clickstaten(){
	d3.selectAll(".borough-chart, .bronx-chart, .brooklyn-chart, .queens-chart, .manhattan-chart")
		.transition()
			.duration(300)
			.style("visibility", "hidden")
	d3.selectAll(".statenisland-chart")
		.style("opacity", 0)
		.transition() 
			.delay(100)
			.style("visibility", "visible")
			.duration(200)
			.ease(d3.easeLinear).style("opacity",0.7)
	y.domain([0, 0.25])
	yName.domain(statenislanddistricts[0]).range([415, 665])
	svg.select("#yaxis")
		.call(d3.axisLeft(yName).tickSize(0))
			.style("font-size", "10px")
			.attr("transform", "translate(" + -10  + ", "+ 0 + ")")
			.select(".domain").remove()
	axisborough = "statenisland"
	tooltip2.style("opacity", 0)
	d3.selectAll("#statenttp").style("opacity", 0.9).style("visibility", "visible")
	d3.selectAll("#bronxttp, #queensttp, #brooklynttp, #manhattanttp").style("opacity", 0).style("visibility", "hidden")
	d3.selectAll("#notburdened").html(boroughstats['Staten Island'].not.toLocaleString() + " HOUSEHOLDS")
	d3.selectAll("#burdened").html(boroughstats['Staten Island'].burdened.toLocaleString() +  " HOUSEHOLDS")
	d3.selectAll("#severelyburdened").html(boroughstats['Staten Island'].severe.toLocaleString() +  " HOUSEHOLDS")
	axishoverborough()
}

function clicknyc(){
	d3.selectAll(".bronx-chart, .brooklyn-chart, .queens-chart, .manhattan-chart, .statenisland-chart")
		.transition()
			.duration(300)
			.style("visibility", "hidden")
	d3.selectAll(".borough-chart")
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
	tooltip2.style("opacity", 0.9).style("visibility", "visible")
	d3.selectAll("#bronxttp, #queensttp, #statenttp, #manhattanttp, #brooklynttp").style("opacity", 0).style("visibility", "hidden")
	d3.selectAll("#notburdened").html(allstats[0].not.toLocaleString() + " HOUSEHOLDS")
	d3.selectAll("#burdened").html(allstats[0].burdened.toLocaleString() +  " HOUSEHOLDS")
	d3.selectAll("#severelyburdened").html(allstats[0].severe.toLocaleString() +  " HOUSEHOLDS")
	
	axisall()
}

function axisall(){
	boroughs = ["BRONX", "BROOKLYN", "MANHATTAN", "QUEENS", "STATEN ISLAND"]
	svg.selectAll("#yaxis .tick")
	.on("mouseover", function(d) {  
		for (i = 0; i < boroughs.length; i++){
			hoverborough = boroughs[i]
			if (d == hoverborough){
				svg.selectAll("#yaxis .tick").filter(function(d){ return d==hoverborough;}).style("font-family", 'Graphik-bold').style("font-size", "15px")
				svg.selectAll("#yaxis .tick").filter(function(d){ return d!=hoverborough;}).style("opacity", 0.35)
			other = []
				for (j = 0; j < boroughs.length; j++){
					if (boroughs[j]!= hoverborough){
					other.push(boroughs[j].replace(/\s+/g, ''))}}
			selectpath = []
				for (k = 0; k < other.length; k++){
					path =  "#" + other[k] + "-path" 
					selectpath.push(path)}
				svg.selectAll(selectpath).style("opacity", 0.35)
			}
		}
	})
	.on("mouseout", function(d) { 
		for (i = 0; i < boroughs.length; i++){
			hoverborough = boroughs[i]
			if (d == hoverborough){
				svg.selectAll("#yaxis .tick").filter(function(d){ return d==hoverborough;}).style("font-family", 'Graphik-regular').style("font-size", "12px")
				svg.selectAll("#yaxis .tick").filter(function(d){ return d!=hoverborough;}).style("opacity", 1)	
			other = []
				for (j = 0; j < boroughs.length; j++){
					if (boroughs[j]!= hoverborough){
					other.push(boroughs[j].replace(/\s+/g, ''))}}
			selectpath = []
				for (k = 0; k < other.length; k++){
					path =  "#" + other[k] + "-path" 
					selectpath.push(path)}
			console.log(selectpath)
			svg.selectAll(selectpath).style("opacity", 1)
			}
		}
	})

	.on("click", function(d) {  
		if (d == "BRONX"){clickbronx()}
		if (d == "BROOKLYN"){clickbrooklyn()}
		if (d == "MANHATTAN"){clickmanhattan()}
		if (d == "QUEENS"){clickqueens()}
		if (d == "STATEN ISLAND"){clickstaten()}
	})

}

function axishoverborough(){

	if (axisborough == "bronx"){districts = bronxdistricts[0]}
	if (axisborough == "brooklyn"){districts = brooklyndistricts[0]}
	if (axisborough == "queens"){districts = queensdistricts[0]}
	if (axisborough == "manhattan"){districts = manhattandistricts[0]}
	if (axisborough == "statenisland"){districts = statenislanddistricts[0]}
	svg.selectAll("#yaxis .tick")
	.on("mouseover", function(d) {  
		for (i = 0; i < districts.length; i++){
			hoverdistrict = districts[i]
			if (d == hoverdistrict){
				svg.selectAll("#yaxis .tick").filter(function(d){ return d==hoverdistrict;}).style("font-family", 'Graphik-bold')
				svg.selectAll("#yaxis .tick").filter(function(d){ return d!=hoverdistrict;}).style("opacity", 0.35)
			other = []
			console.log(other)
				for (j = 0; j < districts.length; j++){
					if (districts[j]!= hoverdistrict){
					other.push(districts[j].replace(/\s+/g, '').replace(/[.,\/#!$%\^&\*;:{}=\-_`~()']/g,""))}}
			selectpath = []
				for (k = 0; k < other.length; k++){
					path =  "#" + other[k] + "-path." + axisborough + "-chart" 
					selectpath.push(path)}
					console.log(selectpath)
			svg.selectAll(selectpath).style("opacity", 0.35)
			}
		}
	})
	.on("mouseout", function(d) { 
		for (i = 0; i < districts.length; i++){
			hoverdistrict = districts[i]
			if (d == hoverdistrict){
				svg.selectAll("#yaxis .tick").filter(function(d){ return d==hoverdistrict;}).style("font-family", 'Graphik-regular')
				svg.selectAll("#yaxis .tick").filter(function(d){ return d!=hoverdistrict;}).style("opacity", 1)	
			other = []
				for (j = 0; j < districts.length; j++){
					if (districts[j]!= hoverdistrict){
					other.push(districts[j].replace(/\s+/g, '').replace(/[.,\/#!$%\^&\*;:{}=\-_`~()']/g,""))}}
			selectpath = []
				for (k = 0; k < other.length; k++){
					path =  "#" + other[k] + "-path." + axisborough + "-chart" 
					selectpath.push(path)}
			console.log(selectpath)
			svg.selectAll(selectpath).style("opacity", 1)
			}
		}
	})
}



// scrolltop jump to borough profile
var winHeight = $(window).height();

$(window).resize(function() {
	winHeight = $(window).height();
});

function scrollToProfile() {
	$("html, body").animate({scrollTop: winHeight}, 2000);
};