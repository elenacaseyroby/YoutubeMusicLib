$.getScript("static/js/playvideo.js", function(){
});

var current_playlist_tracks = [];
var current_data_rows = [];

$(function(){
	$("#updatelistens").on("submit", function(event) {
		event.preventDefault();
		index = $(".listen_row").length;
		i = $("#vid-range-start").attr("value");
		var dataupdated = false;
		$.each($(".datarows"), function(index, listen){
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
				    url: '/updatevideodata',
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
			    //update array when you update db so that table pages reflect 
			    //video updates without refreshing the whole page
			    current_data_rows[i].library = library_value;
			    current_data_rows[i].music = music_value;
			    current_data_rows[i].title = $("#title" + i.toString()).val();
			    current_data_rows[i].artist = $("#artist" + i.toString()).val();
			    current_data_rows[i].album = $("#album" + i.toString()).val();
			}
		    i++;
		});
	});	
	$("#search-data").on("submit", function(event) {
		event.preventDefault();
		getRowData(video_scope = $("#video-scope-dropdown").val(), search_artist = $("#search_artist").val(), search_start_date = $("#search_start_date").val(),search_end_date = $("#search_end_date").val(), playlist_title = $("#playlist-name").val(), islistens = $("#islistens").attr("value"));

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
		if (confirm("Are you sure you want to delete '"+$("#playlist-dropdown").val()+"' from your playlist? If you click OK this change will be permanent.")) {
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
	$("#add-playlist").click( function(){
		$("#playlist-name").val("");
		$("#sortable").empty();
		getPlaylistTitlesAndRender();

	})
    
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
    		document.getElementById("filters-and-table").className = "col-md-12";
    	}else{
    		$(".playlist-menu").show();
    		document.getElementById("filters-and-table").className = "col-md-10";
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
    $("#video-scope-dropdown").change(function(){ //add artist to all of these and dates to listens
    	$("#search-listens-dates").hide();
    	if($("#video-scope-dropdown").val() == "listens"){
    		search_start_date = $("#search_start_date").val();
    		search_end_date = $("#search_end_date").val()
    		$("#search-listens-dates").show();
    	}else{
    		search_start_date = "1969-01-01"
    		search_end_date = "3000-01-01"
    	}
    	if($("#search_artist").val()){
    		artist = $("#search_artist").val();
    	}else{
    		artist = null;
    	}
    	playlist_title = $("#playlist-name").val();
    	video_scope = $("#video-scope-dropdown").val();
    	getRowData(video_scope = video_scope, search_artist = artist, search_start_date = search_start_date, search_end_date = search_end_date);
    });
    video_scope = $("#video-scope-dropdown").val();
    search_artist = $("#search_artist").val();
    search_start_date = $("#search_start_date").val();
    search_end_date = $("#search_end_date").val();
    getRowData(video_scope = video_scope, search_artist = search_artist, search_start_date = search_start_date, search_end_date = search_end_date);
    getPlaylistTitlesAndRender();

});
function getRowData(video_scope, search_artist=null, search_start_date=null, search_end_date=null){
	//video_scope = "listens", "library", or "all"
	if(video_scope != "library" && video_scope != "listens" && video_scope != "all"){
		video_scope = "listens";
	}
	if (search_artist){
		artist = search_artist;
	}else{
		artist = "";
	}

	var results = $.ajax({
		type: "GET",
	    url: '/search-saved-videos',
	    data: {search_start_date: search_start_date
	    , search_end_date: search_end_date
	    , search_artist: artist
	    , video_scope: video_scope
	    }
	    ,dataType: 'json'
    }).done(function(results){
    	current_data_rows = results;
    	renderDataRow(video_scope = video_scope, table_page = 0, $display_data_rows = current_data_rows);
    });
}

function addTrackToPlaylist(index){
	$("#sortable").append("<li id='"+"playlist-"+$("#youtube_id"+index).attr("value")+"' class='ui-state-default' value='"+$("#youtube_id"+index).attr("value")+"'>"+$("#artist"+index).val()+" - "+$("#title"+index).val()+"<span class='close' id='close-"+ $("#youtube_id"+index).attr("value") + "'><i class='fa fa-trash-o' aria-hidden='true' onclick='deleteTrackFromPlaylist(\""+ $("#youtube_id"+index).attr("value")+"\")'></i></span>"+"</li>");
}
function deleteTrackFromPlaylist(youtube_id){
    	
    	$("#playlist-" + youtube_id).remove();
}

function renderDataRow(video_scope = "listens", table_page = 0, $display_data_rows = current_data_rows){
	num_vids_per_table_page = 100;
	$("tr #time-column").remove();
	$("tbody").empty();
	index = $display_data_rows.length
	if(video_scope == "listens"){
		$("tr").prepend('<th id="time-column">Time</th>');
	}
	num_table_pages = Math.ceil($display_data_rows.length/num_vids_per_table_page);
	vid_range_start = table_page*num_vids_per_table_page;
	vid_range_end = table_page*num_vids_per_table_page + num_vids_per_table_page;
	if($display_data_rows.length<vid_range_end){
		vid_range_end = $display_data_rows.length;
	}
	index = vid_range_start;
	while(index < vid_range_end){
		if(video_scope == "listens"){
			listens_index = '<td>'+$display_data_rows[index]['index']+'</td>';
		}else{
			listens_index = '';
		}
		var checkedIfPlaylist = (($display_data_rows[index]['playlist']==1) ? "checked" : "");
		var checkedIfMusic = (($display_data_rows[index]['music']==1) ? "checked" : "");
		var checkedIfLib = (($display_data_rows[index]['library']==1) ? "checked" : "");
		var row = '<tr class="datarows">'
		  + listens_index
		  + '<td><input type = "checkbox" id = "library'
		  + index.toString()
		  + '" value="'
		  + $display_data_rows[index]['library']
		  + '" '
		  + checkedIfLib
		  + '></td><td><input class = "music-'
		  + $display_data_rows[index]['youtube_id']
		  + '" type = "checkbox" id = "music'
		  + index.toString()
		  + '" value="'
		  + $display_data_rows[index]['music']
		  + '" '
		  + checkedIfMusic
		  + '></td><td><input class = "title-'
		  + $display_data_rows[index]['youtube_id']
		  + '" type="textbox" id="title'
		  + index.toString()
		  + '" value="'
		  + $display_data_rows[index]['title']
		  + '"></td> <td><input class = "artist-'
		  + $display_data_rows[index]['youtube_id']
		  + '" type="textbox" id="artist'
		  + index.toString()
		  + '" value="'
		  + $display_data_rows[index]['artist']
		  + '"></td><td><input class = "album-'
		  + $display_data_rows[index]['youtube_id']
		  + '" type="textbox" id="album'
		  + index.toString()
		  + '" value="'
		  + $display_data_rows[index]['album']
		  + '"></td><td class = "add-to-playlist-button" onclick="addTrackToPlaylist(\''
		  + index.toString()
		  + '\')"><i class="fa fa-plus" aria-hidden="true"></i></td><input type="hidden" class = "'
		  + $display_data_rows[index]['youtube_id']
		  + '" id="youtube_id'
		  + index.toString()
		  + '" value="'
		  + $display_data_rows[index]['youtube_id']
		  + '"><input type="hidden" class = "artist_id-'
		  + $display_data_rows[index]['youtube_id']
		  + '" id="artist_id'
		  + index.toString()
		  + '" value="'
		  + $display_data_rows[index]['artist_id']
		  + '"><input type="hidden" class = "album-'
		  + $display_data_rows[index]['youtube_id']
		  + '" id="album_id'
		  + index.toString()
		  + '" value="'
		  + $display_data_rows[index]['album_id']
		  + '"></tr>';
		$("tbody").append(row);
		//store vid-range-start so when you check for updates by comparing old and new values of rows
		//you know which range of videos to check
		$("tbody").append("<hidden id ='vid-range-start' value="+vid_range_start+">");

		index = index + 1;
	}

	index = 0;
	$("#table-page-buttons").empty();
	if(num_table_pages > 1){
		while(index < num_table_pages){
			button_display = index + 1;
			$("#table-page-buttons").append('<button class="btn btn-secondary" type="button" onclick=\'renderDataRow(video_scope = "'+video_scope+'", table_page = '+index+')\' >'+button_display.toString()+'</button>');
			index = index + 1;
		}
	}

	
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
	$("#sortable").empty();
	index = playlist_tracks.length
	$.each(playlist_tracks, function(index, track){
		video = new YoutubeVideo(track['youtube_id']);
		
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
}

$(document).on('dblclick', 'li', function() {
	var playlist_tracks = $("#sortable li");
	index = playlist_tracks.length;
	current_playlist_tracks = [];
	playlist_tracks.each(function(index, track){
		var video = new YoutubeVideo(track.id.replace("playlist-", ""));
		current_playlist_tracks.push(video);
	});
	var youtube_id = this.id.replace("playlist-", "");
	playVideo(youtube_id, current_playlist_tracks);
});