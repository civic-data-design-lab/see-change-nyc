$(document).ready(function(){

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
			col: d.col,
			row: d.row,
			term: d.term,
			open: d.open
		};
	}, (error, data) => {
		console.log(data);

		const svg = d3.select("#open-seats-map")
			.append("svg")
			.attr("viewBox", [0, 0, width, height]);

		seatMap(svg, data);
	});

	const width = 130;
	const height = 145;

	// tooltip
	let div = d3.select("body").append("div")
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
				return 10 * +d.col - 10;
			})
			.attr("y", (d) => {
				return height -(10 * +d.row);
			})
			.attr("width", (d) => {
				return d.position == "Comptroller" ? 20
					: d.position == "Mayor" ? 30
					: 10;
			})
			.attr("height", (d) => {
				return d.position == "Comptroller" ? 20
					: d.position == "Mayor" ? 30
					: 10;
			})
			.attr("fill", (d) => {
				return d.borough == "Staten Island" ? "#ef9b50"
					: d.borough == "Brooklyn" ? "#dd4599"
					: d.borough == "Manhattan" ? "#42bfac"
					: d.borough == "Queens" ? "#a7d15c"
					: d.borough == "Bronx" ? "#447dae"
					: "#606060";
			})
			.on("mouseover", function (d, i) {
	        	d3.select(this).transition()
					.duration("50")
					.attr("border", "solid 1 #000");
				div.html((d) => d.district + d.member + d.neighborhoods + d.term);
			})
			.on("mousemove", function (e) {
				div.style("top", e.pageY - 48 + "px")
					.style("left", e.pageX + "px");
			})
			.on('mouseout', function () {
				d3.select(this).transition()
					.duration('50')
					.attr("border", "none");
				div.style("display", "none");
	      	});
	};

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

	// cartogram grid
	const cols = 13;
	const rows = 15.5;

	var plotWidth = $("#map-cartogram").width(),
		plotHeight = $("#map-cartogram").height(),
		size = Math.round(plotWidth/cols);

	console.log("size: " + size + "px")

	$(window).resize(function() {
		var plotWidth = $("#map-cartogram").width(),
			plotHeight = $("#map-cartogram").height(),
			size = Math.round(plotWidth/cols);

		console.log("size: " + size + "px")
	})

	// const gridMark = function(x ,y) {
	// 	this.x = x;
	// 	this.y = y;
	// 	this.size = 5;
	// };
	// gridMark.prototype.draw = function() {

	// };

	// const grid = [];

	// for (var x = 0; x < cols; x++) {
	// 	for (var y = 0; y < rows; y++) {
	// 		var gridX = x * 10;
	// 		var gridY = y * 10;
	// 		grid.push(new grid(gridX, gridY));
	// 	}
	// }
	
	
	// function gridData() {
	// 	var data = new Array();
	// 	var posX = 1;
	// 	var posY = 1;
	// 	var width = 50;
	// 	var height = 50;

	// 	for (var row = 0; row < 13; row++) {
	// 		data.push(new Array());
	// 		for (var col = 0; col < 13; col++) {
	// 			data[row].push({
	// 				x: posX,
	// 				y: posY,
	// 				width: width,
	// 				height: height
	// 			})
	// 			posX += width;
	// 		}
	// 		posX = 1;
	// 		posY += height;
	// 	}
	// 	return data;
	// }
})