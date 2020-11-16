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

	$("#project-description").hide();
	$("#project-title").on('mouseenter', function() {
		$('#project-description').show();
	});
	$("#project-title").on('mouseleave', function() {
		$('#project-description').hide();
	});
	$("#project-title").on('touchstart', function () {
		$('#project-description').toggle();
	});

	$("#h-description").hide();
	$("#project-title").on('mouseenter', function() {
		$('#h-description').show();
	});
	$("#project-title").on('mouseleave', function() {
		$('#h-description').hide();
	});
	$("#project-title").on('touchstart', function () {
		$('#h-description').toggle();
	});
	
	$("#arrow-expand").click(function () {
		$("#hidden-disc").slideToggle();
		$("#arrow-expand").toggleClass('arrow-up');
	});
	// $("#project-description").hide();
	// $("#project-title").on('touchstart', function () {
	// 	$('#project-description').toggle();
	// });
	// $("#h-description").hide();
	// $("#project-title").on('mouseenter mouseout touchstart', function () {
	// 	$('#h-description').toggle();
	// });

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
    document.body.classList.add("noscroll");
};

function exitCarousel() {
    document.getElementById("iframe-carousel").classList.add("closed");
    document.body.classList.remove("noscroll");
    $(".closed").remove();
}