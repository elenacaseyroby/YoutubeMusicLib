$(function(){
	$( ".datepicker" ).datepicker();

	$("#updatelistens").on("submit", function(event) {
		event.preventDefault();
		index = 15;

		i = 0;
		console.log("num rows");
		console.log($("#numrows").attr("value"));
		//while (i <= $("#numrows").attr("value")){
		$.each($(".row"), function(index, listen){

			console.log("~~~~~~~~~~ POST !~~~~~~~~~~~~~")
			if($("#library" + i.toString()).is(':checked')){
				library_value = 1
			}else{
				library_value = 0;
			}
			if($("#music" + i.toString()).is(':checked')){
				music_value = 1
			}else{
				music_value = 0;
			}
			console.log($("#youtube_id" + i).attr("value")); //this is right!
			$.ajax({
				type: "POST",
			    url: '/updatelistens',
			    data: {youtube_id: $("#youtube_id" + i.toString()).attr("value")
			    , play: $("#play" + i.toString()).is(':checked') //returns true or false
			    , library: library_value
			    , music: music_value
			    , title: $("#title" + i.toString()).val()
			    , artist: $("#artist" + i.toString()).val()
			    , album: $("#album" + i.toString()).val()
			    , track_num: $("#track_num" + i.toString()).val()
				, release_date: $("#release_date" + i.toString()).val()
				, artist_id: $("#artist_id" + i.toString()).attr("value")
				, album_id: $("#album_id" + i.toString()).attr("value")}
		    });
		    i++;
		//}
		});
	});
		
});

//http://stackoverflow.com/questions/5891840/how-to-use-javascript-variables-in-jquery-selectors