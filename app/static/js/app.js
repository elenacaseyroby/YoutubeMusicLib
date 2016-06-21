//tried to use loadVideoById(item.id), but for some reason you can't re-use the player 
//instances without re-calling onYouTubeIframeAPIReady() 
//if you do you get error TypeError: this.a.contentWindow is null or 
// www-widgetapi.js:98 Uncaught TypeError: Cannot read property 'postMessage' of null
//then tried to remove and re-add youtube iframe api script to trigger
//but it didn't work. Now I'm going to try to reload the whole html page on second search

var vid_info = [];
var players = [];
var counter = 0;
var searches_per_page_load = 0;

$(function(){
	$("#searchbar").on("submit", function(event) {
		event.preventDefault();
		console.log(searches_per_page_load);
		console.log(players);
		console.log("made it to search");
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
			if (searches_per_page_load < 1){
				console.log("made it in if");
				$("#searchbar").trigger("search-done");//inside request to trigger AFTER youtube api returns data
				searches_per_page_load++;

			}else{//remove and re add javascript files so that it loads iframe api again to trigger onYouTubeIframeAPIReady
				updateVidIDs(event);
				/*
				$('script').each(function() {
				    //if ($(this).attr('src') != '//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js' && $(this).attr('src') != 'https://apis.google.com/js/client.js?onload=init') {
				        console.log("GOT HERE");//goes through for each script
				        var old_src = $(this).attr('src');
				        $(this).attr('src', '');
				        setTimeout(function(){ $(this).attr('src', old_src + '?'+new Date()); }, 10);
				    //}
				});*/
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
	console.log("loaded iframe api code");
	if (searches_per_page_load < 1){

		searches_per_page_load++;

	}else{
		updateVidIDs();
	}

});

// create <iframe> (and YouTube player) for each vid_info.id
function onYouTubeIframeAPIReady() {

//error is related to using the player objects without callthing this function again

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
		console.log(players);

	}

}

function updateVidIDs(event){

	var player_counter = 0;
	$.each(vid_info, function(index, item){
		console.log("player");
		console.log(players);
		console.log(event);
		//players[player_counter].loadVideoById({videoId: item.id});
		players[player_counter].loadVideoById(item.id);
		player_counter++;
	});
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