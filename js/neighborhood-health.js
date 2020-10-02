const dataset = d3.csv("./data/neighborhood-health.csv")
	.then(function(data) {
		data.forEach(function(d) {
			id: +d.id;
			borough: d.borough;
			neighborhood: d.neighborhood;
			whoRaceNonWhite: +d.whoRaceNonWhite;
			whoBornOutside: +d.whoBornOutside;
			socioecoHighSchool: +d.socioecoHighSchool;
			socioecoPoverty: +d.socioecoPoverty;
			socioecoUnemployment: +d.socioecoUnemployment;
			socioecoRent: +d.socioecoRent;
			socioecoHelpful: +d.socioecoHelpful;
			homeDefects: +d.homeDefects;
			homeRoaches: +d.homeRoaches;
			homeAir: +d.homeAir;
			homeBike : +d.homeBike;
			homePedInjury : +d.homePedInjury;
			homeBodega : +d.homeBodega;
			homeFarmersMarket : +d.homeFarmersMarket;
			healthChildObesity : +d.healthChildObesity;
			healthChildAsthma : +d.healthChildAsthma;
			healthPhysicalActivity : +d.healthPhysicalActivity;
			healthUninsured : +d.healthUninsured;
			healthMedCare : +d.healthMedCare;
			healthFluVacc : +d.healthFluVacc;
			healthAdultObesity : +d.healthAdultObesity;
			healthInfantMortality : +d.healthInfantMortality;
			healthLifeExpectancy : +d.healthLifeExpectancy;
		});

		if (!keys.length) {
			keys = data.columns;
		};
		if (!features.length) {
			features = data.columns.slice(3,data.columns.length);
		};

		// data for city average
		for (var i = 0; i < features.length; i++) {
			let property = features[i];
			total = data.reduce((accumulator, value) => (accumulator + +value[property]), 0);
			cityAverage.area = "city";
			cityAverage[property] = total/(data.length);
		};
		
		// data for borough average
		const distinct = (value, index, self) => {
			return self.indexOf(value) === index;
		};

		// borough list
		boroughList = data.map(function(item) {	return item.borough})
			.filter(distinct);

		for (var b = 0; b < boroughList.length; b++) {
			let borough = boroughList[b];
			// boroughAverage[borough] = {};
			item = {};

			for (var i = 0; i < features.length; i++) {
				let property = features[i];
				totalBorough = data.filter(d => d.borough == borough).reduce((accumulator, value) => (accumulator + +value[property]), 0);
				neighborhoodsPerBorough = data.filter(d => d.borough == borough).length;
				// boroughAverage[borough][borough] = borough;
				// boroughAverage[borough][property] = totalBorough/(data.length + 1);
				(borough == "Manhattan") ? item.id = 100
					: (borough == "Bronx") ? item.id = 200
					: (borough == "Brooklyn") ? item.id = 300
					: (borough == "Queens") ? item.id = 400
					: (borough == "Staten Island") ? item.id = 500
					: item.id = undefined;
				item.area = "borough";
				item.neighborhoods = neighborhoodsPerBorough;
				item.borough = borough;
				item[property] = totalBorough/neighborhoodsPerBorough;
			};
			boroughAverage.push(item);
		};

		// filtered data per borough
		boroughManhattan = data.filter(d => d.borough == "Manhattan");
		boroughBronx = data.filter(d => d.borough == "Bronx");
		boroughBrooklyn = data.filter(d => d.borough == "Brooklyn");
		boroughQueens = data.filter(d => d.borough == "Queens");
		boroughStatenIsland = data.filter(d => d.borough == "Staten Island");

		// neighborhood list
		neighborhoodList = data.map(function(item) {return item.id});

		// plot overall chart
		plotRadialGrid(svgCity);
		plotAxes(svgCity);
		plotAxesLabels(svgCity)
		plotChart(svgCity, boroughAverage);
		cityChart();

		// plot profile chart
		plotRadialGrid(svgBorough);
		plotAxes(svgBorough);
		plotAxesLabels(svgBorough)
		plotChart(svgBorough, data);
		boroughChart();

		// plot neighborhood small multiple charts
		plotNeighborhoods(data);
		neighborhoodChart()

		// visible on document load
		$(".chartline").hide();
		$(".chart101").show();
		// d3.selectAll(".svgneighborhood:not(.chartmn)")
		// 	.style("display", "none");
		// d3.selectAll(".chartmn")
		// 	.style("display", "block");

		

		console.log(data);
		console.log(cityAverage);
		console.log(boroughAverage);
});

// aspect ratio
const width = 300;
const height = 300;
const radius = 150;

// define svg
const svgCity = d3.select("#chart-overall")
	.append("svg")
		.attr("viewBox", [0, 0, width, height]);

const svgBorough = d3.select("#chart-profile")
	.append("svg")
		.attr("viewBox", [0, 0, width, height]);


// tooltip
var divBorough = d3.select("body").append("div")
	.attr("id", "tooltipborough")
	.style("display", "none")
	.style('z-index', '10')
	.text("info");

var divNeighborhood = d3.select("body").append("div")
	.attr("id", "tooltipborough")
	.style("display", "none")
	.style('z-index', '10')
	.text("info");

// define keys & features
let keys = [];
let features = [];
let boroughList = [];
let neighborhoodList = [];

let featureName = d3.scaleOrdinal()
	.domain(features)
	.range(["Non-White\nResidents", "Residents Born Outside US", "Did Not Complete High School", "Poverty", "Unemployment", "Rent Burden", "Helpful Neighbors", "Home w/o Defects", "Home w/o Rodents", "Air Pollution", "Bike Network Coverage", "Pedestrian Injury Hospitalization", "Ratio of Bodegas to Supermarkets", "Farmers Market", "Child Obesity", "Child Asthma", "Physical Activity", "Uninsured", "Unmet Medical Care", "Flu Vaccination", "Adult Obesity", "Infant Mortality", "Life Expectancy"]);

// manipulated datasets
let cityAverage = [];
let boroughAverage = [];
let boroughManhattan = [];
let boroughBronx = [];
let boroughBrooklyn = [];
let boroughQueens = [];
let boroughStatenIsland = [];

// color
const boroughColor = d3.scaleOrdinal()
	.domain(["Manhattan", "Bronx", "Brooklyn", "Queens", "Staten Island"])
	.range(["#be90f3", "#7283eb", "#fcc998", "#e6ba68", "#c199b6"])
	.unknown("#cccccc");

const neighborhoodColor = d3.scaleOrdinal()
	.domain(["101", "102", "103", "104", "105", "106", "107", "108", "109", "110", "111", "112", "201", "202", "203", "204", "205", "206", "207", "208", "209", "210", "211", "212", "301", "302", "303", "304", "305", "306", "307", "308", "309", "310", "311", "312", "313", "314", "315", "316", "317", "318", "401", "402", "403", "404", "405", "406", "407", "408", "409", "410", "411", "412", "413", "414", "501", "502", "503"])
	.range(["#c199b6", "#c39af4", "#f0a4b5", "#50d2d2", "#b1e4e2", "#c7d7db", "#e0e769", "#ffed64", "#fccea1", "#7f8fed", "#a5c7e7", "#efd3a0",
	"#c199b6", "#c39af4", "#f0a4b5", "#50d2d2", "#b1e4e2", "#c7d7db", "#e0e769", "#ffed64", "#fccea1", "#7f8fed", "#a5c7e7", "#efd3a0",
	"#c199b6", "#c39af4", "#f0a4b5", "#50d2d2", "#b1e4e2", "#c7d7db", "#e0e769", "#ffed64", "#fccea1", "#7f8fed", "#a5c7e7", "#efd3a0",
	"#c199b6", "#c39af4", "#f0a4b5", "#50d2d2", "#b1e4e2", "#c7d7db", "#e0e769", "#ffed64", "#fccea1", "#7f8fed", "#a5c7e7", "#efd3a0",
	"#c199b6", "#c39af4", "#f0a4b5", "#50d2d2", "#b1e4e2", "#c7d7db", "#e0e769", "#ffed64", "#fccea1", "#7f8fed", "#a5c7e7", "#efd3a0",
	"#c199b6", "#c39af4", "#f0a4b5", "#50d2d2", "#b1e4e2", "#c7d7db", "#e0e769", "#ffed64", "#fccea1", "#7f8fed", "#a5c7e7"])
	.unknown("#cccccc");

// radial gridlines
let radialScale = d3.scaleLinear()
	.domain([0,10])
	.range([0,100]);
const ticks = [1,2,3,4,5,6,7,8,9,10];

function plotRadialGrid(svg){
	svg.append("g")
		.attr("class", "grid-radial")
		.selectAll("circle")
		.data(ticks)
		.enter()
		.append("circle")
			.attr("cx", width/2)
			.attr("cy", height/2)
			.attr("r", (t) => radialScale(t))
			.attr("fill", "none")
			.attr("stroke", "#aaa")
			.attr("stroke-width", 0.5)
};

// plot axes
function angleToCoordinate(angle, value) {
	let x = Math.cos(angle) * radialScale(value);
	let y = Math.sin(angle) * radialScale(value);
	return {
		"x": radius + x,
		"y": radius - y
	};
};

function featureToCoordinate(inputFeature, element, coordinate) {
	let i = features.findIndex((feature) => feature == inputFeature);
	let angle = (Math.PI / 2) - (2 * Math.PI * i / features.length);
	let angleDeg = angle * (-180/Math.PI);
	if (i > 12) {
		angleDeg = angleDeg + 180;
	}

	if (element == "line") {
		value = 10;
	} else if (element == "label") {
		value = 10.5;
	}

	let coordinates = angleToCoordinate(angle, value);

	if (coordinate == "x") {
			return coordinates.x;
	} else if (coordinate == "y") {
		return coordinates.y;
	} else if (coordinate == "degree") {
		return angleDeg;
	}

};

function transformLabel(inputFeature, attribute) {
	let i = features.findIndex((feature) => feature == inputFeature);
	let angle = (Math.PI / 2) - (2 * Math.PI * i / features.length);
	let angleDeg = angle * (-180/Math.PI);
	let anchorPos = "start";

	if (i > 12) {
		angleDeg = angleDeg + 180;
		anchorPos = "end";
	}
	if (attribute == "angleDeg") {
		return angleDeg;
	} else if (attribute == "anchor") {
		return anchorPos;
	}
};

// draw axis line
function plotAxes(svg){
	svg.append("g")
		.attr("class", "grid-axis-lines")
		.selectAll("line")
		.data(features)
		.enter()
		.append("line")
			.attr("x1", radius)
			.attr("y1", radius)
			.attr("x2", (d) => featureToCoordinate(d, "line", "x"))
			.attr("y2", (d) => featureToCoordinate(d, "line", "y"))
			.attr("stroke", "#aaa")
			.attr("stroke-width", 0.5);
};

// draw axis label
function plotAxesLabels(svg){
	svg.append("g")
		.attr("class", "label-axis")
		.selectAll("text")
		.data(features)
		.enter()
		.append("text")
			.attr("class", "labelfeature")
			.attr("x", (d) => featureToCoordinate(d, "label", "x"))
			.attr("y", (d) => featureToCoordinate(d, "label", "y"))
			.attr("transform-origin", (d) => featureToCoordinate(d, "label", "x") + " " + featureToCoordinate(d, "label", "y"))
			.attr("text-anchor", (d) => transformLabel(d, "anchor"))
			.attr("transform", (d) => "rotate(" + transformLabel(d, "angleDeg") + ")")
			.text((d) => featureName(d));
};

// plot data
let line = d3.line()
	.x((d) => d.x)
	.y((d) => d.y);

function getPathCoordinates(dataPoint) {
	let coordinates = [];
	for (var i = features.length - 1; i > -1; i--) {
		let featureName = features[i];
		let angle = (Math.PI / 2) - (2 * Math.PI * i / features.length);
		coordinates.push(angleToCoordinate(angle, dataPoint[featureName]))
	};
	coordinates.push(coordinates[0]);
	return coordinates;
}

function plotChart(svg, data){
	svg.append("g")
		.attr("class", "dataplot")
		.selectAll("path")
		.data(data)
		.enter()
		.append("path")
			.attr("class", (d) => d.area)
			.attr("d", (d) => line(getPathCoordinates(d)))
}

// data neighborhood small multiples
function plotNeighborhoods(data) {
	for (var i = 0; i < data.length; i++) {
		// let boroughClass = "chart" + data[i].borough;
		let neighborhoodID = "chart" + data[i].id;
		let neighborhoodData = data.filter(d => d.id == neighborhoodList[i]);
		let boroughClass = "borough";
		if (neighborhoodList[i].startsWith(1)) {
			boroughClass = "manhattan";
		} else if (neighborhoodList[i].startsWith(2)) {
			boroughClass = "bronx";
		} else if (neighborhoodList[i].startsWith(3)) {
			boroughClass = "brooklyn";
		} else if (neighborhoodList[i].startsWith(4)) {
			boroughClass = "queens";
		} else if (neighborhoodList[i].startsWith(5)) {
			boroughClass = "statenisland";
		};

		const svgNeighborhood = d3.select("#chart-neighborhoods")
			.append("svg")
				.attr("id", neighborhoodID)
				.attr("class", "svgneighborhood chart" + boroughClass)
				.attr("viewBox", [20, 40, width - 40, height - 40])

		plotRadialGrid(svgNeighborhood);
		plotAxes(svgNeighborhood);
		plotChart(svgNeighborhood, neighborhoodData);

		svgNeighborhood.append("g")
			.selectAll("text")
			.data(neighborhoodData)
			.enter()
			.append("text")
				.attr("class", "labelneighborhood")
			.append("tspan")
			.text((d) => d.neighborhood)
				.attr("x", width/2)
				.attr("y", height - 20)
				.attr("text-anchor", "middle");
	}
}

// city chart visual style and interaction
function cityChart(){
	svgCity.select(".dataplot")
		.selectAll("path")
			.attr("id", (d) => "chart" + d.id)
			.attr("stroke", (d) => boroughColor(d.borough))
			.attr("stroke-width", 1)
			.attr("stroke-opacity", 1)
			.attr("fill", (d) => boroughColor(d.borough))
			.attr("mix-blend-mode", "multiply")
			.attr("fill-opacity", 0.1)
		.on("mouseover", function (event, d) {
			d3.select(this)
				.raise()
				.transition()
				.duration("50")		
				.attr("stroke-width", 1.5)
				.attr("z-index", "5")
				.attr("fill-opacity", 0.7)
			divBorough.html((divHtml) => d.borough)
				.style("background", (divHtml) => boroughColor(d.borough))
				.style("display", "block");
		})
		.on("mousemove", function (event) {
			divBorough.style("top", (divHtml) => {
				var divY = event.pageY;
				return (divY + 10) + "px"
			})
			.style("left", (divHtml) => {
				var divX = event.pageX;
				return (divX + 10) + "px"
			})
		})
		.on("mouseout", function () {
			d3.select(this).transition()
				.duration("50")
				.attr("stroke-width", 1)
				.attr("fill-opacity", 0.1)
			divBorough.style("display", "none");
		})
}

// borough profile chart visual style and interaction
function boroughChart(){
	svgBorough
		.attr("class", "svgprofile")
		.select(".dataplot")
		.selectAll("path")
			.attr("class", (d) => "chartline chart" + d.id)
			.attr("stroke", "#a96e9b")
			.attr("stroke-width", 1)
			.attr("stroke-opacity", 1)
			.attr("mix-blend-mode", "multiply")
			.attr("fill-opacity", 0)
		.on("mouseover", function (event, d) {
			d3.select(this)
				.raise()
				.transition()
				.duration("50")		
				.attr("stroke-width", 1.5)
				.attr("z-index", "5")
			divNeighborhood.html((divHtml) => d.borough)
				.style("background", (divHtml) => boroughColor(d.borough))
				.style("display", "block");
		})
		.on("mousemove", function (event) {
			divNeighborhood.style("top", (divHtml) => {
				var divY = event.pageY;
				return (divY + 10) + "px"
			})
			.style("left", (divHtml) => {
				var divX = event.pageX;
				return (divX + 10) + "px"
			})
		})
		.on("mouseout", function () {
			d3.select(this).transition()
				.duration("50")
				.attr("stroke-width", 1)
			divNeighborhood.style("display", "none");
		})
}

// city chart visual style and interaction
function neighborhoodChart(){
	d3.selectAll(".svgneighborhood")
		.on("click", function (event) {
			let chartNeiborhoodID = "." + $(this).attr("id");
			console.log(chartNeiborhoodID);

			$(".chartline").hide();
			$(chartNeiborhoodID).show();
		})
		.selectAll("path")
			.attr("stroke", (d) => neighborhoodColor(d.id))
			.attr("stroke-width", 1)
			.attr("fill", (d) => neighborhoodColor(d.id))
			.attr("mix-blend-mode", "multiply")
			.attr("opacity", 0.7)
		.on("mouseover", function (event, d) {
			d3.select(this)
				.transition()
				.duration("50")		
				.attr("opacity", 1)
			divBorough.html((divHtml) => d.borough)
				.style("background", (divHtml) => boroughColor(d.borough))
				.style("display", "block");
		})
		.on("mousemove", function (event) {
			divBorough.style("top", (divHtml) => {
				var divY = event.pageY;
				return (divY + 10) + "px"
			})
			.style("left", (divHtml) => {
				var divX = event.pageX;
				return (divX + 10) + "px"
			})
		})
		.on("mouseout", function () {
			d3.select(this).transition()
				.duration("50")
				.attr("opacity", 0.7)
			divBorough.style("display", "none");
		})
}

// nav menu filter
$("#nav>ul>li>ul>li").on("click", function() {
	let chartBoroughClass = ".chart" + $(this).attr("id");

	$(".svgneighborhood").css("display", "none");
	$(chartBoroughClass).css("display", "block");

	if ($(this).attr("id") == "all") {
		$(".svgneighborhood").css("display", "block");
	} else {
		$(".chartline").hide();

		if ($(this).attr("id") == "manhattan") {
			$(".chart101").show();
		}
		else if ($(this).attr("id") == "bronx") {
			$(".chart201").show();
		}
		else if ($(this).attr("id") == "brooklyn") {
			$(".chart301").show();
		}
		else if ($(this).attr("id") == "queens") {
			$(".chart401").show();
		}
		else if ($(this).attr("id") == "statenisland") {
			$(".chart501").show();
		}
	}
	
});



$(document).ready(function(){
	$("#borough").addClass("grey");
	$("#nav>ul>li>ul>li").addClass("grey");

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
		$("#all").removeClass("grey").css("color", "#000");
		$("#currentborough").html("&mdash;All");
	});
	$("#nav>ul>li>ul>li").on("click", function() {
		$("#city").addClass("grey").css("color", "#aaa");
		$("#borough").removeClass("grey").css("color", "#000");

		$("#nav>ul>li>ul>li").addClass("grey").css("color", "#aaa");
		$(this).removeClass("grey").css("color", "#000");
		if ($(this).attr("id") == "statenisland") {
			$("#currentborough").html("&mdash;Staten Island");
		}
		else {
			$("#currentborough").html("&mdash;" + $(this).attr("id"));
		}
		
	})
})