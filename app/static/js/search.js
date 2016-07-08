number_of_plays = 0;

function YoutubeVideo(id, title){
	this.id = id;
	this.title = title;
}

current_iframe_video = new YoutubeVideo("98T3lkkdKqk","Teenage Fanclub - Bandwagonesque - Full Album - 1991");

var selected_videos = [];

var search_page = true;//eventually python should send this value if its a search page and false if its a playlist page
var vids_up_next = [];

$(function(){
	$("#searchbar").on("submit", function(event) {
		event.preventDefault();
		//prepare the request		
		var request = gapi.client.youtube.search.list({
			part: "snippet",
			type: "video",
			maxResults: 3,
			order: "relevance",
			q: encodeURIComponent($("#keywords").val()).replace(/%20/g, "+")
		});
		//execute the request
		request.execute(function(response){
			$("#selectedvideos").empty();

			var results = response.result;
			i = 0;
			$.each(results.items, function(index, item){
				//stores title and video in global array
				selected_videos [i] = new YoutubeVideo(item.id.videoId, item.snippet.title);
				i++;
			});
			renderList(vid_list = selected_videos, $element_object = $('#selectedvideos'));
			/*
			//pass to views.py
			console.log(selected_videos[0]);
			$.ajax({
				type: "POST",
			    url: '/printplaylist',
			    data: {vid1: JSON.stringify({id: selected_videos[0].id, title: selected_videos[0].title}),
						vid2: JSON.stringify({id: selected_videos[1].id, title: selected_videos[1].title}),
						vid3: JSON.stringify({id: selected_videos[2].id, title: selected_videos[2].title})}
		    });
			*/
		});	
	});	
});

//loads iframe api scripts on first play and calls iframe api directly on additional plays
function playVideo(id, title) {
	current_iframe_video.id = id;
	current_iframe_video.title = title;
	if(number_of_plays<1){
		//scripts trigger onYouTubeIframeAPIReady()
		var tag = document.createElement('script');
		tag.src = "https://www.youtube.com/iframe_api";
		var firstScriptTag = document.getElementsByTagName('script')[0];
		firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
	}else{
		onYouTubeIframeAPIReady()
	}
}

function onYouTubeIframeAPIReady() {
	$("#iframe").empty();

	$("<div></div>").attr('id','rendered_iframe').appendTo('#iframe');

	player = new YT.Player('rendered_iframe', {
		height: '390',
	  	width: '640',
	  	videoId: current_iframe_video.id,
	  	title: current_iframe_video.title,
	  	events: {
	  		'onReady' : onPlayerReady,
	    	'onStateChange': onPlayerStateChange
	  	}
	});
	number_of_plays++;
	getRelatedVideos(current_iframe_video.id);
}

//play on iframe load
function onPlayerReady(event){
	event.target.playVideo();
}

function onPlayerStateChange(event) { 
	//if vid is playing from first 2 secs, save to list after 1 second this avoids tracking pauses
	if(event.data == YT.PlayerState.PLAYING && event.target.v.currentTime <= 2.0){
		setTimeout(savePlay(event), 1000);
	}
	if(event.data == YT.PlayerState.ENDED){
		savePlay(event, end = true);
		playNextVidInList();
	}
}

function playNextVidInList(){
	place_in_list = -1;
		length = vids_up_next.length;
		i=0;
		$.each(vids_up_next, function(length, vid){
			if(vid.id == current_iframe_video.id){
				place_in_list = i;
			}
			i++;
		});
		//if vid is in list, play vid after it
		//else play random vid from list
		if(place_in_list > -1){
			place_in_list = place_in_list+1;
			playVideo(vids_up_next[place_in_list].id, vids_up_next[place_in_list].title);
		}else{
			place_in_list = Math.floor(Math.random() * length); 
			playVideo(vids_up_next[place_in_list].id, vids_up_next[place_in_list].title);
		}
}

//records play at top of page
function savePlay(event, end = false) {
	
	title = event.target.v.videoData.title;
	title = title.toString();
	youtube_id = event.target.v.videoData.video_id;
	youtube_id = youtube_id.toString();
	//time_start = event.target.getCurrentTime();
	//time_end = event.target.getCurrentTime();
	listened_to_end = 0;
	if(end){
		listened_to_end = 1;
	}

	//send data to view.py
	$.ajax({
		type: "POST",
	    url: '/postlistens',
	    data: {user_id: "1", title: title, youtube_id: youtube_id, listened_to_end: listened_to_end}
    });
	if(!end){
		$("#record_plays").append(title).append("<br>");
	}
}

//get and render related videos
function getRelatedVideos(youtube_id){
	var related_videos = [];

	var request = gapi.client.youtube.search.list({
			part: "snippet",
			type: "video",
			relatedToVideoId: youtube_id,
			maxResults: 3
			
	});
	request.execute(function(response){
		
		var results = response.result;
		i = 0;
		$.each(results.items, function(index, item){
			related_videos [i] = new YoutubeVideo(item.id.videoId, item.snippet.title);
			i++;
		});
		renderList(related_videos, $('#relatedvideos'), false);	
		if(search_page == true){
			vids_up_next = related_videos;
		}
	});
}

//takes array of YoutubeVideo objects and an element 
//object and appends a playable list of 
//youtube videos to the specified element
function renderList(vid_list = selected_videos, $element_object = $('#selectedvideos'), empty_element = true){
	if(empty_element){
		$element_object.empty();
	}
	length = vid_list.length;
	$.each(vid_list, function(length, vid){
		play_button = "<br><li>"+vid.title+"<button type='button' id='"+vid.id+"' value='"+vid.id+","+vid.title+"' onclick=\"playVideo('"+vid.id+"','"+vid.title+"')\"> Play </button></li><br>";
		if(empty_element){
			$element_object.append(play_button);
		}else{
			$element_object.prepend(play_button);//todo: remove elements at bottom of list after reaches certain size
		}
	});
	
}

function init(){
	//test key:
	gapi.client.setApiKey("AIzaSyB8Myy78KEAuztudBxlM7ZwMbVnu7VQZpA");
	//live:
	//gapi.client.setApiKey("AIzaSyBb7dtTX5v8gJN-tD8Mbm8jCdBqlXIeY2k");
	
	gapi.client.load("youtube","v3", function(){
		//youtube api is ready
	});

}