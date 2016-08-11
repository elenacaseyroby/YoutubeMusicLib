$(function(){
	$("#updatelistens").on("submit", function(event) {
		event.preventDefault();
		index = $(".row").count();
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

			}

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
    	if ($(".playlist-menu").is(":visible")){
    		$(".playlist-menu").hide();
    		$(".main").css(
    			"width", "100%");
    	}else{
    		$(".playlist-menu").show();
    		$(".main").css(
    			"width", "80%");
    	}
	});
	$('input[type=checkbox]').change(
    function(){
        if (this.checked) {
            console.log(this.id);
            $("#sortable").append("<li id='"+"playlist-"+$("#youtube_id"+this.id).attr("value")+"' class='ui-state-default' value='"+$("#youtube_id"+this.id).attr("value")+"'>"+$("#artist"+this.id).val()+" - "+$("#title"+this.id).val()+"</li>")
        }else{
        	$("#playlist-"+$("#youtube_id"+this.id).attr("value")).remove();
        
        }
    });
    
    $("#save-playlist").click(function(){
    	var listItems = $("#sortable li");
    	var i = 1;
    	var playlist_title = $("#playlist-name").val();
    	var playlist_tracks = [];
		listItems.each(function(li) {
		    console.log(i+". "+$(this).attr('id').replace('playlist-', ''));
		    youtube_id = $(this).attr('id').replace('playlist-', '');
		    playlist_tracks.push(youtube_id);
		    i++;
		    //create array
		});
		console.log(playlist_title);
		console.log(playlist_tracks);
		$.ajax({
			type: "POST",
	    	url: '/postplaylist',
	    	data: {playlist_title: playlist_title, 
	    		tracks: JSON.stringify(playlist_tracks)
	    	}
	    });
		//send array and to views.py through ajax request
    });
    $("#playlist-dropdown").change(function(){
    	$("#select-playlist-form").submit();
    });
    /* double click to delete
    $( "li" ).dblclick( function(){
    	if (confirm("Are you sure you want to delete '"+$(this).attr("value")+"' from your playlist? You must click the Save button to make this change permanent.")) {
        	// your deletion code
        	$(this).remove();
    	}
    });*/
});




