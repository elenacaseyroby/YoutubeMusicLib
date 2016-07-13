$(function(){
	$( ".datepicker" ).datepicker();/*
	$("#form").on("submit", function(event) {
		event.preventDefault();
		//index = 15; //fix later so it relates to limit of query
		
		$.each($(".row"), function(index, listen){
			console.log(listen);
			$.ajax({
				type: "POST",
			    url: '/updatelistens',
			    data: {youtube_id: $("#youtube_id")
			    , play: $("#play")
			    , library: $("#library")
			    , music: $("#music")
			    , youtube_title: $("#title")
			    , artist: $("#artist")
			    , album: $("#album")
			    , track_num: $("#track_num")
				, release_date: $("#release_date")
				, artist_id: $("#artist_id")
				, album_id: $("#album_id")}
		    });
		});*/
		

		
/* 
		var play 

		$.ajax({
			type: "POST",
		    url: '/postlistens',
		    data: {user_id: "1", youtube_title: title, youtube_id: youtube_id, listened_to_end: listened_to_end}
	    });
		$("#title").val()
	});	*/
});