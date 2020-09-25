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
			features = data.columns.slice(3,26);
		}

		plotAxes();
		plotChart(data);

		console.log(data);
});

// aspect ratio
const width = 300;
const height = 300;
const radius = 150;

// define svg
const svg = d3.select("#radar-chart")
	.append("svg")
		.attr("viewBox", [0, 0, width, height]);

// define keys & features
let keys = [];
let features = [];

let featureNames = d3.scaleOrdinal()
	.domain(features)
	.range(["Non-White Residents", "Residents Born Outside US", "Did Not Complete High School", "Poverty", "Unemployment", "Rent Burden", "Helpful Neighbors", "Home w/o Defects", "Home w/o Rodents", "Air Pollution", "Bike Network Coverage", "Pedestrian Injury Hospitalization", "Ratio of Bodegas to Supermarkets", "Farmers Market", "Child Obesity", "Child Asthma", "Physical Activity", "Uninsured", "Unmet Medical Care", "Flu Vaccination", "Adult Obesity", "Infant Mortality", "Life Expectancy"]);

// color
const colorsBoroughs = d3.scaleOrdinal()
	.domain(["Manhattan", "Bronx", "Brooklyn", "Queens", "Staten Island"])
	.range(["#be90f3", "#7283eb", "#fcc998", "#e6ba68", "#c199b6"]);

const colors = ["#c199b6", "#c39af4", "#f0a4b5", "#50d2d2", "#b1e4e2", "#c7d7db", "#e0e769", "#ffed64", "#fccea1", "#7f8fed", "#a5c7e7", "#efd3a0"];

// radial gridlines
let radialScale = d3.scaleLinear()
	.domain([0,10])
	.range([0,100]);
const ticks = [1,2,3,4,5,6,7,8,9,10];

ticks.forEach((t) => {
	svg.append("circle")
		.attr("cx", width/2)
		.attr("cy", height/2)
		.attr("r", radialScale(t))
		.attr("fill", "none")
		.attr("stroke", "#aaa")
		.attr("stroke-width", 0.5)		
});

// plot axes
function angleToCoordinate(angle, value) {
	let x = Math.cos(angle) * radialScale(value);
	let y = Math.sin(angle) * radialScale(value);
	return {
		"x": radius + x,
		"y": radius - y
	};
};

function plotAxes(){
	for (var i = features.length - 1; i > -1; i--) {
		let labelName = featureNames(features[i]);
		let angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
		let angleDeg = angle * (-180/Math.PI);
		let lineCoordinate = angleToCoordinate(angle, 10);
		let labelCoordinate = angleToCoordinate(angle, 10.5);

		// draw axis line
		svg.append("line")
			.attr("x1", radius)
			.attr("y1", radius)
			.attr("x2", lineCoordinate.x)
			.attr("y2", lineCoordinate.y)
			.attr("stroke", "#aaa")
			.attr("stroke-width", 0.5);

		// draw axis label
		svg.append("text")
			.attr("class", "labelfeature")
			.attr("x", labelCoordinate.x)
			.attr("y", labelCoordinate.y)
			.attr("transform-origin", labelCoordinate.x + " " + labelCoordinate.y)
			.attr("transform", "rotate(" + angleDeg + ")")
			.text(labelName);
	}
};

// plot data
let line = d3.line()
	.x((d) => d.x)
	.y((d) => d.y);

function getPathCoordinates(dataPoint) {
	let coordinates = [];
	for (var i = features.length - 1; i > -1; i--) {
		let featureName = features[i];
		let angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
		coordinates.push(angleToCoordinate(angle, dataPoint[featureName]))
	};
	return coordinates;
}

function plotChart(data){
	// for (var i = 0; i < data.length; i++) {
	for (var i = 0; i < 10; i++) {
		let d = data[i];
		let color = colors[i];
		let coordinates = getPathCoordinates(d);

		svg.append("path")
			.datum(coordinates)
			.attr("d", line)
			.attr("stroke-width", 3)
			.attr("stroke", color)
			.attr("fill", color)
			.attr("mix-blend-mode", "multiply")
			.attr("stroke-opacity", 1)
			.attr("opacity", 0.5);
	}
}

// $(document).ready(function(){
// 	$(".labelfeature").on("load", function(){
// 		if (-265 < $(this).each("rotate") < -105) {
// 			var newAngle = $(this).css("rotate") + 180;
// 			console.log(newAngle);
// 			$(this).css("text-anchor", "end")
// 				.css("transform", "rotate(" + newAngle + ")");
// 		}
// 	})
// })