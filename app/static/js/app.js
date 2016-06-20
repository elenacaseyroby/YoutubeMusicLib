var vid_info = [];
var players = [];
var counter = 0;

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
				vid_info [i] = {
					title: item.snippet.title,
					id: item.id.videoId
				};
				i++;
			});
			$("#searchbar").trigger("search-done");//inside request to trigger AFTER youtube api returns data
		});
	});	
});

$('#searchbar').bind('search-done', function(event){
	//load the IFrame Player API code asynchronously.
	
	var tag = document.createElement('script');
	tag.src = "https://www.youtube.com/iframe_api";
	var firstScriptTag = document.getElementsByTagName('script')[0];
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
	console.log("loaded iframe api code");

});

// create <iframe> (and YouTube player) for each vid_info.id
function onYouTubeIframeAPIReady() {
	console.log("enters onYouTubeIframeAPIReady");
	console.log(vid_info);

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
		console.log("instantiated player class for each vid");

	}

}


//API calls this function when the video player is ready
function onPlayerReady(event) {
//~*~*~INSTRUCTIONS HERE~*~*~//

	//autoplay first vid

//~*~*~*~*~*~*~*~*~*~*~*~*~*~//

	url = event.target.v.videoUrl;
	var re = '(.*)?v=(.*)';
	var id = url.match(re);
	if (vid_info[0].id == id[2]){
		event.target.playVideo();
	}
	/*
	alt option: play iframe with the same title as the first item in vid_info list:
	iframe = event.target.a.outerHTML;//could also do w 
	var re = '(.*)title="YouTube (.*)" w(.*)';
	var title = iframe.match(re);
	if (vid_info[0].title == title[2]){
		event.target.playVideo();
	}*/

}

// API calls this function when the player's state changes
function onPlayerStateChange(event) { //stops listening after first play

//~*~*~INSTRUCTIONS HERE~*~*~//

	//if vid is played, set other vids to paused and record the play

//~*~*~*~*~*~*~*~*~*~*~*~*~*~//
	//if vid is playing from first 2 secs, save to list after 1 second
	if(event.data == YT.PlayerState.PLAYING && event.target.v.currentTime <= 2.0){
		setTimeout(recordPlay(event.target.a.outerHTML), 10000);
	}
}

//records play at top of page
function recordPlay(iframe) {

	var re = '(.*)title="YouTube(.*)" w(.*)';
	var title = iframe.match(re);
	$("#record_plays").append(title[2]).append("<br>");
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