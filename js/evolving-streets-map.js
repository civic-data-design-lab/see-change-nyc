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
function activeLayer(clickedButton) {

}

var toggleableLayerIds = ['weekday-0005', 'weekday-0611', 'weekday-1217', 'weekday-1823', 'weekend-0005', 'weekend-0611', 'weekend-1217', 'weekend-1823'];

for (var i = 0; i < toggleableLayerIds.length; i++) {
	var id = toggleableLayerIds[i];

	var link = document.createElement('a');
	link.href = '#';
	// link.className = 'active';
	link.textContent = id;
	if (toggleableLayerIds[i] == 'weekday-0611') {
		link.className = 'active';
	} else {
		link.className = '';
	}

	link.onclick = function (e) {
		var clickedLayer = this.textContent;
		e.preventDefault();
		e.stopPropagation();

		var visibility = map.getLayoutProperty(clickedLayer, 'visibility');

		// if (visibility !== 'visible') {
		// 	var hiddenLayers = toggleableLayerIds.filter(item => item !== clickedLayer);
		// 	for (var i; i < hiddenLayers.length; i++) {
		// 		map.setLayoutProperty(hiddenLayers[i], 'visibility', 'none');
		// 		link.find(hiddenLayers[i]).className = '';
		// 	};
		// 	this.className = 'active';
		// 	map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
		// }
		if (visibility === 'visible') {
			map.setLayoutProperty(clickedLayer, 'visibility', 'none');
			this.className = 'layer-toggle';
		} else {
			this.className = 'layer-toggle active';
			map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
		}
	};
 
	var layers = document.getElementById('menu');
	layers.appendChild(link);
};

// click popup tooltip
function footTrafficScale(score) {
	return (score < -100) ? "#2f3e91"
	: (-100 <= score && score < -75) ? "#3e52c1"
	: (-75 <= score && score < -50) ? "#6575cd"
	: (-50 <= score && score < -25) ? "#8b97da"
	: (-25 <= score && score < 0) ? "#b2bae6"
	: (score == 0) ? "#8c8c8c"
	: (0 < score && score <= 25) ? "#ffcba3"
	: (25 < score && score <= 50) ? "#ffb076"
	: (50 < score && score <= 75) ? "#ff9648"
	: (75 < score && score <= 100) ? "#ff7c1a"
	: (100 < score && score <= 200) ? "#bf5d14"
	: (200 < score) ? "#803e0d"
	: "#8c8c8c";
}

function roundAccurately(number, decimalPlaces) {
	return Number(Math.round(number + "e" + decimalPlaces) + "e-" + decimalPlaces);	
}

function showPopup(e, feature) {
	if (feature.properties.HVI == 0) {
		return ;
	}

	var popup = new mapboxgl.Popup({
		offset: [0, 0],
		closeButton: false
	})
		.setLngLat(e.lngLat)
		.setHTML("<h3 class='labelstreet'>" + feature.properties.Street + "</h3><div class='labelchange' style='color:" + footTrafficScale(feature.properties.C_wd__611) + ";'><span class='data1'>" + Math.round(feature.properties.C_wd__611) + "%</span><p class='labelfoottraffic'>Foot Traffic Change During Lockdown (%)</p></div><div class='labelavg'><span>" + roundAccurately(feature.properties.F_wd_6_11, 2) + "</span><p>Weekday average count before lockdown</p></div><div class='labelavg'><span>" + roundAccurately(feature.properties.M_wd_6_11, 2) + "</span><p>Weekday average count during lockdown</p></div><div class='labelavgchange'><span>" + roundAccurately(feature.properties.AC_wd_611, 2) + "</span><p>Weekday average change</p></div>")
		.addTo(map);
}

map.on('click', function(e) {
	var features = map.queryRenderedFeatures(e.point, {
		layers: ['weekday-0005', 'weekday-0611', 'weekday-1217', 'weekday-1823', 'weekend-0005', 'weekend-0611', 'weekend-1217', 'weekend-1823']
	});

	if (!features.length) {
		return;
	}

	var feature = features[0];

	showPopup(e, feature);
});

// map.on('load', function() {
// 	var e = {lngLat: [-73.94020996898772, 40.79491737652384]}
// 	var feature = {
// 		properties: {
// 			cdName: 'East Harlem',
// 			borough: 'Manhattan',
// 			HVI: 4,
// 			ac_sc: 4,
// 			temp_sc: 2,
// 			poverty_sc: 5,
// 			veg_sc: 4,
// 			black_sc: 4
// 		}
// 	};

// 	showPopup(e, feature);
// });

// visibility on document load 
$(document).ready(function() {
	$("#weekday").addClass("selectedday");
	$("#time-06").addClass("selectedtime");
});

// toggle by weekday or weekend
$(".day-toggle").on("click", function() {
	if (!$(this).hasClass("selectedday")) {
		$(".selectedday").removeClass("selectedday").css("background", "#fff").css("color", "#000");
		$(this).addClass("selectedday");	
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
$(".time-toggle").on("click", function() {
	if (!$(this).hasClass("selectedtime")) {
		$(".selectedtime").find("h4").hide();
		$(".selectedtime").removeClass("selectedtime").css("background", "#ccc").css("border-color", "#ccc");
		$(this).addClass("selectedtime").css("background", "#8c8c8c").css("border-color", "#000");
		$(this).find("h4").show();	
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