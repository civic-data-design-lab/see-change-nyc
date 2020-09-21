const dataset = d3.csv("./data/seats-open.csv", (d) => {
	return {
		sort: d.sort,
		position: d.position,
		district: d.district,
		member: d.member,
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
});

// aspect ratio
const width = 130;
const height = 150;
const size = 10;

//define svg
const svg = d3.select("#open-seats-map")
	.append("svg")
	.attr("viewBox", [0, 0, width, height]);

// tooltip
var div = d3.select("body").append("div")
	.attr("class", "tooltip")
	.style("display", "none")
	.style('z-index', '10')
	.text("info");

// map of open seats
function seatMap(svg, dataset) {
	const seats = svg.append("g")
		.selectAll("rect")
		.data(dataset)
		.enter()
		.append("rect")
		.attr("x", (d) => {
			return size * +d.col - size + 0.25;
		})
		.attr("y", (d) => {
			return height - (size * +d.row) - size/2;
		})
		.attr("width", (d) => {
			return d.district == "8" || d.district == "34" ? null
				: d.position == "Comptroller" ? 2 * size - 0.5
				: d.position == "Mayor" ? 3 * size - 0.5
				: size - 0.5;
		})
		.attr("height", (d) => {
			return d.district == "8" || d.district == "34" ? null
				: d.position == "Comptroller" ? 2 * size - 0.5
				: d.position == "Mayor" ? 3 * size - 0.5
				: size - 0.5;
		})
		.attr("fill", (d) => {
			return d.borough == "Staten Island" ? "#ef9b50"
				: d.borough == "Brooklyn" ? "#dd4599"
				: d.borough == "Manhattan" ? "#42bfac"
				: d.borough == "Queens" ? "#a7d15c"
				: d.borough == "Bronx" ? "#447dae"
				: "#606060";
		})
		.attr("stroke", (d) => {
			return d.borough == "Staten Island" ? "#ef9b50"
				: d.borough == "Brooklyn" ? "#dd4599"
				: d.borough == "Manhattan" ? "#42bfac"
				: d.borough == "Queens" ? "#a7d15c"
				: d.borough == "Bronx" ? "#447dae"
				: "#606060";
		})
		.attr("stroke-width", "0.5")
		.on("mouseover", function (d, i) {
			d3.select(this).transition()
				.duration("50")
				.attr("stroke", "#000")
				.attr("z-index", "2");
			// div.html((d) => d.district + d.member + d.neighborhoods + d.term);
		})
		// .on("mousemove", function (e) {
		// 	div.style("top", e.pageY - 48 + "px")
		// 		.style("left", e.pageX + "px");
		// })
		.on('mouseout', function () {
			d3.select(this).transition()
				.duration('50')
				.attr("stroke", (d) => {
					return d.borough == "Staten Island" ? "#ef9b50"
						: d.borough == "Brooklyn" ? "#dd4599"
						: d.borough == "Manhattan" ? "#42bfac"
						: d.borough == "Queens" ? "#a7d15c"
						: d.borough == "Bronx" ? "#447dae"
						: "#606060";
				})
		// 	div.style("display", "none");
		});

	// split seats
	const seatsSplit = svg.append("g")
		.selectAll("path")
		.data(dataset)
		.enter()
		.append("path")
		.attr("d", (d) => {
			const triangleBottomLeft = "M " + (size * +d.col - size + 0.25) + " " + (height - (size * +d.row) - size/2 + 0.5) + " L " + (size * +d.col - size + 0.25) + " " + (height - (size * +d.row) + size/2 - 0.5) + " L " + (size * +d.col - 0.75) + " " + (height - (size * +d.row) + size/2 - 0.5) + " L " + (size * +d.col - size + 0.25) + " " + (height - (size * +d.row) - size/2 + 0.5);
			const triangleTopRight = "M " + (size * +d.col - size + 0.5) + " " + (height - (size * +d.row) - size/2) + " L " + (size * +d.col - 0.25) + " " + (height - (size * +d.row) - size/2) + " L " + (size * +d.col - 0.25) + " " + (height - (size * +d.row) + size/2 - 0.75) + " L " + (size * +d.col - size + 0.5) + " " + (height - (size * +d.row) - size/2);
			return (d.district == "8" && d.borough == "Manhattan") ? triangleBottomLeft
				: (d.district == "8" && d.borough == "Bronx") ? triangleTopRight
				: (d.district == "34" && d.borough == "Brooklyn") ? triangleBottomLeft
				: (d.district == "34" && d.borough == "Queens") ? triangleTopRight
				: null;
		})
		.attr("fill", (d) => {
			return d.borough == "Brooklyn" ? "#dd4599"
				: d.borough == "Manhattan" ? "#42bfac"
				: d.borough == "Queens" ? "#a7d15c"
				: d.borough == "Bronx" ? "#447dae"
				: "#606060";
		})
		.attr("stroke", (d) => {
			return d.borough == "Staten Island" ? "#ef9b50"
				: d.borough == "Brooklyn" ? "#dd4599"
				: d.borough == "Manhattan" ? "#42bfac"
				: d.borough == "Queens" ? "#a7d15c"
				: d.borough == "Bronx" ? "#447dae"
				: "#606060";
		})
		.attr("stroke-width", "0.5")
		.on("mouseover", function (d, i) {
			d3.select(this).transition()
				.duration("50")
				.attr("stroke", "#000")
				.attr("z-index", "2");
			// div.html((d) => d.district + d.member + d.neighborhoods + d.term);
		})
		// .on("mousemove", function (e) {
		// 	div.style("top", e.pageY - 48 + "px")
		// 		.style("left", e.pageX + "px");
		// })
		.on('mouseout', function () {
			d3.select(this).transition()
				.duration('50')
				.attr("stroke", (d) => {
					return d.borough == "Staten Island" ? "#ef9b50"
						: d.borough == "Brooklyn" ? "#dd4599"
						: d.borough == "Manhattan" ? "#42bfac"
						: d.borough == "Queens" ? "#a7d15c"
						: d.borough == "Bronx" ? "#447dae"
						: "#606060";
				})
		// 	div.style("display", "none");
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
	.attr("z-index", "5")
	.selectAll("line")
	.data(gridVertical)
	.enter()
	.append("line")
	.attr("x1", (d) => d.x1)
	.attr("x2", (d) => d.x2)
	.attr("y1", (d) => d.y1)
	.attr("y2", (d) => d.y2)
	.attr("stroke", "#ccc")
	.attr("stroke-width", "0.25");

const plusGridHorizontal = svg.append("g")
	.attr("z-index", "5")
	.selectAll("line")
	.data(gridHorizontal)
	.enter()
	.append("line")
	.attr("x1", (d) => d.x1)
	.attr("x2", (d) => d.x2)
	.attr("y1", (d) => d.y1)
	.attr("y2", (d) => d.y2)
	.attr("stroke", "#ccc")
	.attr("stroke-width", "0.25");

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
})