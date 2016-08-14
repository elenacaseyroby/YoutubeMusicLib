$.getScript("static/js/playvideo.js", function(){
	console.log("playvideo.js loaded");
});

var current_playlist_tracks = [];

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
	$("#save-playlist").click(function(){
		$("#confirm-save-message").empty();
		if($("#playlist-name").val()==""){
			$("#confirm-save-message").append("<font color='red'><center>Please enter new playlist name before saving.</center></font>");
		}else{
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
		    getPlaylistTitlesAndRender($selected_playlist = playlist_title);
		}
	});
	$("#delete-playlist").click( function(){
		if (confirm("Are you sure you want to delete '"+$("#playlist-dropdown").val()+"' from your playlist? You must click the Save button to make this change permanent.")) {
        // your deletion code
			var playlist_title = $("#playlist-name").val();
			var playlist_tracks = [];
			$.ajax({
				type: "POST",
		    	url: '/postplaylist',
		    	data: {playlist_title: playlist_title, 
		    		tracks: JSON.stringify(playlist_tracks)
		    	}
		    }).done(function(){
		    	getPlaylistTitlesAndRender();
		    	$("#sortable").empty();
		    });
		    $("#playlist-name").val("");
		    
		}

	});
	/*
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
	    getPlaylistTitlesAndRender($selected_playlist = playlist_title);
	    
		//send array and to views.py through ajax request
    });*/
    
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
    	$("#confirm-save-message").empty();
    	getPlaylistData($("#playlist-dropdown").val());
    	if($("#playlist-dropdown").val() == "Select Playlist"){
    		$("#playlist-name").val("");
    	}else{
    		$("#playlist-name").val($("#playlist-dropdown").val());
    	}
    	
    });
    //$('input[type=checkbox]').change(function(){
    getRowData(search_artist = $("#search_artist").val(), search_start_date = $("#search_start_date").val(),search_end_date = $("#search_end_date").val(), playlist_title = $("#playlist-name").val(), islistens = $("#islistens").attr("value"));
    getPlaylistTitlesAndRender();
    /*
    $(".playlist-action-buttons i").hover(
    	
    	function(){
    		var small_image = $(this).attr("class").replace(/ fa-lg/g, "");
    		var big_image = $(this).attr("class")+" fa-lg";
    		console.log("hover in");
    		console.log(big_image);
    		console.log(small_image);
    		$(this).switchClass( small_image, big_image);
    	},
    	function(){

    		var small_image = $(this).attr("class").replace(/ fa-lg/g, "");
    		var big_image = $(this).attr("class")+" fa-lg";
    		console.log("hover out");
    		console.log(big_image);
    		console.log(small_image);
    		$(this).switchClass( big_image, small_image);
    	}
    );
    */

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




function addTrackToPlaylist(index){
	//<span class="close" id=close-"'
	$("#sortable").append("<li id='"+"playlist-"+$("#youtube_id"+index).attr("value")+"' class='ui-state-default' value='"+$("#youtube_id"+index).attr("value")+"'>"+$("#artist"+index).val()+" - "+$("#title"+index).val()+"<span class='close' id='close-"+ $("#youtube_id"+index).attr("value") + "'><i class='fa fa-trash-o' aria-hidden='true' onclick='deleteTrackFromPlaylist(\""+ $("#youtube_id"+index).attr("value")+"\")'></i></span>"+"</li>");
}
function deleteTrackFromPlaylist(youtube_id){
    	
    	$("#playlist-" + youtube_id).remove();
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
function getPlaylistData(playlist_title){
	var results = $.ajax({
		type: "GET",
	    url: '/get-playlist-tracks',
	    data: {playlist_title: playlist_title
	    }
	    ,dataType: 'json'
    }).done(function(results){ 
    	renderPlaylistTrack(results);
    });
}


function renderPlaylistTrack(playlist_tracks){
	current_playlist_tracks = [];
	$("#sortable").empty();
	index = playlist_tracks.length
	$.each(playlist_tracks, function(index, track){
		video = new YoutubeVideo(track['youtube_id']);
		current_playlist_tracks.push(video);
		
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
		+ '<span class="close" id=close-"'
		+ track['youtube_id']
		+ '"><i class="fa fa-trash-o" aria-hidden="true" onclick="deleteTrackFromPlaylist(\''
		+ track['youtube_id']
		+'\')"></i></span></li>';

		$("#sortable").append(track);

	});
}

function getPlaylistTitlesAndRender(selected_playlist = null){
	console.log("get titles!");
	var results = $.ajax({
		type: "GET",
	    url: '/get-playlist-titles',
	    dataType: 'json'
    }).done(function(results){ 
    	renderPlaylistDropDown(results, selected_playlist);
    });
}

function renderPlaylistDropDown(playlists, selected_playlist = null){
	$("#playlist-dropdown").empty();
	$("#playlist-dropdown").append('<option value="Select Playlist" >Select Playlist</option>');
	index = playlists.length;
	$.each(playlists, function(index, title){
		if(selected_playlist){
			var selected = ( ( selected_playlist == title ) ? "selected" : "");
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

		
		//update texbox
	
}

$(document).on('dblclick', 'li', function() {
    console.log("play!");
	var youtube_id = this.id.replace("playlist-", "");
	playVideo(youtube_id, current_playlist_tracks);
});









