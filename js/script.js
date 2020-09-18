$(document).ready(function() {
	$(window).on('scroll', function() {
		var scrollTop = $(window).scrollTop(),
			docHeight = $(document).height(),
			winHeight = $(window).innerHeight()
	})

	$("#project-description").hide();
	$("#project-title").on('mouseenter', function() {
		$('#project-description').show();
	});
	$("#project-title").on('mouseleave', function() {
		$('#project-description').hide();
	})
})