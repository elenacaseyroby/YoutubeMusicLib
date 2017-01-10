$(".scrolling-dropdown").click(function(){

	//figure out why it isn't working
	console.log("hi!!");
	$.each($(".scrolling-dropdown option"), function(index, option){
		console.log(option);
	});
});