$.getScript("static/js/lastfm.js", function(){
});
var number_of_plays = 0;
var vids_up_next = [];
function YoutubeVideo(id, title = "", channel_id = "", description = ""){
	this.id = id;
	this.title = title;
	this.channel_id = channel_id;
	this.description = description;
}

current_iframe_video = new YoutubeVideo("98T3lkkdKqk");

//loads iframe api scripts on first play and calls iframe api directly on additional plays
function playVideo(id, current_playlist_tracks = null, title=null, channel_id=null, description=null) {
	current_iframe_video.id = id;
	if(current_playlist_tracks){
		vids_up_next = current_playlist_tracks;
	}
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
    	onYouTubeIframeAPIReady();
	  	number_of_plays++;
	}
}
function onYouTubeIframeAPIReady() {
	$("#iframe").empty();

	$("<div></div>").attr('id','rendered_iframe').appendTo('#iframe');

	player = new YT.Player('rendered_iframe', {
		height: '390',
	  	width: '640',
	  	videoId: current_iframe_video.id,
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
function savePlay(event, end = false){
		youtube_id = current_iframe_video.id;
		listened_to_end = 0;
		if(end){
			listened_to_end = 1;
		}
		$.ajax({
			type: 'POST',
			url: '/listens',
			data: {'youtube_id': youtube_id,
				 'listened_to_end': listened_to_end}
	    });
}