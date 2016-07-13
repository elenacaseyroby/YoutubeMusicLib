$(function(){
	$( ".datepicker" ).datepicker();

	$("#updatelistens").on("submit", function(event) {
		event.preventDefault();
		index = 15;

		$.each($(".row"), function(index, listen){

			console.log("~~~~~~~~~~ POST !~~~~~~~~~~~~~")
			if($("#library").is(':checked')){
				library_value = 1
			}else{
				library_value = 0;
			}
			if($("#music").is(':checked')){
				music_value = 1
			}else{
				music_value = 0;
			}
			console.log("youtube id val~~~~~~~~~~~~~~~");
			console.log($("#youtube_id"));
			$.ajax({
				type: "POST",
			    url: '/updatelistens',
			    data: {youtube_id: $("#youtube_id").attr("value")
			    , play: $("#play").is(':checked') //returns true or false
			    , library: library_value
			    , music: music_value
			    , title: $("#title").val()
			    , artist: $("#artist").val()
			    , album: $("#album").val()
			    , track_num: $("#track_num").val()
				, release_date: $("#release_date").val()
				, artist_id: $("#artist_id").attr("value")
				, album_id: $("#album_id").attr("value")}
		    });
		});
	});
		
});
