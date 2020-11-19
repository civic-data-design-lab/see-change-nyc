// title case
function titleCase(string) {
	string = string.toLowerCase();
	string = string.split(' ');
	for (var i = 0; i < string.length; i++) {
		string[i] = string[i].charAt(0).toUpperCase() + string[i].slice(1);
	}
	return string.join(' ');
}

// round accurately function
function roundAccurately(number, decimalPlaces) {
	return Number(Math.round(number + "e" + decimalPlaces) + "e-" + decimalPlaces);	
};

// convert number to string with commas
function numberWithCommas(number) {
	return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// wrap multi-line text spans
function wrapText(text, width) {
	text.each(function() {
		var text = d3.select(this),
			words = text.text().split(/\s+/).reverse(),
			word,
			line = [],
			lineNumber = 0,
			lineHeight = 1.2,
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

$(document).ready(function() {
	winHeight = $(window).height();
	winWidth = $(window).width();
	carouselHeight = $("#carousel-inner-container").height();
	carouselWidth = $("#carousel-inner-container").width();

	$(window).on('scroll', function() {
		var scrollTop = $(window).scrollTop(),
			docHeight = $(document).height()
			// winHeight = $(window).innerHeight()
	})

	var touchmoved;

	$("#project-description").hide();
	$("#project-title").on('mouseenter', function() {
		$('#project-description').show();
	});
	$("#project-title").on('mouseleave', function() {
		$('#project-description').hide();
	});

	$("#project-title").on('touchend', function () {
		if (touchmoved != true) {
			$('#project-description').toggle();
		}
	}).on('touchmove', function () {
		touchmoved = true;
	}).on('touchend', function () {
		touchmoved = false;
	});

	$("#arrow-expand").on('click touchend', function (e) {
		e.stopPropagation(); e.preventDefault();
		$("#hidden-disc").slideToggle();
		$("#arrow-expand").toggleClass('arrow-up');
	});
})

// window resize
var winHeight = $(window).height();
var winWidth = $(window).width();

$(window).resize(function() {
	winHeight = $(window).height();
	winWidth = $(window).width();
});

// close iframe-carousel
window.onload = (event) => {
	if (document.getElementById("iframe-carousel")) {
		document.body.classList.add("noscroll");
	}
};

function exitCarousel() {
    document.getElementById("iframe-carousel").classList.add("closed");
    document.body.classList.remove("noscroll");
    $(".closed").remove();
}