$.getScript("static/js/lastfm.js", function(){
	console.log("lastfm.js loaded");
});
number_of_plays = 0;
function YoutubeVideo(id){
	this.id = id;
	this.title = "";
	this.channel_id = "";
	this.description = "";
}

current_iframe_video = new YoutubeVideo("98T3lkkdKqk");

//loads iframe api scripts on first play and calls iframe api directly on additional plays
function playVideo(id, title=null, channel_id=null, description=null) {
	current_iframe_video.id = id;
	if(title){
		current_iframe_video.title = title;
	}
	if(channel_id){
		current_iframe_video.channel_id = channel_id;
	}
	if(description){
		current_iframe_video.description = description;
	}
	
	if(number_of_plays<1){
		//scripts trigger onYouTubeIframeAPIReady()
		var tag = document.createElement('script');
		tag.src = "https://www.youtube.com/iframe_api";
		var firstScriptTag = document.getElementsByTagName('script')[0];
		firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  	}else{
    	//player.loadVideoById(current_iframe_video.id);
    	onYouTubeIframeAPIReady();
	  	number_of_plays++;
		/*
		getRelatedVideos(current_iframe_video.id);
		*/
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
	  	channel_id: current_iframe_video.channel_id,
	  	description: current_iframe_video.description,

	  	events: {
	  		'onReady' : onPlayerReady,
	    	'onStateChange': onPlayerStateChange
	  	}
	});
	number_of_plays++;
	/*
	getRelatedVideos(current_iframe_video.id);
	*/
}

//play on iframe load
function onPlayerReady(event){
	event.target.playVideo();
}

function onPlayerStateChange(event) { 
	//if vid is playing from first 2 secs, save to list after 1 second this avoids tracking pauses
	if(event.data == YT.PlayerState.PLAYING && event.target.j.currentTime <= 2.0){
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
			playVideo(vids_up_next[place_in_list].id, vids_up_next[place_in_list].title, vids_up_next[place_in_list].channel_id, vids_up_next[place_in_list].description);
		}else{
			place_in_list = Math.floor(Math.random() * length); 
			playVideo(vids_up_next[place_in_list].id, vids_up_next[place_in_list].title, vids_up_next[place_in_list].channel_id, vids_up_next[place_in_list].description);
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
			playVideo(vids_up_next[place_in_list].id, vids_up_next[place_in_list].title, vids_up_next[place_in_list].channel_id, vids_up_next[place_in_list].description);
		}else{
			place_in_list = Math.floor(Math.random() * length); 
			playVideo(vids_up_next[place_in_list].id, vids_up_next[place_in_list].title, vids_up_next[place_in_list].channel_id, vids_up_next[place_in_list].description);
		}
}
function savePlay(user_id, end = false){

		listened_to_end = 0;
		if(end){
			listened_to_end = 1;
		}
		$.ajax({
			type: "POST",
	    	url: '/postlistens',
	    	data: {user_id: user_id
	    		, youtube_title: ""
	    		, youtube_id: ""
	    		, listened_to_end: ""
	    		, channel_id: ""
	    		, description: ""
	    		, similarartiststring: ""
	    		, album : ""
	    		, title: ""
	    		, artist: ""
	    		, year: ""}
	    });
}
/* don't use yet
//get and render related videos
function getRelatedVideos(youtube_id){
	var related_videos = [];

	var request = gapi.client.youtube.search.list({
			part: "snippet",
			type: "video",
			relatedToVideoId: youtube_id,
			maxResults: 10
			
	});
	request.execute(function(response){
		
		var results = response.result;
		i = 0;
		$.each(results.items, function(index, item){
			related_videos [i] = new YoutubeVideo(item.id.videoId, item.snippet.title, item.snippet.channelId, item.snippet.description);
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
		play_button = '<li><a id="'+vid.id+'" value="'+vid.id+','+encodeURIComponent(vid.title.replace(/'/g, "&apos;").replace(/"/g, "&quot;"))+'" onclick=\'playVideo("'+vid.id+'","'+encodeURIComponent(vid.title.replace(/'/g, "&apos;").replace(/"/g, "&quot;"))+'", "'+vid.channel_id+'", "'+encodeURIComponent(vid.description.replace(/'/g, "&apos;").replace(/"/g, "&quot;"))+'")\'> '+vid.title+'</a></li><br>';
		if(empty_element){
			$element_object.append(play_button);
		}else{
			$element_object.prepend(play_button);//todo: remove elements at bottom of list after reaches certain sizes
		}
		//can post descriptions with quotes to db and 
		//can play most vids with single quotes in title but 
		//double quotes in title prevent plays
	});
	
}*/
