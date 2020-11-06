'use strict'

mapboxgl.accessToken = 'pk.eyJ1IjoibWl0Y2l2aWNkYXRhIiwiYSI6ImNpbDQ0aGR0djN3MGl1bWtzaDZrajdzb28ifQ.quOF41LsLB5FdjnGLwbrrg'

var map = new mapboxgl.Map({
	container: 'map',
	style: 'mapbox://styles/mitcivicdata/ckgskwfac1f9h19pcq355csox', // stylesheet location
	// style: {
	// 	'version': 8,
	// 	'sources': {
	// 		'raster-tiles': {
	// 			'type': 'raster',
	// 			'tiles': ['http://tile.stamen.com/toner-lite/{z}/{x}/{y}.png'],
	// 			'tileSize': 256,
	// 			'attribution': 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.'
	// 		}
	// 	},
	// 	'layers': [
	// 		{
	// 			'id': 'simple-tiles',
	// 			'type': 'raster',
	// 			'source': 'raster-tiles',
	// 			'minzoom': ,
	// 			'maxzoom': 22
	// 		}
	// 	]
	// }, // stamen toner lite
	center: [-73.963158, 40.722414], // starting position [lng, lat]
	zoom: 12.6 // starting zoom
});


// zoom nav buttons
let navigation = new mapboxgl.NavigationControl({
	showCompass: false
})
map.addControl(navigation, 'top-right');

// disable map rotation using right click + drag
map.dragRotate.disable();
 
// disable map rotation using touch rotation gesture
map.touchZoomRotate.disableRotation();

// toggle layers
var toggleableLayerIds = ['fwd0005', 'fwd0611', 'fwd1217', 'fwd1823', 'fwe0005', 'fwe0611', 'fwe1217', 'fwe1823', 'mwd0005', 'mwd0611', 'mwd1217', 'mwd1823', 'mwe0005', 'mwe0611', 'mwe1217', 'mwe1823'];

var currentDay = "wd";
var currentTime = "0611";
var currentMonths = ["f", "m"];
var currentLayer = currentDay + currentTime;
var currentLayers = currentMonths.map(value => value + currentDay + currentTime);

// click popup tooltip
function streetActivityScale(score, attr) {
	if (attr == "color") {
		return (score < 0) ? "#004ca8"
		: (0 < score) ? "#ff00e6"
		: "#8c8c8c";	
	}
	else if (attr == "sign") {
		return (score > 0) ? "+" + score
		: score;
	}
	else if (attr == "word") {
		return (score > 0) ? "increase"
		: (score < 0) ? "decrease"
		: "";
	}
}

// function roundAccurately(number, decimalPlaces) {
// 	return Number(Math.round(number + "e" + decimalPlaces) + "e-" + decimalPlaces);	
// }
var popup = new mapboxgl.Popup({
	offset: [0, 0],
	closeButton: false
});

function titleCase(string) {
	string = string.toLowerCase();
	string = string.split(' ');
	for (var i = 0; i < string.length; i++) {
		string[i] = string[i].charAt(0).toUpperCase() + string[i].slice(1);
	}
	return string.join(' ');
}

function showPopup(e, feature, currentLayer) {
	if (currentLayer.startsWith("wd")) {
		var labelDay = "Weekday";
		var changeDay = "wd"
	}
	else if (currentLayer.startsWith("we")) {
		var labelDay = "Weekend";
		var changeDay = "we"
	};

	if (currentLayer.endsWith("0005")) {
		var labelTime = "0:00&ndash;5:59";
		var changeTime = "05";
	}
	else if (currentLayer.endsWith("0611")) {
		var labelTime = "6:00&ndash;11:59";
		var changeTime = "611";
	}
	else if (currentLayer.endsWith("1217")) {
		var labelTime = "12:00&ndash;17:59";
		var changeTime = "1217";
	}
	else if (currentLayer.endsWith("1823")) {
		var labelTime = "18:00&ndash;23:59";
		var changeTime = "1823";
	}

	var changePercent = "C_" + changeDay + "__" + changeTime;
	var countBefore = "F" + currentLayer.toUpperCase();
	var countDuring = "M" + currentLayer.toUpperCase();
	var streetActivityPercentChange = Math.round(feature.properties[changePercent]);
	var streetActivityBefore = Math.round(feature.properties[countBefore]*100/6);
	var streetActivityDuring = Math.round(feature.properties[countDuring]*100/6);
	var streetActivityChange = streetActivityDuring - streetActivityBefore;

	popup.setLngLat(e.lngLat)
		.setHTML("<div class='labelplacedate'><h3 class='labelstreet'>" + titleCase(feature.properties.Street_1) + "</h3><p>Street Activity</p><p>Hourly Average " + labelDay + " " + labelTime + "</p></div><div class='labelchange' style='color:" + streetActivityScale(streetActivityPercentChange, "color") + ";'><div class='labelscore'><span class='data1'>" + streetActivityScale(streetActivityPercentChange, "sign") + "%</span><span class='labeldecinc'>" + streetActivityScale(streetActivityPercentChange, "word") + "</span></div><p class='labelfoottraffic'>Under March&ndash;April Pandemic Lockdown</p></div>")
		.addTo(map);
}

// show popup on click
map.on('click', function(e) {
	var features = map.queryRenderedFeatures(e.point, {
		layers: ['streets-buffer']
	});

	if (!features.length) {
		return;
	}

	var feature = features[0];

	showPopup(e, feature, currentLayer);
});

// show popup on load
map.on('load', function() {
	var e = {lngLat: [-73.99132813368308, 40.73226835322123]};
	var feature = {
		properties: {
			Street_1: 'Broadway',
			C_wd__611: -97.1428571429
		}
	};

	showPopup(e, feature, currentLayer);
});

function showCurrentLayers(e, clickedLayers) {
	e.preventDefault();
	e.stopPropagation();

	var clickedLayers = toggleableLayerIds.filter(item => clickedLayers.includes(item));

	for (var i = 0; i < toggleableLayerIds.length; i++) {
		if (clickedLayers.includes(toggleableLayerIds[i])) {
			map.setLayoutProperty(toggleableLayerIds[i], 'visibility', 'visible');
		}
		else {
			map.setLayoutProperty(toggleableLayerIds[i], 'visibility', 'none');
		}
	}
};

// visibility on document load 
$(document).ready(function() {
	$("#day-wd").addClass("selectedday");
	$("#time-0611").addClass("selectedtime");
	$("#month-feb, #month-mar").addClass("selectedmonth");
});

// toggle by weekday or weekend
$(".day-toggle").on("click", function(e) {
	if (!$(this).hasClass("selectedday")) {
		$(".selectedday").removeClass("selectedday").css("background", "#d1d3d4").css("border-color", "#d1d3d4").css("color", "#333");
		$(this).addClass("selectedday").css("background", "#fff").css("border-color", "#000").css("color", "#000");

		if ($(this).attr("id") == "day-wd") {
			$("#day-label").html("weekday");
		}
		else if ($(this).attr("id") == "day-we") {
			$("#day-label").html("weekend");
		}
	}
	var clickedDay = $(this).attr("id").substring(4);
	var clickedLayer = clickedDay + currentTime;
	var clickedLayers = currentMonths.map(value => value + clickedDay + currentTime);

	if (clickedDay !== currentDay) {
		showCurrentLayers(e, clickedLayers);
		popup.remove();

		currentDay = clickedDay;
		currentLayer = clickedDay + currentTime;
		currentLayers = clickedLayers;
	}
});
$(".day-toggle").on("mouseover", function() {
	if ($(this).hasClass("selectedday")) {
		$(this).css("background", "#fff").css("border-color", "#000").css("color", "#000");
	}
	else {
		$(this).css("background", "#8c8c8c").css("border-color", "#8c8c8c").css("color", "#000");
	}
});
$(".day-toggle").on("mouseleave", function() {
	if ($(this).hasClass("selectedday")) {
		$(this).css("background", "#fff").css("border-color", "#000").css("color", "#000");
	}
	else {
		$(this).css("background", "#d1d3d4").css("border-color", "#d1d3d4").css("color", "#333");
	}
});

// toggle by time
$(".time-toggle").on("click", function(e) {
	if (!$(this).hasClass("selectedtime")) {
		$(".selectedtime").find("h4").hide();
		$(".selectedtime").removeClass("selectedtime").css("background", "#d1d3d4").css("border-color", "#d1d3d4");
		$(this).addClass("selectedtime").css("background", "#fff").css("border-color", "#000");
		$(this).find("h4").show();	
	}
	var clickedTime = $(this).attr("id").substring(5);
	var clickedLayer = currentDay + clickedTime;
	var clickedLayers = currentMonths.map(value => value + currentDay + clickedTime);

	if (clickedTime !== currentTime) {
		showCurrentLayers(e, clickedLayers);
		popup.remove();

		currentTime = clickedTime;
		currentLayer = currentDay + clickedTime;
		currentLayers = clickedLayers;
	}
});
$(".time-toggle").on("mouseover", function() {
	if (!$(this).hasClass("selectedtime")) {
		$(this).css("background", "#8c8c8c").css("border-color", "#8c8c8c");
	}
});
$(".time-toggle").on("mouseleave", function() {
	if (!$(this).hasClass("selectedtime")) {
		$(this).css("background", "#d1d3d4").css("border-color", "#d1d3d4");
	}
});

// toggle by before lockdown or during lockdown
$(".month-toggle").on("click", function(e) {
	if ($("#month-feb").hasClass("selectedmonth") && $("#month-mar").hasClass("selectedmonth")) {
		$(this).removeClass("selectedmonth").css("background", "#8c8c8c").css("border-color", "8c8c8c").css("color", "#333");
	}
	else if (!$(this).hasClass("selectedmonth")) {
		$(this).addClass("selectedmonth").css("background", "#fff").css("border-color", "#000").css("color", "#000");
	}
	var thisMonth = $(this).attr("id").substring(6,7);
	if (currentMonths.length == 2) {
		var clickedMonths = currentMonths.filter(item => item != thisMonth);
	}
	else if (!currentMonths.includes(thisMonth)) {
		var clickedMonths = ["f", "m"];
	}
	else {
		var clickedMonths = currentMonths;
	}

	var clickedLayers = clickedMonths.map(value => value + currentDay + currentTime);
	showCurrentLayers(e, clickedLayers);

	currentMonths = clickedMonths;
	currentLayers = clickedLayers;
});
$(".month-toggle").on("mouseover", function() {
	if ($(this).hasClass("selectedmonth")) {
		$(this).css("background", "#aaa");
	}
	else {
		$(this).css("background", "#8c8c8c").css("border-color", "#8c8c8c");
	}
});
$(".month-toggle").on("mouseleave", function() {
	if ($(this).hasClass("selectedmonth")) {
		$(this).css("background", "#fff");
	}
	else {
		$(this).css("background", "#d1d3d4").css("border-color", "#d1d3d4").css("color", "#333");
	}
});