// nav display on load
$(document).ready(function(){
	$("#nav>ul>li>ul>li").addClass("grey");
})

// nav borough filter display
function filterBoroughNav(boroughId) {
	$("#city").addClass("grey").css("color", "#aaa");
	$("#borough").removeClass("grey").css("color", "#000");

	$("#nav>ul>li>ul>li").addClass("grey").css("color", "#aaa");
	$("#" + boroughId).removeClass("grey").css("color", "#000");
	if (boroughId == "nyc") {
		$("#currentborough").html("&mdash;All");
	} else if (boroughId == "statenisland") {
		$("#currentborough").html("&mdash;Staten Island");
	}
	else {
		$("#currentborough").html("&mdash;" + boroughId);
	}
}

// nav clicks
$("#city").on("click", function() {
	$(this).removeClass("grey").css("color", "#000");
	$("#borough").addClass("grey").css("color", "#aaa");

	$("#nav>ul>li>ul>li").addClass("grey").css("color", "#aaa");
	$("#currentborough").html("");


});
$("#borough").on("click", function() {
	$(this).removeClass("grey").css("color", "#000");
	$("#city").addClass("grey").css("color", "#aaa");

	$("#nav>ul>li>ul>li").addClass("grey").css("color", "#aaa");
	$("#nyc").removeClass("grey").css("color", "#000");
	$("#currentborough").html("&mdash;All");

});
// nav click by filtering boroughs
$("#nav>ul>li>ul>li").on("click", function() {
	filterBoroughNav($(this).attr("id"));

	let chartBoroughClass = ".chart" + $(this).attr("id");
	$(chartBoroughClass).css("display", "block");
})