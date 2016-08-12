$(function(){
	function getDataRowData(){
		if ($("#search_artist").attr("value")){
			artist = $("#search_artist").attr("value");
		}else{
			artist = "";
		}
		console.log("~~~~~~~~~~~~~~~~~~~");
		console.log($("#playlist-name").val());
		console.log("~~~~~~~~~~~~~~~~~~~");
		var results = $.ajax({
			type: "GET",
		    url: '/search-listens',
		    data: {search_start_date: $("#search_start_date").attr("value")
		    , search_send_date: $("#search_end_date").attr("value")
		    , search_artist: artist
		    , playlist_title: $("#playlist-name").val()
		    }
		    ,dataType: 'json'
	    }).done(function(results){
	    	renderDataRow(results, isListens = true);
	    });
	}

	function renderDataRow($display_data_rows, isListens = false){
		console.log("before table !!");
		index = $display_data_rows.length
		$.each($display_data_rows, function(index, vid){
			if($("#islistens").attr("value")=="true"){
				listens_index = '<td>'+vid.index+'</td>';
			}else{
				listens_index = '';
			}
			//console.log(vid.playlist);
			//console.log(vid.music);
			//console.log(vid.library);
			var checkedIfPlaylist = ((vid.playlist==1) ? "checked" : "");
			var checkedIfMusic = ((vid.music==1) ? "checked" : "");
			var checkedIfLib = ((vid.library==1) ? "checked" : "");
			//console.log(checkedIfPlaylist);
			var row = '<tr id="listen_row">'
			  + listens_index
			  + '<td><input class="play-checkbox" type = "checkbox" id = "'
			  + index.toString()
			  + '" '
			  + checkedIfPlaylist
			  +'></td><td><input type = "checkbox" id = "library'
			  + index.toString()
			  + '" value="'
			  + vid.library
			  + '" '
			  + checkedIfLib
			  + '></td><td><input class = "music-'
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
			
			$("#table").append(row);

		});
	}
	
	$("#updatelistens").on("submit", function(event) {
		event.preventDefault();
		index = $(".row").count();
		i = 0;
		var dataupdated = false;

		$.each($("#listen_row"), function(index, listen){ //used to use ".row"
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
    //$('input[type=checkbox]').change(function(){
    getDataRowData();
    console.log("before checkbox !!");
    //$('input[type=checkbox]').onClick(function(){
    $('body').on('click', '.play-checkbox', function (){
		console.log("checkbox changed!");
	    if (this.checked) {
    		console.log("checked!"); //is registering when checked
	        console.log(this.id);
	        $("#sortable").append("<li id='"+"playlist-"+$("#youtube_id"+this.id).attr("value")+"' class='ui-state-default' value='"+$("#youtube_id"+this.id).attr("value")+"'>"+$("#artist"+this.id).val()+" - "+$("#title"+this.id).val()+"</li>");
	    }else{
	    	$("#playlist-"+$("#youtube_id"+this.id).attr("value")).remove();
	    	console.log(" not checked!");
		}

	});
});

//Bugs:
//won't update vids
//only adds and deletes new vids from playlist ~ won't affect old vids
//http://blog.miguelgrinberg.com/post/the-flask-mega-tutorial-part-xii-facelift





