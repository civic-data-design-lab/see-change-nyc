'use strict'

mapboxgl.accessToken = 'pk.eyJ1IjoibWl0Y2l2aWNkYXRhIiwiYSI6ImNpbDQ0aGR0djN3MGl1bWtzaDZrajdzb28ifQ.quOF41LsLB5FdjnGLwbrrg'

var map = new mapboxgl.Map({
	container: 'map',
	style: 'mapbox://styles/mitcivicdata/ckgbfhxsi3si519peigfsg5nh', // stylesheet location
	center: [-73.927346, 40.765714], // starting position [lng, lat]
	zoom: 11.6 // starting zoom
});

// zoom nav buttons
let navigation = new mapboxgl.NavigationControl({
	showCompass: false
})
map.addControl(navigation, 'top-right');

// zoom nav buttons and ctrl+scroll
// $("#map").bind('mousewheel DOMMouseScroll', function(event) 
// {
// 	if(event.ctrlKey == true) {
// 		map.scrollZoom.enable();
// 	}
// 	else {
// 		map.scrollZoom.disable();
// 		// $("#map").append("div")
// 	}
// });

// disable map rotation using right click + drag
map.dragRotate.disable();
 
// disable map rotation using touch rotation gesture
map.touchZoomRotate.disableRotation();

// click popup tooltip
function showPopup(feature) {
	var popup = new mapboxgl.Popup({
		offset: [0, 0],
		closeButton: false
	})
		.setLngLat(feature.geometry.coordinates)
		.setHTML("<div class='labelplace'><p class='labelpuma'>" + feature.properties.PUMAname + "</p><p class='labelborough'>" + feature.properties.borough + "</p><img class='circleborough' src='./img/rent-burden/hh-area-" + feature.properties.borough.toLowerCase() + ".svg'></div><div class='labelburdenpercent'><span class='data1'>" + Math.round(feature.properties.RB_perc + feature.properties.vRB_perc) + "%</span><p>of households are considered rent burdened</p></div><div class='labelburden'><div id='legend-nrb' class='circle'></div>&ensp;<span class='data3'>" + Math.round(feature.properties.nRB_perc) + "%</span><p>Not Rent Burdened</p></div><div class='labelburden'><div id='legend-rb' class='circle'></div>&ensp;<span class='data3'>" + Math.round(feature.properties.RB_perc) + "%</span><p>Rent Burdened</p></div><div class='labelburden'><div id='legend-srb' class='circle'></div>&ensp;<span class='data3'>" + Math.round(feature.properties.vRB_perc) + "%</span><p>Severely Rent Burdened</p></div>")
		.addTo(map);
}

map.on('click', function(e) {
	var features = map.queryRenderedFeatures(e.point, {
		layers: ['notRentBurdened', 'rentBurdened', 'severelyRentBurdened']
	});

	if (!features.length) {
		return;
	}

	var feature = features[0];

	showPopup(feature);
});

map.on('load', function() {
	var feature = {
		geometry: {
			coordinates: [-73.91688466072083, 40.80559129586592]},
		properties: {
			PUMAname: 'Hunts Point, Longwood & Melrose',
			borough: 'Bronx',
			nRB_perc: 43.7743,
			RB_perc: 25.0973,
			vRB_perc: 27.0428
		}
	};

	showPopup(feature);
});