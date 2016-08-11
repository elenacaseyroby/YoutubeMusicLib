$(function(){
	getDataRowData();
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
    // double click to delete
    $( "li" ).dblclick( function(){
    	if (confirm("Are you sure you want to delete '"+$(this).attr("value")+"' from your playlist? You must click the Save button to make this change permanent.")) {
        	// your deletion code
        	$(this).remove();
    	}
    });
});

function getDataRowData(){
	if ($("#search_artist").attr("value")){
		artist = $("#search_artist").attr("value");
	}else{
		artist = "";
	}

	var results = $.ajax({
		type: "GET",
	    url: '/search-listens',
	    data: {search_start_date: $("#search_start_date").attr("value")
	    , search_send_date: $("#search_end_date").attr("value")
	    , search_artist: artist
	    }
	    ,dataType: 'json'
    }).done(function(results){
    	renderDataRow(results, isListens = true);
    });


    

}

function renderDataRow($display_data_rows, isListens = false){
	index = $display_data_rows.length
	$.each($display_data_rows, function(index, vid){
		if(isListens){
			listens_index = '<td>'+vid.index+'</td>';
		}else{
			listens_index = '';
		}
		var checkedIfPlaylist = vid.playlist ? "checked" : "";
		var checkedIfMusic = vid.music ? "checked" : "";
		var checkedIfLib = vid.library ? "checked" : "";
		var row = '<tr class="row">'
		  + listens_index
		  + '<td><input class="play-checkbox" type = "checkbox" id = "'
		  + index.toString()
		  + '" '
		  + checkedIfPlaylist
		  +'"></td><td><input type = "checkbox" id = "library'
		  + index.toString()
		  + '" value="'
		  + vid.library
		  + '" '
		  + checkedIfLib
		  + '</td><td><input class = "music-'
		  + vid.youtube_id
		  + '" type = "checkbox" id = "music'
		  + index.toString()
		  + '" value="'
		  + vid.music
		  + '" '
		  + checkedIfMusic
		  + '></td><td><input class = "title-'
		  + vid.youtube_id
		  + '" type="textbox" id="title'
		  + index.toString()
		  + '" value="'
		  + vid.title
		  + '"></td> <td><input class = "artist-'
		  + vid.youtube_id
		  + '" type="textbox" id="artist'
		  + index.toString()
		  + '" value="'
		  + vid.artist
		  + '"></td><td><input class = "album-'
		  + vid.youtube_id
		  + '" type="textbox" id="album'
		  + index.toString()
		  + '" value="'
		  + vid.album
		  + '"></td><hidden class = "'
		  + vid.youtube_id
		  + '" id="youtube_id'
		  + index.toString()
		  + '" value="'
		  + vid.youtube_id
		  + '"></hidden><hidden class = "artist_id-'
		  + vid.youtube_id
		  + '" id="artist_id'
		  + index.toString()
		  + '" value="'
		  + vid.artist_id
		  + '"></hidden><hidden class = "album-'
		  + vid.youtube_id
		  + '" id="album_id'
		  + index.toString()
		  + '" value="'
		  + vid.album_id
		  + '"></hidden></tr>';
		  console.log(row);
		$("#table").append(row);

	});
}


		/*
		var row = '<div class="row">\
					<tr>\
						'+listens_index+'\
						<td><input class="play-checkbox" type = "checkbox" id = "'+index.toString()+'" '+ vid.playlist ? "checked" +'></td>\
						<td><input type = "checkbox" id = "library'+index.toString()+'" value='+vid.library+' '+ vid.library ? "checked"+'></td> \
						<td><input class = "music-'+vid.youtube_id+'" type = "checkbox" id = "music'+index.toString()+'" value="'+vid.music+'"" '+ vid.music ? "checked"+'></td> \
						<td><input class = "title-'+vid.youtube_id+'" type="textbox" id="title'+index.toString()+'" value="'+vid.title+'"></td> \
						<td><input class = "artist-'+vid.youtube_id+'" type="textbox" id="artist'+index.toString()+'" value="'+vid.artist+'"></td> \
						<td><input class = "album-'+vid.youtube_id+'" type="textbox" id="album'+index.toString()+'" value="'+vid.album+'"></td> \
					</tr>\
					<hidden class = "'+vid.youtube_id+'" id="youtube_id'+index.toString()+'" value="'+vid.youtube_id+'"></hidden>\
					<hidden class = "artist_id-'+vid.youtube_id+'" id="artist_id'+index.toString()+'" value="'+vid.artist_id+'"></hidden>\
					<hidden class = "album-'+vid.youtube_id+'" id="album_id'+index.toString()+'" value="'+vid.album_id+'"></hidden>\
				</div>';*/



