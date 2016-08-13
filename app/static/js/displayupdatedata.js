$(function(){

	
	$("#updatelistens").on("submit", function(event) {
		event.preventDefault();
		index = $(".listen_row").length;
		i = 0;
		var dataupdated = false;

		$.each($("#hi"), function(index, listen){ //used to use ".row"
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
		getRowData(search_artist = $("#search_artist").val(), search_start_date = $("#search_start_date").val(),search_end_date = $("#search_end_date").val(), playlist_title = $("#playlist-name").val(), islistens = $("#islistens").attr("value"));

	});
	$("#update-playlist-form").on("submit", function(event) {
		event.preventDefault();
		$("#confirm-save-message").append("<font color='purple'><center>Saved.</center></font>");
	    setTimeout($("#confirm-save-message").fadeOut(), 3000);
    	var listItems = $("#sortable li");
    	var i = 1;
    	var playlist_title = $("#playlist-name").val();
    	var playlist_tracks = [];
		listItems.each(function(li) {
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
	    getPlaylistTitles($selected_playlist = playlist_title);
	    
		//send array and to views.py through ajax request
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

    $("#playlist-dropdown").change(function(){
    	getPlaylistData($("#playlist-dropdown").val());
    	$("#playlist-name").val($("#playlist-dropdown").val());
    });
    // double click to delete
    $( "li" ).dblclick( function(){
    	if (confirm("Are you sure you want to delete '"+$(this).attr("value")+"' from your playlist? You must click the Save button to make this change permanent.")) {
        	// your deletion code
        	$(this).remove();
    	}
    });
    $("td.add-to-playlist-button").click(function(){
    	console.log("clicked!");
	    //$("#sortable").append("<li id='"+"playlist-"+$("#youtube_id"+this.id).attr("value")+"' class='ui-state-default' value='"+$("#youtube_id"+this.id).attr("value")+"'>"+$("#artist"+this.id).val()+" - "+$("#title"+this.id).val()+"</li>");
	});
    //$('input[type=checkbox]').change(function(){
    getRowData(search_artist = $("#search_artist").val(), search_start_date = $("#search_start_date").val(),search_end_date = $("#search_end_date").val(), playlist_title = $("#playlist-name").val(), islistens = $("#islistens").attr("value"));
    getPlaylistTitles()

    //$('input[type=checkbox]').onClick(function(){
    /*
    $('body').on('click', '.play-checkbox', function (){
	    if (this.checked) {
	        $("#sortable").append("<li id='"+"playlist-"+$("#youtube_id"+this.id).attr("value")+"' class='ui-state-default' value='"+$("#youtube_id"+this.id).attr("value")+"'>"+$("#artist"+this.id).val()+" - "+$("#title"+this.id).val()+"</li>");
	    }else{
	    	$("#playlist-"+$("#youtube_id"+this.id).attr("value")).remove();
		}

	});*/
	/*
	$('#hi').hover(function() {
		
	    console.log("on hover");//$(this).addClass('hover');
	    $('.add-to-playlist-button').append('<i class="fa fa-plus" aria-hidden="true"></i>');
	}, function() {
		console.log("off hover");
		$('.add-to-playlist-button').empty();
	    //$(this).removeClass('hover');
	});*/
});
//getRowData($("#search_artist").attr("value"), $("#search_start_date").attr("value"),$("#search_end_date").attr("value"),$("#playlist-name").val())
function getRowData(search_artist=null, search_start_date=null, search_end_date=null, playlist_title=null, islistens = "false"){
	
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
	    , islistens: islistens
	    }
	    ,dataType: 'json'
    }).done(function(results){
    	renderDataRow(results, islistens = $("#islistens").attr("value"));
    });
}
function addTrackToPlaylist($index){
	$("#sortable").append("<li id='"+"playlist-"+$("#youtube_id"+$index).attr("value")+"' class='ui-state-default' value='"+$("#youtube_id"+$index).attr("value")+"'>"+$("#artist"+$index).val()+" - "+$("#title"+$index).val()+"</li>");
}

function renderDataRow($display_data_rows, islistens = "false"){
	$("tbody").empty();
	index = $display_data_rows.length
	$.each($display_data_rows, function(index, vid){
		if(islistens=="true"){
			listens_index = '<td>'+vid['index']+'</td>';
		}else{
			listens_index = '';
		}
		var checkedIfPlaylist = ((vid.playlist==1) ? "checked" : "");
		var checkedIfMusic = ((vid.music==1) ? "checked" : "");
		var checkedIfLib = ((vid.library==1) ? "checked" : "");
		var row = '<tr id="hi">'
		  + listens_index
		  + '<td><input type = "checkbox" id = "library'
		  + index.toString()
		  + '" value="'
		  + vid['library']
		  + '" '
		  + checkedIfLib
		  + '></td><td><input class = "music-'
		  + vid['youtube_id']
		  + '" type = "checkbox" id = "music'
		  + index.toString()
		  + '" value="'
		  + vid['music']
		  + '" '
		  + checkedIfMusic
		  + '></td><td><input class = "title-'
		  + vid['youtube_id']
		  + '" type="textbox" id="title'
		  + index.toString()
		  + '" value="'
		  + vid['title']
		  + '"></td> <td><input class = "artist-'
		  + vid['youtube_id']
		  + '" type="textbox" id="artist'
		  + index.toString()
		  + '" value="'
		  + vid['artist']
		  + '"></td><td><input class = "album-'
		  + vid['youtube_id']
		  + '" type="textbox" id="album'
		  + index.toString()
		  + '" value="'
		  + vid['album']
		  + '"></td><td class = "add-to-playlist-button" onclick="addTrackToPlaylist(\''
		  + index.toString()
		  + '\')"><i class="fa fa-plus" aria-hidden="true"></i></td><input type="hidden" class = "'
		  + vid['youtube_id']
		  + '" id="youtube_id'
		  + index.toString()
		  + '" value="'
		  + vid['youtube_id']
		  + '"><input type="hidden" class = "artist_id-'
		  + vid['youtube_id']
		  + '" id="artist_id'
		  + index.toString()
		  + '" value="'
		  + vid['artist_id']
		  + '"><input type="hidden" class = "album-'
		  + vid['youtube_id']
		  + '" id="album_id'
		  + index.toString()
		  + '" value="'
		  + vid['album_id']
		  + '"></tr>';
		
		$("tbody").append(row);

	});
}
function getPlaylistData($playlist_title){
	var results = $.ajax({
		type: "GET",
	    url: '/get-playlist-tracks',
	    data: {playlist_title: $playlist_title
	    }
	    ,dataType: 'json'
    }).done(function(results){ 
    	renderPlaylistTrack(results);
    });
}


function renderPlaylistTrack($playlist_tracks){
	$("#sortable").empty();
	index = $playlist_tracks.length
	$.each($playlist_tracks, function(index, track){
		
		var track = '<li id="playlist-'
		+ track['youtube_id']
		+ '" class="ui-state-default" value="'
		+ track['artist']
		+ ' - '
		+ track['title']
		+ '">'
		+ track['artist']
		+ ' - '
		+ track['title']
		+ '</li>';

		$("#sortable").append(track);

	});
}

function getPlaylistTitles($selected_playlist = null){
	console.log("get titles!");
	var results = $.ajax({
		type: "GET",
	    url: '/get-playlist-titles',
	    dataType: 'json'
    }).done(function(results){ 
    	renderPlaylistDropDown(results, $selected_playlist);
    });
}

function renderPlaylistDropDown($playlists, $selected_playlist = null){
	$("#playlist-dropdown").empty();
	index = $playlists.length
	$.each($playlists, function(index, title){
		if($selected_playlist){
			var selected = ( ( $selected_playlist == title ) ? "selected" : "");
		}else{
			var selected = ( ($("#playlist-dropdown").attr("value") == title ) ? "selected" : "");
		}
		
		var title = '<option value="'
		+ title
		+'" '
		+ selected
		+ '>'
		+ title
		+ '</option>';

		$("#playlist-dropdown").append(title);

	});
}
//playlist_title
//http://stackoverflow.com/questions/25074450/div-appear-disappear-on-mouse-enter-leave






