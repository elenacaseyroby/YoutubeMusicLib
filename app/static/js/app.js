var vid_info = [];
var players = [];

$(function(){
	$("#searchbar").on("submit", function(e) {
		e.preventDefault();
		//prepare the request		
		var request = gapi.client.youtube.search.list({
			part: "snippet",
			type: "video",
			maxResults: 5,
			order: "relevance",
			q: encodeURIComponent($("#keywords").val()).replace(/%20/g, "+")
		});
		//execute the request
		request.execute(function(response){
			//console.log(response);
			$("#results").empty();

			var results = response.result;
			i = 0;
			$.each(results.items, function(index, item){
				//ideally would pass vars into youtubeiframe.html and then append the 
				//filled html onto the #results element in index.html
				//$("#results").append('<div class="vid"><h2>'+item.snippet.title+'</h2><iframe class="video w100" width="640" height="360" src="//www.youtube.com/embed/'+item.id.videoId+'" frameborder="0" allowfullscreen></iframe></div>');
				
				//stores title and video in global array
				vid_info [i] = {
					title: item.snippet.title,
					id: item.id.videoId

				};
				console.log(vid_info);

				i++;

			});
		});
		$("#searchbar").trigger("search-done");
	});
	
});

$('#searchbar').bind('search-done', function(e){
	// 2. This code loads the IFrame Player API code asynchronously.
	var tag = document.createElement('script');
	tag.src = "https://www.youtube.com/iframe_api";
	var firstScriptTag = document.getElementsByTagName('script')[0];
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
	console.log("triggered!");

});



// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.

function onYouTubeIframeAPIReady() {
	console.log("made it!");
	console.log(vid_info);
	


	if(vid_info.length > 0 && vid_info[0] != null){
		var i = 0;
		$.each(vid_info, function(index, item){


			console.log("vid info in for each -");
			console.log(item.id);

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
		console.log(players);
	}
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
	event.target.playVideo();
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
var done = false;
function onPlayerStateChange(event) {
if (event.data == YT.PlayerState.PLAYING && !done) {
	console.log(event);
	setTimeout(recordPlay(event.target.a.outerHTML), 2000);
	done = true;
}
}
function recordPlay(iframe) {
	//event
	var $this = $(this);
	$(iframe).appendTo("#record_plays");
	//console.log();
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