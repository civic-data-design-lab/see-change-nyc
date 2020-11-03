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

// toggle layers
var toggleableLayerIds = ['fwd0005', 'fwd0611', 'fwd1217', 'fwd1823', 'fwe0005', 'fwe0611', 'fwe1217', 'fwe1823', 'mwd0005', 'mwd0611', 'mwd1217', 'mwd1823', 'mwe0005', 'mwe0611', 'mwe1217', 'mwe1823'];

var currentDay = "wd";
var currentTime = "0611";
var currentLayer = currentDay + currentTime;

// for (var i = 0; i < toggleableLayerIds.length; i++) {
// 	var id = toggleableLayerIds[i];

// 	var link = document.createElement('a');
// 	link.href = '#';
// 	// link.className = 'active';
// 	link.textContent = id;
// 	if (toggleableLayerIds[i].endsWith('wd0611')) {
// 		link.className = 'active';
// 	} else {
// 		link.className = '';
// 	}

// 	link.onclick = function (e) {
// 		var clickedLayer = this.textContent;
// 		e.preventDefault();
// 		e.stopPropagation();

// 		var visibility = map.getLayoutProperty(clickedLayer, 'visibility');

// 		if (visibility === 'visible') {
// 			map.setLayoutProperty(clickedLayer, 'visibility', 'none');
// 			this.className = 'layer-toggle';
// 		} else {
// 			this.className = 'layer-toggle active';
// 			map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
// 		}
// 	};

// 	var layers = document.getElementById('menu');
// 	layers.appendChild(link);
// };

// click popup tooltip
function footTrafficScale(score) {
	return (score < 0) ? "#004ca8"
	: (0 < score) ? "#ff00c3"
	: "#8c8c8c";
}

// function roundAccurately(number, decimalPlaces) {
// 	return Number(Math.round(number + "e" + decimalPlaces) + "e-" + decimalPlaces);	
// }

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
	var beforeLockdown = "F" + currentLayer.toUpperCase();
	var duringLockdown = "M" + currentLayer.toUpperCase();

	var popup = new mapboxgl.Popup({
		offset: [0, 0],
		closeButton: false
	})
		.setLngLat(e.lngLat)
		.setHTML("<h3 class='labelstreet'>" + feature.properties.Street_1 + "</h3><span class='labelday'>" + labelDay + "</span><span class='labeltime'>" + labelTime + "</span><div class='labelchange' style='color:" + footTrafficScale(feature.properties[changePercent]) + ";'><span class='data1'>" + Math.round(feature.properties[changePercent]) + "%</span><p class='labelfoottraffic'>Foot Traffic Change During Lockdown (%)</p></div><div class='labelavg'><span>" + feature.properties[beforeLockdown] + "</span><p>Hourly Average Foot Traffic Before Lockdown</p></div><div class='labelavg'><span>" + feature.properties[duringLockdown] + "</span><p>Hourly Average Foot Traffic During Lockdown</p></div><div class='labelavgchange'><span>" + (feature.properties[duringLockdown] - feature.properties[beforeLockdown]) + "</span><p>Change in Hourly Average Foot Traffic</p></div>")
		.addTo(map);
}

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

// map.on('load', function() {
// 	var e = {lngLat: [-73.94020996898772, 40.79491737652384]}
// 	var feature = {
// 		properties: {
// 			Street_1: 'East Harlem',
// 			HVI: 4,
// 			ac_sc: 4,
// 			temp_sc: 2,
// 			poverty_sc: 5,
// 			veg_sc: 4,
// 			black_sc: 4
// 		}
// 	};

// 	showPopup(e, feature, currentLayer);
// });

function showCurrentLayer(e, clickedLayer) {
	e.preventDefault();
	e.stopPropagation();

	var hiddenLayers = toggleableLayerIds.filter(item => item.endsWith(clickedLayer) == false);
	var clickedLayerFeb = "f" + clickedLayer;
	var clickedLayerMar = "m" + clickedLayer;

	for (var i = 0; i < hiddenLayers.length; i++) {
		map.setLayoutProperty(hiddenLayers[i], 'visibility', 'none');
	};
	
	map.setLayoutProperty(clickedLayerFeb, 'visibility', 'visible');
	map.setLayoutProperty(clickedLayerMar, 'visibility', 'visible');
};

// visibility on document load 
$(document).ready(function() {
	$("#day-wd").addClass("selectedday");
	$("#time-0611").addClass("selectedtime");
	$("#month-feb, #month-mar").addClass("selectedmonth");
});

// toggle by month - feb or mar
$(".month-toggle").on("click", function(e) {
	if ($(this).hasClass("selectedmonth")) {
		$(this).removeClass("selectedmonth").css("background", "#fff").css("color", "#000");
	}
	else {
		$(this).addClass("selectedmonth").css("background", "#000").css("color", "#fff");
	}
	// var clickedDay = $(this).attr("id").substring(4);
	// var clickedLayer = clickedDay + currentTime;

	// if (clickedDay !== currentDay) {
	// 	showCurrentLayer(e, clickedLayer);

	// 	currentDay = clickedDay;
	// 	currentLayer = clickedLayer;
	// }
});
$(".month-toggle").on("mouseover", function() {
	if ($(this).hasClass("selectedmonth")) {
		$(this).css("background", "#fff").css("color", "#000");
	}
	else {
		$(this).css("background", "#000").css("color", "#fff");
	}
});
$(".month-toggle").on("mouseleave", function() {
	if ($(this).hasClass("selectedmonth")) {
		$(this).css("background", "#000").css("color", "#fff");
	}
	else {
		$(this).css("background", "#fff").css("color", "#000");
	}
});

// toggle by weekday or weekend
$(".day-toggle").on("click", function(e) {
	if (!$(this).hasClass("selectedday")) {
		$(".selectedday").removeClass("selectedday").css("background", "#fff").css("color", "#000");
		$(this).addClass("selectedday");
	}
	var clickedDay = $(this).attr("id").substring(4);
	var clickedLayer = clickedDay + currentTime;

	if (clickedDay !== currentDay) {
		showCurrentLayer(e, clickedLayer);

		currentDay = clickedDay;
		currentLayer = clickedLayer;
	}
});
$(".day-toggle").on("mouseover", function() {
	if ($(this).hasClass("selectedday")) {
		$(this).css("background", "#fff").css("color", "#000");
	}
	else {
		$(this).css("background", "#000").css("color", "#fff");
	}
});
$(".day-toggle").on("mouseleave", function() {
	if ($(this).hasClass("selectedday")) {
		$(this).css("background", "#000").css("color", "#fff");
	}
	else {
		$(this).css("background", "#fff").css("color", "#000");
	}
});

// toggle by time
$(".time-toggle").on("click", function(e) {
	if (!$(this).hasClass("selectedtime")) {
		$(".selectedtime").find("h4").hide();
		$(".selectedtime").removeClass("selectedtime").css("background", "#ccc").css("border-color", "#ccc");
		$(this).addClass("selectedtime").css("background", "#8c8c8c").css("border-color", "#000");
		$(this).find("h4").show();	
	}
	var clickedTime = $(this).attr("id").substring(5);
	var clickedLayer = currentDay + clickedTime;

	if (clickedTime !== currentTime) {
		showCurrentLayer(e, clickedLayer);

		currentTime = clickedTime;
		currentLayer = clickedLayer;
		console.log("new current layer: " + currentLayer);
	}
});
$(".time-toggle").on("mouseover", function() {
	if (!$(this).hasClass("selectedtime")) {
		$(this).css("background", "#8c8c8c").css("border-color", "#8c8c8c");
		// $(this).find("h4").css("color", "#8c8c8c").show();
	}
});
$(".time-toggle").on("mouseleave", function() {
	if (!$(this).hasClass("selectedtime")) {
		$(this).css("background", "#ccc").css("border-color", "#ccc");
		// $(this).find("h4").css("color", "#000").hide();
	}
});