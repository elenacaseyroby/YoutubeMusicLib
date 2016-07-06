var vid_info = [];
var players = [];
var searches_per_page_load = 0;

function YoutubeVideo(id, title){
	this.id = id;
	this.title = title;
}

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
			$("#results").empty();

			var results = response.result;
			i = 0;
			$.each(results.items, function(index, item){
				//stores title and video in global array
				vid_info [i] = new YoutubeVideo(item.snippet.title, item.id.videoId);
				i++;
			});
			if (searches_per_page_load < 1){
				$("#searchbar").trigger("search-done");//inside request to trigger AFTER youtube api returns data
				searches_per_page_load++;

			}else{
				onYouTubeIframeAPIReady();
			}
		});	
	});	
});

$('#searchbar').bind('search-done', function(event){
	//load the IFrame Player API code asynchronously.
	
	var tag = document.createElement('script');
	tag.src = "https://www.youtube.com/iframe_api";
	var firstScriptTag = document.getElementsByTagName('script')[0];
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);


});

// create <iframe> (and YouTube player) for each vid_info.id
function onYouTubeIframeAPIReady() {

	if(vid_info.length > 0 && vid_info[0] != null){
		var i = 0;
		$.each(vid_info, function(index, item){

			var name = i.toString();

			$("<div></div>").attr('id',name).appendTo('#results');

			players[i] = new YT.Player(name, {
	  			height: '390',
			  	width: '640',
			  	videoId: item.id,
			  	title: item.title,
			  	events: {
			    	'onReady': onPlayerReady,
			    	'onStateChange': onPlayerStateChange
			  	}
			});
		
			i++;
		});
	}
}

// API calls this function when the player's state changes
function onPlayerStateChange(event) { 
	//if vid is playing from first 2 secs, save to list after 1 second
	if(event.data == YT.PlayerState.PLAYING && event.target.v.currentTime <= 2.0){
		setTimeout(savePlay(event), 1000);
	}
}

//records play at top of page
function savePlay(event) {
	//would make it save stop time, but since mult vids can play at once, that 
	//will have to be a later feature.
	
	//get data to fill db
	title = event.target.v.videoData.title;
	title = title.toString();
	youtube_id = event.target.v.videoData.video_id;
	youtube_id = youtube_id.toString();
	time_start = event.target.getCurrentTime();
	time_start = time_start.toFixed(5);
	time_end = 100.50.toFixed(5);

	//send data to view.py
	$.ajax({
		type: "POST",
	    url: '/postlistens',
	    data: {user_id: "1", title: title, youtube_id: youtube_id, time_start: time_start, time_end: time_end}
    });

	$("#record_plays").append(title).append("<br>");
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