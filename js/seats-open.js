const dataset = d3.csv("./data/seats-open.csv", (d) => {
	return {
		sort: d.sort,
		position: d.position,
		district: d.district,
		member: d.member,
		party: d.party,
		photo: d.photo,
		neighborhoods: d.neighborhoods,
		borough: d.borough,
		shape: d.shape,
		col: +d.col,
		row: +d.row,
		term: d.term,
		open: d.open
	};
}, (error, data) => {
	console.log(data);

	seatMap(svg, data);

	d3.select(".gridv").raise();
	d3.select(".gridh").raise();
	d3.select(".labelborough").raise();
});

// aspect ratio
const width = 130;
const height = 150;
const size = 10;

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

// map of seats
function seatMap(svg, dataset) {
	const seats = svg.append("g")
		.selectAll("rect")
		.data(dataset)
		.enter()
		.append("rect")
			.attr("class", (d) => {
				return d.open == "Open" ? "open"
				: null;
			})
			.attr("x", (d) => {
				return size * +d.col - size + 0.25;
			})
			.attr("y", (d) => {
				return height - (size * +d.row) - size/2;
			})
			.attr("width", (d) => {
				return d.district == "District 8" || d.district == "District 34" ? null
					: d.position == "Comptroller" ? 2 * size - 0.5
					: d.position == "Mayor" ? 3 * size - 0.5
					: size - 0.5;
			})
			.attr("height", (d) => {
				return d.district == "District 8" || d.district == "District 34" ? null
					: d.position == "Comptroller" ? 2 * size - 0.5
					: d.position == "Mayor" ? 3 * size - 0.5
					: size - 0.5;
			})
			.attr("fill", (d) => color(d.borough))
			.attr("stroke", (d) => color(d.borough))
			.attr("stroke-width", "0.5")
			.on("mouseover", function (d, i) {
				d3.select(this).transition()
					.duration("50")
					.attr("stroke", "#000")
					.attr("z-index", "2");
				div.html((divHtml) => "<div class='dataphoto'><img src='./img/" + d.photo + "'></div><div class='datatext'><span class='labeldistrict'>" + d.district + "</span><img class='dataparty' src='./img/" + d.party + ".svg'><br><span class='labelmember'>" + d.member + "</span><br><p>" + d.neighborhoods + "</p><p>" + d.term + "</p></div>")
					.style("color", (divHtml) => color(d.borough))
					.style("display", "block");
			})
			.on("mousemove", function (e) {
				div.style("top", (divHtml) => {
						var divY = d3.event.pageY;
						var tooltipHeight = $("#tooltip").outerHeight();
						var displayHeight = $("#open-seats-map").height();
						if ((divY + tooltipHeight) > displayHeight) {
							divY = divY - tooltipHeight - 10;
						};
						return (divY + 10) + "px"
					})
					.style("left", (divHtml) => {
						var divX = d3.event.pageX;
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
				div.style("display", "none");
			});

	// split triangle seats
	const seatsSplit = svg.append("g")
		.selectAll("path")
		.data(dataset)
		.enter()
		.append("path")
			.attr("class", (d) => {
				return d.open == "Open" ? "open"
				: null;
			})
			.attr("d", (d) => {
				const triangleBottomLeft = "M " + (size * +d.col - size + 0.25) + " " + (height - (size * +d.row) - size/2 + 0.5) + " L " + (size * +d.col - size + 0.25) + " " + (height - (size * +d.row) + size/2 - 0.5) + " L " + (size * +d.col - 0.75) + " " + (height - (size * +d.row) + size/2 - 0.5) + " L " + (size * +d.col - size + 0.25) + " " + (height - (size * +d.row) - size/2 + 0.5);
				const triangleTopRight = "M " + (size * +d.col - size + 0.5) + " " + (height - (size * +d.row) - size/2) + " L " + (size * +d.col - 0.25) + " " + (height - (size * +d.row) - size/2) + " L " + (size * +d.col - 0.25) + " " + (height - (size * +d.row) + size/2 - 0.75) + " L " + (size * +d.col - size + 0.5) + " " + (height - (size * +d.row) - size/2);
				return (d.district == "District 8" && d.borough == "Manhattan") ? triangleBottomLeft
					: (d.district == "District 8" && d.borough == "Bronx") ? triangleTopRight
					: (d.district == "District 34" && d.borough == "Brooklyn") ? triangleBottomLeft
					: (d.district == "District 34" && d.borough == "Queens") ? triangleTopRight
					: null;
			})
			.attr("fill", (d) => color(d.borough))
			.attr("stroke", (d) => color(d.borough))
			.attr("stroke-width", "0.5")
			.on("mouseover", function (d, i) {
				d3.select(this).transition()
					.duration("50")
					.attr("stroke", "#000")
					.attr("z-index", "2");
				div.html((divHtml) => "<div class='dataphoto'><img src='./img/" + d.photo + "'></div><div class='datatext'><span class='labeldistrict'>" + d.district + "</span><img class='dataparty' src='./img/" + d.party + ".svg'><br><span class='labelmember'>" + d.member + "</span><br><p>" + d.neighborhoods + "</p><p>" + d.term + "</p></div>")
					.style("display", "block");
			})
			.on("mousemove", function (e) {
				div.style("top", (divHtml) => {
						var divY = d3.event.pageY;
						var tooltipHeight = $("#tooltip").outerHeight();
						var displayHeight = $("#open-seats-map").height();
						if ((divY + tooltipHeight) > displayHeight) {
							divY = divY - tooltipHeight - 10;
						};
						return (divY + 10) + "px"
					})
					.style("left", (divHtml) => {
						var divX = d3.event.pageX;
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
				div.style("display", "none");
			});
};

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
		.attr("stroke-width", "0.25")
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
		.attr("stroke-width", "0.25")
		.attr("opacity", "0.25");

// borough labels
const labelposition = [
	{	label: "Staten Island",
		x: 2,
		y: 2
	},
	{	label: "Brooklyn",
		x: 6.5,
		y: 4
	},
	{	label: "Manhattan",
		x: 6,
		y: 8
	},
	{	label: "Queens",
		x: 10,
		y: 7
	},
	{	label: "Bronx",
		x: 9,
		y: 11
	},
	{	label: "Borough President",
		x: 13,
		y: 3,
		class: "labelbp"
	},
	{	label: "Comptroller",
		x: 2.5,
		y: 6.5,
		class: "labelinvert"
	},
	{	label: "Mayor",
		x: 5,
		y: 12,
		class: "labelinvert"
	}
];

const boroughLabels = svg.append("g")
	.attr("class", "labelborough")
	.selectAll("text")
	.data(labelposition)
	.enter()
	.append("text")
		.text((d) => d.label)
		.attr("x", (d) => d.x * size - size/2)
		.attr("y", (d) => (height) - (d.y * size))
		.attr("class", (d) => d.class)

$(document).ready(function(){

	// next seat shapes
	const si1 = {
		shapeID: "si1",
		shapeName: "Staten Island",
		imgSrc: "si-1.svg"
	};
	const bk1 = {
		shapeID: "bk1",
		shapeName: "Brooklyn",
		imgSrc: "bk-1.svg"
	};
	const bk2 = {
		shapeID: "bk2",
		shapeName: "",
		imgSrc: "bk-2.svg"
	};
	const mn1 = {
		shapeID: "mn1",
		shapeName: "Manhattan",
		imgSrc: "mn-1.svg"
	};
	const mn2 = {
		shapeID: "mn2",
		shapeName: "",
		imgSrc: "mn-2.svg"
	};
	const mn3 = {
		shapeID: "mn3",
		shapeName: "",
		imgSrc: "mn-3.svg"
	};
	const qn1 = {
		shapeID: "qn1",
		shapeName: "Queens",
		imgSrc: "qn-1.svg"
	};
	const qn2 = {
		shapeID: "qn2",
		shapeName: "",
		imgSrc: "qn-2.svg"
	};
	const qn3 = {
		shapeID: "qn3",
		shapeName: "",
		imgSrc: "qn-3.svg"
	};
	const bx1 = {
		shapeID: "bx1",
		shapeName: "Bronx",
		imgSrc: "bx-1.svg"
	};
	const bx2 = {
		shapeID: "bx2",
		shapeName: "",
		imgSrc: "bx-2.svg"
	};
	const boroughpresident = {
		shapeID: "bp",
		shapeName: "Borough President",
		imgSrc: "bp.svg"
	};
	const comptroller = {
		shapeID: "compt",
		shapeName: "Comptroller",
		imgSrc: "compt.svg"
	};
	const mayor = {
		shapeID: "mayor",
		shapeName: "Mayor",
		imgSrc: "mayor.svg"
	};

	allShapes = {
		si1:si1, bk1:bk1, bk2:bk2, mn1:mn1, mn2:mn2, mn3:mn3, qn1:qn1, qn2:qn2, qn3:qn3, bx1:bx1, bx2:bx2, boroughpresident:boroughpresident, comptroller:comptroller, mayor:mayor
	}
	const nextShape = [si1, bk1, bk2, mn1, mn2, mn3, qn1, qn2, qn3, bx1, bx2, boroughpresident, comptroller, mayor];

	for (var i = 0; i < nextShape.length; i++) {
		var templateString = "<div class='shape-box' id='" + nextShape[i].shapeID + "'><img class='shape' src='./img/" + nextShape[i].imgSrc + "'><br><span class='shape-name'>" + nextShape[i].shapeName + "</span></div>";
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