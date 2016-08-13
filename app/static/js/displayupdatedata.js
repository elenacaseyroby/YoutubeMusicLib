$(function(){

	
	$("#updatelistens").on("submit", function(event) {
		event.preventDefault();
		index = $(".listen_row").length;
		i = 0;
		var dataupdated = false;

		$.each($(".listen_row"), function(index, listen){ //used to use ".row"
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
			
			console.log("#youtube_id" + i.toString());
			console.log($("#youtube_id" + i.toString()).attr("value"));
			console.log("#artist" + i.toString());
			console.log($("#artist" + i.toString()).val());
			if(dataupdated){
				console.log("updated data.");
				$.ajax({
					type: "POST",
				    url: '/updatedata',
				    data: {youtube_id: $("#youtube_id" + i.toString()).attr("value")
				    , library: library_value
				    , music: music_value
				    , title: $("#title" + i.toString()).val()
				    , artist: $("#artist" + i.toString()).val()
				    , album: $("#album" + i.toString()).val()
					, artist_id: $("#artist_id" + i.toString()).attr("value")
					, album_id: $("#album_id" + i.toString()).attr("value")
					}
			    });

			}

		    i++;
		});
		//window.location.reload('/listens');
	});	
	$("#search-data").on("submit", function(event) {
		event.preventDefault();
		console.log("clicked!!!!!!!");
		getDataRowData($("#search_artist").attr("value"), $("#search_start_date").attr("value"),$("#search_end_date").attr("value"),$("#playlist-name").val());

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
    getDataRowData($("#search_artist").attr("value"), $("#search_start_date").attr("value"),$("#search_end_date").attr("value"),$("#playlist-name").val());
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
//getDataRowData($("#search_artist").attr("value"), $("#search_start_date").attr("value"),$("#search_end_date").attr("value"),$("#playlist-name").val())
function getDataRowData(search_artist=null, search_start_date=null, search_end_date=null, playlist_title=null){
	if (search_artist){
		artist = search_artist;
	}else{
		artist = "";
	}

	var results = $.ajax({
		type: "GET",
	    url: '/search-listens',
	    data: {search_start_date: search_start_date
	    , search_end_date: search_end_date
	    , search_artist: artist
	    , playlist_title: playlist_title
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
		var row = '<tr class="listen_row">'
		  + listens_index
		  + '<td><input type = "checkbox" id = "library'
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
		  + '"></td><td><input class="play-checkbox" type = "checkbox" id = "'
		  + index.toString()
		  + '" '
		  + checkedIfPlaylist
		  +'></td><input type="hidden" class = "'
		  + vid.youtube_id
		  + '" id="youtube_id'
		  + index.toString()
		  + '" value="'
		  + vid.youtube_id
		  + '"><input type="hidden" class = "artist_id-'
		  + vid.youtube_id
		  + '" id="artist_id'
		  + index.toString()
		  + '" value="'
		  + vid.artist_id
		  + '"><input type="hidden" class = "album-'
		  + vid.youtube_id
		  + '" id="album_id'
		  + index.toString()
		  + '" value="'
		  + vid.album_id
		  + '"></tr>';
		
		$("#table").append(row);

	});
}

//Bugs:
//won't update vids
//only adds and deletes new vids from playlist ~ won't affect old vids
//http://blog.miguelgrinberg.com/post/the-flask-mega-tutorial-part-xii-facelift





