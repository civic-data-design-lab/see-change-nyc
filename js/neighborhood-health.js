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
			homeBike: +d.homeBike;
			homePedInjury: +d.homePedInjury;
			homeBodega: +d.homeBodega;
			homeFarmersMarket: +d.homeFarmersMarket;
			healthChildObesity: +d.healthChildObesity;
			healthChildAsthma: +d.healthChildAsthma;
			healthPhysicalActivity: +d.healthPhysicalActivity;
			healthUninsured: +d.healthUninsured;
			healthMedCare: +d.healthMedCare;
			healthFluVacc: +d.healthFluVacc;
			healthAdultObesity: +d.healthAdultObesity;
			healthInfantMortality: +d.healthInfantMortality;
			healthLifeExpectancy: +d.healthLifeExpectancy;
			// actual values
			whoRaceNonWhiteValue: +d.whoRaceNonWhiteValue;
			whoBornOutsideValue: +d.whoBornOutsideValue;
			socioecoHighSchoolValue: +d.socioecoHighSchoolValue;
			socioecoPovertyValue: +d.socioecoPovertyValue;
			socioecoUnemploymentValue: +d.socioecoUnemploymentValue;
			socioecoRentValue: +d.socioecoRentValue;
			socioecoHelpfulValue: +d.socioecoHelpfulValue;
			homeDefectsValue: +d.homeDefectsValue;
			homeRoachesValue: +d.homeRoachesValue;
			homeAirValue: +d.homeAirValue;
			homeBikeValue: +d.homeBikeValue;
			homePedInjuryValue: +d.homePedInjuryValue;
			homeBodegaValue: +d.homeBodegaValue;
			homeFarmersMarketValue: +d.homeFarmersMarketValue;
			healthChildObesityValue: +d.healthChildObesityValue;
			healthChildAsthmaValue: +d.healthChildAsthmaValue;
			healthPhysicalActivityValue: +d.healthPhysicalActivityValue;
			healthUninsuredValue: +d.healthUninsuredValue;
			healthMedCareValue: +d.healthMedCareValue;
			healthFluVaccValue: +d.healthFluVaccValue;
			healthAdultObesityValue: +d.healthAdultObesityValue;
			healthInfantMortalityValue: +d.healthInfantMortalityValue;
			healthLifeExpectancyValue: +d.healthLifeExpectancyValue;
		});

		if (!keys.length) {
			keys = data.columns;
		};
		if (!features.length) {
			features = data.columns.slice(3,26);
		};

		// data for city average
		let cityItem = {};
		cityItem.id = 900;
		cityItem.idName = "nyc"
		cityItem.area = "city";
		cityItem.borough = "New York City";

		for (var i = 0; i < features.length; i++) {
			let property = features[i];
			total = data.reduce((accumulator, value) => (accumulator + +value[property]), 0);
			totalValues = data.reduce((accumulator, value) => (accumulator + +value[property + "Value"]), 0);
			cityItem[property] = total/(data.length);
			cityItem[property + "Value"] = Math.round(totalValues/(data.length));
		};
		cityAverage.push(cityItem);
		
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
				totalBoroughValues = data.filter(d => d.borough == borough).reduce((accumulator, value) => (accumulator + +value[property + "Value"]), 0);
				neighborhoodsPerBorough = data.filter(d => d.borough == borough).length;
				(borough == "Manhattan") ? (item.id = 100, item.idName = "manhattan")
					: (borough == "Bronx") ? (item.id = 200, item.idName = "bronx")
					: (borough == "Brooklyn") ? (item.id = 300, item.idName = "brooklyn")
					: (borough == "Queens") ? (item.id = 400, item.idName = "queens")
					: (borough == "Staten Island") ? (item.id = 500, item.idName = "statenisland")
					: item.id = undefined;
				item.area = "borough";
				item.neighborhoods = neighborhoodsPerBorough;
				item.borough = borough;
				item[property] = totalBorough/neighborhoodsPerBorough;
				item[property + "Value"] = Math.round(totalBoroughValues/neighborhoodsPerBorough);
			};
			boroughAverage.push(item);
		};

		// neighborhood list
		neighborhoodList = data.map(function(item) {return item.id});

		// plot overall chart
		plotRadialGrid(svgCity);
		plotAxes(svgCity);
		plotAxesLabels(svgCity)
		plotChart(svgCity, boroughAverage);
		plotChart(svgCity, cityAverage);
		cityChart();

		// plot profile chart
		plotRadialGrid(svgBorough);
		plotAxes(svgBorough);
		plotAxesLabels(svgBorough)
		plotChart(svgBorough, cityAverage);
		plotChart(svgBorough, boroughAverage);
		plotChart(svgBorough, data);
		plotPoints(svgBorough, data);
		boroughChart(data);

		// plot neighborhood small multiple charts
		plotNeighborhoods(data);
		neighborhoodChart()

		// visible on document load
		$(".chartline").hide();
		$(".chartpoint").hide();
		$(".labelprofile").hide();
		$(".chart900").show();
		$(".chart100").show();
		$(".chart101").show();
		$("#chart101").addClass("selected");

		console.log(data);
		console.log(cityAverage);
		console.log(boroughAverage);
});

// aspect ratio
const width = 300;
const height = 350;
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
	.attr("id", "tooltipneighborhood")
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
	.range(["Non-White Residents", "Residents Born Outside U.S.", "Did Not Complete High School", "Poverty", "Unemployment", "Rent Burden", "Helpful Neighbors", "Home w/o Defects", "Home w/o Roaches", "Air Pollution", "Bike Network Coverage", "Pedestrian Injury Hospitalization", "Ratio of Bodegas to Supermarkets", "Farmers Market", "Child Obesity", "Child Asthma", "Physical Activity", "Uninsured", "Unmet Medical Care", "Flu Vaccination", "Adult Obesity", "Infant Mortality", "Life Expectancy"]);

let featureCategory = d3.scaleOrdinal()
	.domain(features)
	.range(["Demographic", "Demographic", "Social & Economic", "Social & Economic", "Social & Economic", "Social & Economic", "Social & Economic", "Housing & Neighborhood", "Housing & Neighborhood", "Housing & Neighborhood", "Housing & Neighborhood", "Housing & Neighborhood", "Housing & Neighborhood", "Housing & Neighborhood", "Health", "Health", "Health", "Health", "Health", "Health", "Health", "Health", "Health"]);

// descriptions per feature
function featureString(feature) {
	return (feature == "whoRaceNonWhite") ? "residents identify as"
	: (feature == "whoBornOutside") ? "residents are"
	: (feature == "socioecoHighSchool") ? "adult residents &lpar;ages 25 or older&rpar;"
	: (feature == "socioecoPoverty") ? "residents live in"
	: (feature == "socioecoUnemployment") ? "residents qualify for"
	: (feature == "socioecoRent") ? "renter-occupied homes suffer from"
	: (feature == "socioecoHelpful") ? "residents benefit from"
	: (feature == "homeDefects") ? "renters live in a"
	: (feature == "homeRoaches") ? "residents live in a"
	: (feature == "homeAir") ? "residents experience significant levels of"
	: (feature == "homeBike") ? "streets have adequate"
	: (feature == "homePedInjury") ? "pedestrians &lpar;rate of pedestrian injury hospitalizations per 100,000 people&rpar;"
	: (feature == "homeBodega") ? "residents have access to &lpar;ratio of bodegas to supermarkets within community district&rpar;"
	: (feature == "homeFarmersMarket") ? "have access to a &lpar;number of farmers markets within community district&rpar;"
	: (feature == "healthChildObesity") ? "public school children &lpar;grades K - 8&rpar; suffer from"
	: (feature == "healthChildAsthma") ? "children &lpar;rate of emergency department visits for asthma per 10,000 children ages 5-17&rpar;"
	: (feature == "healthPhysicalActivity") ? "adults participate in"
	: (feature == "healthUninsured") ? "adults are"
	: (feature == "healthMedCare") ? "adults have"
	: (feature == "healthFluVacc") ? "adults receive a"
	: (feature == "healthAdultObesity") ? "adults suffer from"
	: (feature == "healthInfantMortality") ? "infants suffer from &lpar;rate of infant deaths per 1,000 live births&rpar;"
	: (feature == "healthLifeExpectancy") ? "have a longer &lpar;life expectancy at birth&rpar;"
	: "unknown"
};

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
	.range(["#1e9bb8", "#f05d43", "#8f2e62", "#424d9b", "#dcc651"])
	.unknown("#636b75");
	// .range(["#be90f3", "#7283eb", "#f0a4b5", "#50d2d2", "#e6ba68", "#606060"])
	// .unknown("#a96e9b");

const categoryColor = d3.scaleOrdinal()
	.domain(["Demographic", "Social & Economic", "Housing & Neighborhood", "Health"])
	.range(["#ff6666", "#e2cf64", "#75dca5", "#79c2e2"]);

const neighborhoodColor = d3.scaleOrdinal()
	.domain(["101", "102", "103", "104", "105", "106", "107", "108", "109", "110", "111", "112", "201", "202", "203", "204", "205", "206", "207", "208", "209", "210", "211", "212", "301", "302", "303", "304", "305", "306", "307", "308", "309", "310", "311", "312", "313", "314", "315", "316", "317", "318", "401", "402", "403", "404", "405", "406", "407", "408", "409", "410", "411", "412", "413", "414", "501", "502", "503"])
	.range(["#26849c", "#2c70b9", "#267890", "#459bb0", "#2d82be", "#26849c", "#0c5cad", "#1288be", "#0f6885", "#2f85bf", "#309ab4", "#2773b3",
	"#b25d3a", "#eb8158", "#cf4d57", "#c26051", "#df535a", "#921f29", "#b23f50", "#e98c8a", "#8d3517", "#cf5644", "#902c41", "#af5b5b",
	"#a65b69", "#84555c", "#8d4c82", "#b9647c", "#975d6c", "#b9647c", "#a94c5c", "#95245b", "#ae4053", "#9d4892", "#b56379", "#8b4a56", "#994349", "#903f53", "#75236d", "#b55b8b", "#9b5166", "#a53945",
	"#433f90", "#636aa6", "#2f2073", "#3c5aa1", "#4d579a", "#312b91", "#483797", "#212775", "#4c3c8b", "#212768", "#6060a3", "#3c5aa1", "#6e69ae", "#534695",
	"#dcbf6b", "#999e20", "#e2d348"])
	.unknown("#636b75");

// wrap multi-line text spans
function wrapText(text, width) {
	text.each(function() {
		var text = d3.select(this),
			words = text.text().split(/\s+/).reverse(),
			word,
			line = [],
			lineNumber = 0,
			lineHeight = 1.4,
			anchor = text.attr("text-anchor"),
			x = text.attr("x"),
			y = text.attr("y"),
			dy = parseFloat(text.attr("dy")),
			tspan = text.text(null)
				.append("tspan")
				.attr("text-anchor", anchor)
				.attr("x", x)
				.attr("y", y)
				.attr("dy", dy + "em");
		while (word = words.pop()) {
			line.push(word);
			tspan.text(line.join(" "));
			if (tspan.node().getComputedTextLength() > width) {
				line.pop();
				tspan.text(line.join(" "));
				line = [word];
				tspan = text.append("tspan")
					.attr("text-anchor", anchor)
					.attr("x", x)
					.attr("y", y)
					.attr("dy", ++lineNumber * lineHeight + dy + "em")
					.text(word);
			}
		}
	})
}

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
			.attr("stroke", "#ccc")
			.attr("stroke-width", 0.5)
};

// plot axes
function angleToCoordinate(angle, value) {
	let x = Math.cos(angle) * radialScale(value);
	let y = Math.sin(angle) * radialScale(value);
	return {
		"x": radius + x,
		"y": height/2 - y
	};
};

function featureToCoordinate(inputFeature, element, coordinate) {
	let i = features.findIndex((feature) => feature == inputFeature);
	let angle = (Math.PI / 2) - (2 * Math.PI * i / features.length);
	let angleDeg = angle * (-180/Math.PI);
	if (i > 12) {
		angleDeg = angleDeg + 180;
	}

	if (element == "axes-inner") {
		value = 1;
	} else if (element == "axes-outer") {
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

	if (i > features.length/2) {
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
			.attr("x1", (d) => featureToCoordinate(d, "axes-inner", "x"))
			.attr("y1", (d) => featureToCoordinate(d, "axes-inner", "y"))
			.attr("x2", (d) => featureToCoordinate(d, "axes-outer", "x"))
			.attr("y2", (d) => featureToCoordinate(d, "axes-outer", "y"))
			.attr("stroke", "#ccc")
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
			.attr("x", 0)
			.attr("y", 0)
			// .attr("x", (d) => featureToCoordinate(d, "label", "x"))
			// .attr("y", (d) => featureToCoordinate(d, "label", "y"))
			// .attr("transform-origin", (d) => featureToCoordinate(d, "label", "x") + " " + featureToCoordinate(d, "label", "y"))
			.attr("text-anchor", (d) => transformLabel(d, "anchor"))
			// .attr("transform", (d) => "rotate(" + transformLabel(d, "angleDeg") + ")")
			.attr("transform", (d) => "translate(" + featureToCoordinate(d, "label", "x") + "," + featureToCoordinate(d, "label", "y") + ") rotate(" + transformLabel(d, "angleDeg") + ")")
			.text((d) => featureName(d))
			.attr("dy", 0)
			.call(wrapText, 50);
};

// plot data
let line = d3.line()
	.x((d) => d.x)
	.y((d) => d.y);

function getPathCoordinates(dataPoint) {
	let coordinates = [];
	for (var i = 0; i < features.length; i++) {
		let featureName = features[i];
		let angle = (Math.PI / 2) - (2 * Math.PI * i / features.length);
		coordinates.push(angleToCoordinate(angle, dataPoint[featureName]))
	};
	coordinates.push(coordinates[0]);
	return coordinates;
}

function plotChart(svg, data) {
	svg.append("g")
		.attr("class", "dataplot")
		.selectAll("path")
		.data(data)
		.enter()
		.append("path")
			.attr("class", (d) => d.area)
			.attr("d", (d) => line(getPathCoordinates(d)))
}

// plot circles for data points
function getPointCoordinates(dataPoint) {
	let coordinates = [];
	for (var i = 0; i < features.length; i++) {
		let featureName = features[i];
		let featureValue = features[i] + "Value";
		let angle = (Math.PI / 2) - (2 * Math.PI * i / features.length);

		let item = angleToCoordinate(angle, dataPoint[featureName]);
		item.feature = featureName;
		item[featureName] = dataPoint[featureName];
		item[featureValue] = dataPoint[featureValue];
		item.id = dataPoint.id;
		item.borough = dataPoint.borough;
		item.neighborhood = dataPoint.neighborhood;

		coordinates.push(item);
	};
	return coordinates;
}

function plotPoints(svg, data) {
	svg.append("g")
		.attr("class", "datapoints")

	data.forEach(function(currentData, index) {
		dataPoint = getPointCoordinates(currentData);

		svg.selectAll(".datapoints")
			.append("g")
			.attr("class", "chartcircles")
			.selectAll("circle")
			.data(dataPoint)
			.enter()
			.append("circle")
				.attr("class", (d) => "chartpoint chart" + d.id)
				.attr("cx", (d) => d.x)
				.attr("cy", (d) => d.y)
				.attr("r", 2)
				.attr("stroke", (d) => categoryColor(featureCategory(d.feature)))
				.attr("fill", "#fff")
	});
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
				.text((d) => d.neighborhood)
				.attr("text-anchor", "middle")
				.attr("x", width/2)
				.attr("y", height - 30)
				.attr("dy", 0)
				.call(wrapText, 200);
	}
}

// scrolltop jump to borough profile
var winHeight = $(window).height();

$(window).resize(function() {
	winHeight = $(window).height();
});

function scrollToProfile() {
	$("html, body").animate({scrollTop: winHeight});
};

function scrollToTop() {
	$("html, body").animate({scrollTop: 0});
};

// filter boroughs via nav menu and on city chart click
function filterBorough(boroughId) {
	if (boroughId.startsWith("chart")) {
		boroughId = boroughId.substring(5);
	}

	if (boroughId.endsWith("nyc")) {
		$(".svgneighborhood").css("display", "block");
	}
	else {
		$(".svgneighborhood").css("display", "none").removeClass("selected");
		$(".chartline").hide();
		$(".chartpoint").hide();
		$(".labelprofile").hide();
		$(".chart900").show();

		if (boroughId == "manhattan") {
			$(".chart100").show();
			$(".chart101").show();
			$("#chart101").addClass("selected");
		}
		else if (boroughId == "bronx") {
			$(".chart200").show();
			$(".chart201").show();
			$("#chart201").addClass("selected");
		}
		else if (boroughId == "brooklyn") {
			$(".chart300").show();
			$(".chart301").show();
			$("#chart301").addClass("selected");
		}
		else if (boroughId == "queens") {
			$(".chart400").show();
			$(".chart401").show();
			$("#chart401").addClass("selected");
		}
		else if (boroughId == "statenisland") {
			$(".chart500").show();
			$(".chart501").show();
			$("#chart501").addClass("selected");
		}
	}
}

// nav borough filter display
function filterBoroughNav(boroughId) {
	if (boroughId.startsWith("chart")) {
		boroughId = boroughId.substring(5);
	}

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

// city chart visual style and interaction
function cityChart(){
	svgCity.selectAll(".dataplot")
			.style("mix-blend-mode", "multiply")
		.selectAll("path")
			.attr("id", (d) => "chart" + d.idName)
			.attr("stroke", (d) => boroughColor(d.borough))
			.attr("stroke-width", (d) => {
				return (d.idName == "nyc") ? 1
				: 0;
			})
			.attr("stroke-opacity", 1)
			.attr("stroke-dasharray", (d) => {
				return (d.idName == "nyc") ? "1,2"
				: 0;
			})
			.attr("fill", (d) => boroughColor(d.borough))
			.style("mix-blend-mode", "lighten")
			.attr("fill-opacity", (d) => {
				return (d.idName == "nyc") ? 0
				: 0.7;
			})
		.on("mouseover", function (event, d) {
			d3.select(this)
				.raise()
				.transition()
				.duration("50")		
				.attr("stroke-width", 1)
				.attr("z-index", "5")
				.attr("fill-opacity", 0.8)
				.style("mix-blend-mode", "normal")
			divBorough.html((divHtml) => d.borough + " Average")
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
				.attr("stroke-width", (d) => {
				return (d.idName == "nyc") ? 1
				: 0;
			})
				.style("mix-blend-mode", "lighten")
				.attr("fill-opacity", (d) => {
				return (d.idName == "nyc") ? 0
				: 0.7;
			})
			divBorough.style("display", "none");
		})
		.on("click", function (event) {
			filterBoroughNav($(this).attr("id"))
			filterBorough($(this).attr("id"));

			let chartBoroughClass = "." + $(this).attr("id");
			$(chartBoroughClass).css("display", "block");

			scrollToProfile();
		})
}

// borough profile chart visual style and interaction
function boroughChart(data){
	// profile chart label
	svgBorough.append("g")
		.attr("class", "svgprofile")
		.selectAll("text")
		.data(data)
		.enter()
		.append("text")
			.attr("class", (d) => "labelprofile chart" + d.id)
		.append("tspan")
		.text((d) => d.neighborhood)
			.attr("x", width/2)
			.attr("y", 15)
			.attr("text-anchor", "middle");

	// radar path shape
	svgBorough
		.attr("class", "svgprofile")
		.selectAll(".dataplot")
		.selectAll("path")
			.attr("class", (d) => "chartline chart" + d.id)
			.attr("stroke", (d) => boroughColor(d.borough))
			.attr("stroke-width", 1)
			.attr("stroke-opacity", (d) => {
				return (d.area == "city") ? 0
				: (d.area == "borough") ? 0
				: 1
			})
			.style("mix-blend-mode", "multiply")
			.attr("fill", (d) => boroughColor(d.borough))
			.attr("fill-opacity", (d) => {
				return (d.area == "city") ? 0.2
				: (d.area == "borough") ? 0.5
				: 0
			})
		.on("mouseover", function (event, d) {
			d3.select(this)
				.raise()
				.transition()
				.duration(50)
				.attr("stroke-width", 1.5)
				.style("mix-blend-mode", "normal")
				.attr("fill-opacity", 0.8)
				.attr("z-index", "5")
			divBorough.html((divHtml) => {
				return (d.area) ? d.borough + " Average"
				: d.neighborhood + ", " + d.borough
			})
				.style("background", (divHtml) => boroughColor(d.borough))
				.style("display", "block");
		})
		.on("mousemove", function (event) {
			divBorough
				.style("top", (divHtml) => {
					var divY = event.pageY;
					return (divY + 10) + "px"
				})
				.style("left", (divHtml) => {
					var divX = event.pageX;
					return (divX + 10) + "px"
				})
		})
		.on("mouseout", function () {
			d3.select(this)
				.transition()
				.duration(50)
				.attr("stroke-width", 1)
				.style("mix-blend-mode", "multiply")
				.attr("fill-opacity", (d) => {
				return (d.area == "city") ? 0.2
				: (d.area == "borough") ? 0.4
				: 0
			})
			divBorough.style("display", "none");
		})

		// hover datapoints
		svgBorough.select(".datapoints")
			.selectAll(".chartcircles")
			.selectAll(".chartpoint")
			.on("mouseover", function(event, d) {
				d3.select(this)
					.raise()
					.transition()
					.duration(50)
					.attr("fill", (d) => categoryColor(featureCategory(d.feature)))
					.attr("stroke-width", 2)
				divNeighborhood.html((divHtml) => {
					if (d.borough == "Manhattan") {i = 0}
					else if (d.borough == "Bronx") {i = 1}
					else if (d.borough == "Brooklyn") {i = 2}
					else if (d.borough == "Queens") {i = 3}
					else if (d.borough == "Staten Island") {i = 4};
					return "<span class='h3 black'>" + featureName(d.feature) + "</span><br><span class='data1'>" + d[d.feature + "Value"] + "%</span><p>of <b>" + d.neighborhood + "</b> " + featureString(d.feature) + " <b>" + featureName(d.feature) + "</b>.</p><p class='avg'>The <b>" + d.borough + "</b> average is:</p><span class='data2'>" + boroughAverage[i][d.feature + "Value"] + "%</span><p class='avg'>The <b>NYC</b> average is:</p><span class='data2'>" + cityAverage[0][d.feature + "Value"] + "%</span>"
				})
					.style("color", (divHtml) => categoryColor(featureCategory(d.feature)))
					.style("display", "block");
			})
			.on("mousemove", function (event) {
				divNeighborhood
					.style("top", (divHtml) => {
						var divY = event.pageY;
						var tooltipHeight = $("#tooltipneighborhood").outerHeight();
						// winHeight = $(window).height();
						if ((divY - winHeight + tooltipHeight) > winHeight) {
							divY = divY - tooltipHeight - 10;
						};
						return (divY + 10) + "px"
					})
					.style("left", (divHtml) => {
						var divX = event.pageX;
						return (divX + 10) + "px"
					})
			})
			.on("mouseout", function() {
				d3.select(this)
					.transition()
					.duration(50)
					.attr("fill", "#fff")
					.attr("stroke-width", 1)
				divNeighborhood.style("display", "none");
			})
}

// city chart visual style and interaction
function neighborhoodChart(){
	d3.selectAll(".svgneighborhood")
		.on("click", function (event) {
			$(".chartline").hide();
			$(".chartpoint").hide();
			$(".labelprofile").hide();
			$(".svgneighborhood").removeClass("selected");
			$(".chart900").show();

			if ($(this).attr("id").startsWith("chart1")) {
				$(".chart100").show();
			}
			else if ($(this).attr("id").startsWith("chart2")) {
				$(".chart200").show();
			}
			else if ($(this).attr("id").startsWith("chart3")) {
				$(".chart300").show();
			}
			else if ($(this).attr("id").startsWith("chart4")) {
				$(".chart400").show();
			}
			else if ($(this).attr("id").startsWith("chart5")) {
				$(".chart500").show();
			}

			let chartNeiborhoodID = "." + $(this).attr("id");
			$(chartNeiborhoodID).show();
			$(this).addClass("selected");
		})
		.selectAll("path")
			.attr("stroke", (d) => neighborhoodColor(d.id))
			.attr("stroke-width", 1)
			.attr("fill", (d) => neighborhoodColor(d.id))
			.style("mix-blend-mode", "multiply")
			.attr("opacity", 0.8)
		.on("mouseover", function (event, d) {
			d3.select(this)
				.transition()
				.duration("50")		
				.attr("opacity", 1)
			// divBorough.html((divHtml) => d.borough)
			// 	.style("background", (divHtml) => boroughColor(d.borough))
			// 	.style("display", "block");
		})
		// .on("mousemove", function (event) {
		// 	divBorough.style("top", (divHtml) => {
		// 		var divY = event.pageY;
		// 		return (divY + 10) + "px"
		// 	})
		// 		.style("left", (divHtml) => {
		// 			var divX = event.pageX;
		// 			return (divX + 10) + "px"
		// 		})
		// })
		.on("mouseout", function () {
			d3.select(this).transition()
				.duration("50")
				.attr("opacity", 0.8)
			// divBorough.style("display", "none");
		})
}

// nav display on load
$(document).ready(function(){
	$("#borough").addClass("grey");
	$("#nav>ul>li>ul>li").addClass("grey");
})

// nav clicks
$("#city").on("click", function() {
	$(this).removeClass("grey").css("color", "#000");
	$("#borough").addClass("grey").css("color", "#aaa");

	$("#nav>ul>li>ul>li").addClass("grey").css("color", "#aaa");
	$("#currentborough").html("");
	$(".svgneighborhood").css("display", "block");

	scrollToTop();
});
$("#borough").on("click", function() {
	$(this).removeClass("grey").css("color", "#000");
	$("#city").addClass("grey").css("color", "#aaa");

	$("#nav>ul>li>ul>li").addClass("grey").css("color", "#aaa");
	$("#nyc").removeClass("grey").css("color", "#000");
	$("#currentborough").html("&mdash;All");

	scrollToProfile();
});
// nav click by filtering boroughs
$("#nav>ul>li>ul>li").on("click", function() {
	filterBoroughNav($(this).attr("id"));
	filterBorough($(this).attr("id"));

	let chartBoroughClass = ".chart" + $(this).attr("id");
	$(chartBoroughClass).css("display", "block");

	scrollToProfile();
})