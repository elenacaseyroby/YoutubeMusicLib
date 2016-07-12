$(function(){
	$( ".datepicker" ).datepicker();
	$("#updatelistens").on("submit", function(event) {
		event.preventDefault();
		index = 15;
		
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
		});
	});
		
});
