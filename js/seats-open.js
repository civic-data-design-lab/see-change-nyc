// parse csv data
const dataset = d3.csv("./data/seats-open.csv")
	.then(function(data) {
		data.forEach(function(d) {
			sort: d.sort;
			position: d.position;
			district: d.district;
			member: d.member;
			party: d.party;
			photo: d.photo;
			neighborhoods: d.neighborhoods;
			borough: d.borough;
			shape: d.shape;
			col: +d.col;
			row: +d.row;
			term: d.term;
			open: d.open;
		});

	console.log(data);

	seatMap(svg, data);

	d3.select(".gridv").raise();
	d3.select(".gridh").raise();
	d3.select(".labelborough").raise();

	// shapes falling animation
	const distinct = (value, index, self) => {
		return self.indexOf(value) === index;
	};

	var shapeList = data.map(function(item) {return item.shape})
		.filter(distinct);

	var currentShape = shapeList[0];
	var nextShape = shapeList[1];

	shapesFalling(shapeList, currentShape, nextShape);
	trianglesFalling(triangleList, currentTriangle, nextTriangle);
	labelsAppearing(labelList, currentLabel, nextLabel);
	textAppearing(textList, currentText, nextText);
	totalSeatsAppearing(totalSeatList, currentSeat, nextSeat);
	councilSeatsAppearing(councilSeatList, councilSeatList[0], councilSeatList[1]);
});

// aspect ratio
const width = 130;
const height = 150;
const size = 10;
const offset = 0.3;

// define svg
const svg = d3.select("#open-seats-map")
	.append("svg")
		.attr("viewBox", [0, 0, width, height]);

// color
const color = d3.scaleOrdinal()
	.domain(["Staten Island", "Brooklyn", "Manhattan", "Queens", "Bronx"])
	.range(["#ef9b50", "#dd4599", "#42bfac", "#a7d15c", "#447dae"])
	.unknown("#606060");

// tooltip
var div = d3.select("body").append("div")
	.attr("id", "tooltip")
	.style("display", "none")
	.style('z-index', '10')
	.text("info");

// plus grid
const cols = 13;
const rows = 15;
const plusLength = 1;

let gridVertical = [];
for (var x = 0; x < cols + 1; x++) {
	for (var y = 0; y < rows; y++) {
		const gridItem = {
			x1 : x * size,
			x2 : x * size,
			y1 : y * size - plusLength + size/2 - 0.25,
			y2 : y * size + plusLength + size/2 - 0.25
		};
		gridVertical.push(gridItem);
	}
};

let gridHorizontal = [];
for (var x = 0; x < cols + 1; x++) {
	for (var y = 0; y < rows; y++) {
		const gridItem = {
			x1 : x * size - plusLength,
			x2 : x * size + plusLength,
			y1 : y * size + size/2 - 0.25,
			y2 : y * size + size/2 - 0.25
		};
		gridHorizontal.push(gridItem);
	}
};

const plusGridVertical = svg.append("g")
	.attr("class", "gridv")
	.selectAll("line")
	.data(gridVertical)
	.enter()
	.append("line")
		.attr("x1", (d) => d.x1)
		.attr("x2", (d) => d.x2)
		.attr("y1", (d) => d.y1)
		.attr("y2", (d) => d.y2)
		.attr("stroke", "#000")
		.attr("stroke-width", 0.25)
		.attr("opacity", "0.25");

const plusGridHorizontal = svg.append("g")
	.attr("class", "gridh")
	.selectAll("line")
	.data(gridHorizontal)
	.enter()
	.append("line")
		.attr("x1", (d) => d.x1)
		.attr("x2", (d) => d.x2)
		.attr("y1", (d) => d.y1)
		.attr("y2", (d) => d.y2)
		.attr("stroke", "#000")
		.attr("stroke-width", 0.25)
		.attr("opacity", "0.25");

// map of seats
function seatMap(svg, dataset) {
	const seats = svg.append("g")
		.selectAll("rect")
		.data(dataset)
		.enter()
		.append("rect")
			.attr("class", (d) => {
				return d.open == "Open" ? d.shape + " open"
				: d.shape;
			})
			.attr("x", (d) => {
				return size * +d.col - size + 0.25;
			})
			.attr("y", (d) => {
				return d.district == "District 8" || d.district == "District 34" ? null
					: d.position == "Comptroller" ? 0 - (size * +d.row) - (2 * size) - size/2
					: d.position == "Mayor" ? 0 - (size * +d.row) - (3 * size) - size/2
					: 0 - (size * +d.row) - size/2;
					// : 0 - (size - offset);
			})
			// .attr("y", (d) => {
			// 	return height - (size * +d.row) - size/2;
			// })
			.attr("width", (d) => {
				return d.district == "District 8" || d.district == "District 34" ? null
					: d.position == "Comptroller" ? 2 * size - offset
					: d.position == "Mayor" ? 3 * size - offset
					: size - offset;
			})
			.attr("height", (d) => {
				return d.district == "District 8" || d.district == "District 34" ? null
					: d.position == "Comptroller" ? 2 * size - offset
					: d.position == "Mayor" ? 3 * size - offset
					: size - offset;
			})
			.attr("fill", (d) => color(d.borough))
			.attr("stroke", (d) => color(d.borough))
			.attr("stroke-width", 0.3)
		.on("mouseover", function (event, d) {
			d3.select(this).transition()
				.duration("50")
				.attr("stroke", "#000")
				.attr("stroke-width", 0.6)
				.attr("z-index", "2");
			div.html((divHtml) => "<div class='dataphoto'><img src='./img/open-seats/" + d.photo + "'></div><div class='datatext'><span class='labeldistrict'>" + d.district + "</span><img class='dataparty' src='./img/open-seats/" + d.party + ".svg'><span class='" + d.party + "'>" + d.party + "</span><br><span class='labelmember'>" + d.member + "</span><br><p>" + d.neighborhoods + "</p><p>" + d.term + "</p></div>")
				.style("color", (divHtml) => color(d.borough))
				.style("display", "block");
		})
		.on("mousemove", function (event) {
			div.style("top", (divHtml) => {
					var divY = event.pageY;
					var tooltipHeight = $("#tooltip").outerHeight();
					var displayHeight = $("#open-seats-map").height();
					if ((divY + tooltipHeight) > displayHeight) {
						divY = divY - tooltipHeight - 10;
					};
					return (divY + 10) + "px"
				})
				.style("left", (divHtml) => {
					var divX = event.pageX;
					var tooltipWidth = $("#tooltip").outerWidth();
					var displayWidth = $(window).width();
					if ((divX + tooltipWidth) > displayWidth) {
						divX = divX - tooltipWidth - 10;
					};
					return (divX + 10) + "px"
				})
		})
		.on('mouseout', function () {
			d3.select(this).transition()
				.duration('50')
				.attr("stroke", (d) => color(d.borough))
				.attr("stroke-width", 0.3)
			div.style("display", "none");
		});

	// split triangle seats
	const triangleData = dataset.filter(d => d.district == "District 8" || d.district == "District 34");
	const seatsSplit = svg.append("g")
		.selectAll("path")
		.data(triangleData)
		.enter()
		.append("path")
			.attr("class", (d) => {
				return d.open == "Open" ? "tri" + d.shape + " open"
				: "tri" + d.shape;
			})
			// .attr("d", (d) => {
			// 	let triangleBottomLeft = "M " + ((+d.col - 1) * size + offset) + " " + (-height - size/2 - (+d.row * size) + offset) + " L " + ((+d.col - 1) * size + offset) + " " + (-height + size/2 - (+d.row * size) - offset) + " L " + (+d.col * size - offset - offset/2) + " " + (-height + size/2 - (+d.row * size) - offset) + " L " + ((+d.col - 1) * size + offset) + " " + (-height - size/2 - (+d.row * size) + offset);
			// 	let triangleTopRight = "M " + ((+d.col - 1) * size + offset) + " " + (-height - size/2 - (+d.row * size)) + " L " + (+d.col * size - offset/2) + " " + (-height - size/2 - (+d.row * size)) + " L " + (+d.col * size - offset/2) + " " + (-height + size/2 - (+d.row * size) - offset - offset/2) + " L " + ((+d.col - 1) * size + offset) + " " + (-height - size/2 - (+d.row * size));
			// 	return (d.district == "District 8" && d.borough == "Manhattan") ? triangleBottomLeft
			// 		: (d.district == "District 8" && d.borough == "Bronx") ? triangleTopRight
			// 		: (d.district == "District 34" && d.borough == "Brooklyn") ? triangleBottomLeft
			// 		: (d.district == "District 34" && d.borough == "Queens") ? triangleTopRight
			// 		: null;
			// })
			.attr("d", (d) => {
				let triangleBottomLeft = "M " + ((+d.col - 1) * size + offset) + " " + (height - size/2 - (+d.row * size) + offset) + " L " + ((+d.col - 1) * size + offset) + " " + (height + size/2 - (+d.row * size) - offset) + " L " + (+d.col * size - offset - offset/2) + " " + (height + size/2 - (+d.row * size) - offset) + " L " + ((+d.col - 1) * size + offset) + " " + (height - size/2 - (+d.row * size) + offset);
				let triangleTopRight = "M " + ((+d.col - 1) * size + offset) + " " + (height - size/2 - (+d.row * size)) + " L " + (+d.col * size - offset/2) + " " + (height - size/2 - (+d.row * size)) + " L " + (+d.col * size - offset/2) + " " + (height + size/2 - (+d.row * size) - offset - offset/2) + " L " + ((+d.col - 1) * size + offset) + " " + (height - size/2 - (+d.row * size));
				return (d.district == "District 8" && d.borough == "Manhattan") ? triangleBottomLeft
					: (d.district == "District 8" && d.borough == "Bronx") ? triangleTopRight
					: (d.district == "District 34" && d.borough == "Brooklyn") ? triangleBottomLeft
					: (d.district == "District 34" && d.borough == "Queens") ? triangleTopRight
					: null;
			})
			.style("transform", "translateY(-150px)")
			.attr("fill", (d) => color(d.borough))
			.attr("stroke", (d) => color(d.borough))
			.attr("stroke-width", 0.3)
		.on("mouseover", function (event, d) {
			d3.select(this).transition()
				.duration("50")
				.attr("stroke", "#000")
				.attr("stroke-width", 0.5)
				.attr("z-index", "2");
			div.html((divHtml) => "<div class='dataphoto'><img src='./img/open-seats/" + d.photo + "'></div><div class='datatext'><span class='labeldistrict'>" + d.district + "</span><img class='dataparty' src='./img/open-seats/" + d.party + ".svg'><span class='" + d.party + "'>" + d.party + "</span><br><span class='labelmember'>" + d.member + "</span><br><p>" + d.neighborhoods + "</p><p>" + d.term + "</p></div>")
				.style("display", "block");
		})
		.on("mousemove", function (event) {
			div.style("top", (divHtml) => {
					var divY = event.pageY;
					var tooltipHeight = $("#tooltip").outerHeight();
					var displayHeight = $("#open-seats-map").height();
					if ((divY + tooltipHeight) > displayHeight) {
						divY = divY - tooltipHeight - 10;
					};
					return (divY + 10) + "px"
				})
				.style("left", (divHtml) => {
					var divX = event.pageX;
					var tooltipWidth = $("#tooltip").outerWidth();
					var displayWidth = $(window).width();
					if ((divX + tooltipWidth) > displayWidth) {
						divX = divX - tooltipWidth - 10;
					};
					return (divX + 10) + "px"
				})
		})
		.on('mouseout', function () {
			d3.select(this).transition()
				.duration('50')
				.attr("stroke", (d) => color(d.borough))
				.attr("stroke-width", 0.3)
			div.style("display", "none");
		})
};

// shapes falling animation
var animationDuration = 2000;

function delay(multiplier) {
	return multiplier * animationDuration;
};

function shapesFalling(shapeList, currentShape, nextShape) {
	d3.selectAll("." + currentShape)
		.transition()
		.delay((d) => {
			return (d.shape == "si-1") ? delay(1) : 0;})
		.duration(animationDuration)
		.attr("y", (d) => {
			return height - (size * +d.row) - size/2;
		}, "linear")
		.attr('pointer-events', 'none')
		.end()
		.then(function() {
			if (nextShape) {
				shapeList.shift();
				shapesFalling(shapeList, shapeList[0], shapeList[1]);
			}
			else {
				d3.selectAll("rect")
					.transition()
					.attr('pointer-events', 'auto');
			}
		})
};

// triangles falling animation
var triangleList = [
	{class: "tribk-2", delay: 3}, 
	{class: "trimn-3", delay: 2}, 
	{class: "triqn-2", delay: 1}, 
	{class: "tribx-1", delay: 1}
];
var currentTriangle = triangleList[0];
var nextTriangle = triangleList[1];

function trianglesFalling(triangleList, currentTriangle, nextTriangle) {
	d3.selectAll("." + currentTriangle.class)
		.transition()
			.delay(delay(currentTriangle.delay) + 20)
			.duration(animationDuration)
			.style("transform", "translateY(0px)")
			// .attr("d", (d) => {
			// 	let triangleBottomLeft = "M " + ((+d.col - 1) * size + offset) + " " + (height - size/2 - (+d.row * size) + offset) + " L " + ((+d.col - 1) * size + offset) + " " + (height + size/2 - (+d.row * size) - offset) + " L " + (+d.col * size - offset - offset/2) + " " + (height + size/2 - (+d.row * size) - offset) + " L " + ((+d.col - 1) * size + offset) + " " + (height - size/2 - (+d.row * size) + offset);
			// 	let triangleTopRight = "M " + ((+d.col - 1) * size + offset) + " " + (height - size/2 - (+d.row * size)) + " L " + (+d.col * size - offset/2) + " " + (height - size/2 - (+d.row * size)) + " L " + (+d.col * size - offset/2) + " " + (height + size/2 - (+d.row * size) - offset - offset/2) + " L " + ((+d.col - 1) * size + offset) + " " + (height - size/2 - (+d.row * size));
			// 	return (d.district == "District 8" && d.borough == "Manhattan") ? triangleBottomLeft
			// 		: (d.district == "District 8" && d.borough == "Bronx") ? triangleTopRight
			// 		: (d.district == "District 34" && d.borough == "Brooklyn") ? triangleBottomLeft
			// 		: (d.district == "District 34" && d.borough == "Queens") ? triangleTopRight
			// 		: null;
			// }, "linear")
		.end()
		.then(function() {
				if (nextTriangle) {
					triangleList.shift();
					trianglesFalling(triangleList, triangleList[0], triangleList[1]);
				}			
		})
};
// console.log(currentTriangle.delay);

// borough labels
const labelposition = [
	{label: "Staten Island", x: 2, y: 2, class: "labelsi", delay: 2},
	{label: "Brooklyn", x: 6.5, y: 4, class: "labelbk", delay: 1.5},
	{label: "Manhattan", x: 6, y: 8, class: "labelmn", delay: 2.5},
	{label: "Queens", x: 10, y: 7, class: "labelqn", delay: 2.5},
	{label: "Bronx", x: 9, y: 11, class: "labelbx", delay: 1.5},
	{label: "Borough President", x: 13, y: 3, class: "labelbp", delay: 0.5},
	{label: "Comptroller", x: 2.5, y: 6.5, class: "labelcompt", delay: 0.5},
	{label: "Mayor", x: 5, y: 12, class: "labelmayor", delay: 0.5}
];

const boroughLabels = svg.append("g")
	.attr("class", "labelborough")
	.selectAll("text")
	.data(labelposition)
	.enter()
	.append("text")
		.text((d) => d.label)
		.attr("x", (d) => d.x * size - size/2)
		.attr("y", (d) => (height) - (d.y * size) + offset)
		.attr("class", (d) => {
			return (d.class == "labelcompt" || d.class == "labelmayor") ? d.class + " labelinvert"
			: d.class
		})
		.attr("opacity", 0);

// labels appearing animation
var labelList = ["labelsi", "labelbk", "labelmn", "labelqn", "labelbx", "labelbp", "labelcompt", "labelmayor"];
var currentLabel = labelList[0];
var nextLabel = labelList[1];

function labelsAppearing(labelList, currentLabel, nextLabel) {
	d3.selectAll("." + currentLabel)
		.transition()
			.delay((d) => delay(d.delay))
			.duration(animationDuration/2)
			.attr("opacity", "1")
		.end()
		.then(function() {
			if (nextLabel) {
				labelList.shift();
				labelsAppearing(labelList, labelList[0], labelList[1]);
			}
		})
};

// text animation
var textList = [
		{text: "New York City Government has 58 seats", delay: 0},
		{text: "Staten Island City Council has 3 seats", delay: 1.5},
		{text: "Brooklyn City Council has 16 seats", delay: 1.5}, 
		{text: "Manhattan City Council has 10 seats", delay: 2.5}, 
		{text: "Queens City Council has 15 seats", delay: 2.5}, 
		{text: "Bronx City Council has 9 seats", delay: 1.5},
		{text: "There are 5 Borough President positions", delay: 0.5},
		{text: "1 Comptroller", delay: 0.5}, 
		{text: "And finally, a Mayor", delay: 0.5}
];
var currentText = textList[0];
var nextText = textList[1];

function textAppearing(textList, currentText, nextText) {
	d3.select("#text-animation")
		.html(currentText.text)
		.transition()
			.duration(animationDuration/4)
			.style("opacity", 1)
		.transition()
			.delay(delay(currentText.delay))
			.duration(animationDuration/4)
			.style("opacity", 0)
		.end()
		.then(function() {
			if (nextText) {
				textList.shift();
				textAppearing(textList, textList[0], textList[1]);
			}
			else {
				d3.select("#text-animation")
					.style("height", 0)
					.style("padding", 0)
			}
		})
};

// seat count animation
var totalSeatList = [0, 3, 11, 19, 20, 24, 29, 30, 36, 43, 46, 51, 56, 57, 58];
var councilSeatList = totalSeatList.slice(0,-3);

var currentSeat = totalSeatList[0];
var nextSeat = totalSeatList[1];

function totalSeatsAppearing(seatList, currentSeat, nextSeat) {
	d3.select("#seats-total")
		.html(currentSeat)
		.transition()
			.delay(delay(1) - 30)
		.end()
		.then(function() {
			if (nextSeat) {
				seatList.shift();
				totalSeatsAppearing(totalSeatList, totalSeatList[0], totalSeatList[1]);
			}
		})
};
function councilSeatsAppearing(seatList, currentSeat, nextSeat) {
	d3.select("#seats-city-council")
		.html(currentSeat)
		.transition()
			.delay(animationDuration - 30)
		.end()
		.then(function() {
			if (nextSeat) {
				seatList.shift();
				councilSeatsAppearing(councilSeatList, councilSeatList[0], councilSeatList[1]);
			}
		})
};

$("#fastforward").on("click", function() {
	animationDuration = 10;
	$("#text-animation").hide();
});

$(document).ready(function(){

	// next seat shapes
	const si1 = {shapeID: "si1", shapeName: "Staten Island", imgSrc: "si-1.svg"};
	const bk1 = {shapeID: "bk1", shapeName: "Brooklyn", imgSrc: "bk-1.svg"};
	const bk2 = {shapeID: "bk2", shapeName: "", imgSrc: "bk-2.svg"};
	const mn1 = {shapeID: "mn1", shapeName: "Manhattan", imgSrc: "mn-1.svg"};
	const mn2 = {shapeID: "mn2", shapeName: "", imgSrc: "mn-2.svg"};
	const mn3 = {shapeID: "mn3", shapeName: "", imgSrc: "mn-3.svg"};
	const qn1 = {shapeID: "qn1", shapeName: "Queens", imgSrc: "qn-1.svg"};
	const qn2 = {shapeID: "qn2", shapeName: "", imgSrc: "qn-2.svg"};
	const qn3 = {shapeID: "qn3", shapeName: "", imgSrc: "qn-3.svg"};
	const bx1 = {shapeID: "bx1", shapeName: "Bronx", imgSrc: "bx-1.svg"};
	const bx2 = {shapeID: "bx2", shapeName: "", imgSrc: "bx-2.svg"};
	const boroughpresident = {shapeID: "bp", shapeName: "Borough President", imgSrc: "bp.svg"};
	const comptroller = {shapeID: "compt", shapeName: "Comptroller", imgSrc: "compt.svg"};
	const mayor = {shapeID: "mayor", shapeName: "Mayor", imgSrc: "mayor.svg"};

	allShapes = {
		si1:si1, bk1:bk1, bk2:bk2, mn1:mn1, mn2:mn2, mn3:mn3, qn1:qn1, qn2:qn2, qn3:qn3, bx1:bx1, bx2:bx2, boroughpresident:boroughpresident, comptroller:comptroller, mayor:mayor
	}
	const nextShapeImg = [si1, bk1, bk2, mn1, mn2, mn3, qn1, qn2, qn3, bx1, bx2, boroughpresident, comptroller, mayor];

	for (var i = 0; i < nextShapeImg.length; i++) {
		var templateString = "<div class='shape-box' id='" + nextShapeImg[i].shapeID + "'><img class='shape' src='./img/open-seats/" + nextShapeImg[i].imgSrc + "'><br><span class='shape-name'>" + nextShapeImg[i].shapeName + "</span></div>";
		$("#next-shapes").append(templateString)
	}

	// open seats toggle
	$("#open-seats").on("click", function() {
		if ($(".open").hasClass("openfill")) {
			$(".open").removeClass("openfill");
			$("#seats-city-council").html("51");
			$("#seats-total").html("58");
			$(".labelinvert").css("fill", "#aaa");
		}
		else {
			$(".open").addClass("openfill");
			$("#seats-city-council").html("<span class='grey'>35/</span>51");
			$("#seats-total").html("<span class='grey'>41/</span>58");
			$(".labelinvert").css("fill", "#000");
		}
	});
	$("#open-seats").on("mouseover", function() {
		if ($(".open").hasClass("openfill")) {
			$(this).css("background", "#fff").css("color", "#000");
		}
		else {
			$(this).css("background", "#000").css("color", "#fff");
		}
	});
	$("#open-seats").on("mouseleave", function() {
		if ($(".open").hasClass("openfill")) {
			$(this).css("background", "#000").css("color", "#fff");
		}
		else {
			$(this).css("background", "#fff").css("color", "#000");
		}
	});
})