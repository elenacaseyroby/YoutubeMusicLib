$(function(){
	$("#updatelistens").on("submit", function(event) {
		event.preventDefault();
		index = 100;
		i = 0;
		var dataupdated = false;

		$.each($(".row"), function(index, listen){
			var dataupdated = false;

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

			if($("#title" + i.toString()).attr("value") != $("#title" + i.toString()).val()){
				dataupdated = true;
			}
			if($("#artist" + i.toString()).attr("value") != $("#artist" + i.toString()).val()){
				dataupdated = true;
			}	
			if($("#album" + i.toString()).attr("value") != $("#album" + i.toString()).val()){
				dataupdated = true;
			}	
			if($("#music" + i.toString()).attr("value") != music_value){
				dataupdated = true;
			}	
			if($("#library" + i.toString()).attr("value") != library_value){
				dataupdated = true;
			}	

			if(dataupdated){
				$.ajax({
					type: "POST",
				    url: '/updatedata',
				    data: {youtube_id: $("#youtube_id" + i.toString()).attr("value")
				    //, play: $("#play" + i.toString()).is(':checked') //returns true or false
				    , library: library_value
				    , music: music_value
				    , title: $("#title" + i.toString()).val()
				    , artist: $("#artist" + i.toString()).val()
				    , album: $("#album" + i.toString()).val()
				    //, track_num: $("#track_num" + i.toString()).val()
					//, release_date: $("#release_date" + i.toString()).val()
					, artist_id: $("#artist_id" + i.toString()).attr("value")
					, album_id: $("#album_id" + i.toString()).attr("value")
					}
			    });

			}/*else{
				$.ajax({
					type: "POST",
				    url: '/updatedata',
				    data: {youtube_id: $("#youtube_id" + i.toString()).attr("value")
				    , library: library_value
					, only_library: true}
			    });
			}*/

		    i++;
		});
		//window.location.reload('/listens');
	});	
	$( "#sortable" ).sortable({
      revert: true
    });
    $( "#draggable" ).draggable({
      connectToSortable: "#sortable",
      helper: "clone",
      revert: "invalid"
    });
    $( "ul, li" ).disableSelection();

    $("#open-playlist-menu").click(function(){
    	if ($("#sortable").is(":visible")){
    		$("#sortable").hide();
    	}else{
    		$("#sortable").show();
    	}
	});
});




