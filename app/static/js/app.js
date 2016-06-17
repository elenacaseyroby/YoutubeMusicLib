/*
bugs:
- doesn't record multiple plays at top of page
- sometimes takes two page loads to load iframe
- all vids play on page load. has something to do with event.target.B = true.  should = false so it doesn't autoplay!

find some way so if a vid is played all the other ytplayer instances are set to stop play
*/
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
			maxResults: 5,
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
		});
		$("#searchbar").trigger("search-done");
	});
	
});

$('#searchbar').bind('search-done', function(event){
	// 2. This code loads the IFrame Player API code asynchronously.

	var tag = document.createElement('script');
	tag.src = "https://www.youtube.com/iframe_api";
	var firstScriptTag = document.getElementsByTagName('script')[0];
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
	console.log("triggered!");
	//because this has already been done after first load, 
	//the onYoutubeIframeAPIReady command isn't called for future searches
	//$('search-done').trigger('load-iframes');

});



// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.

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

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
//~*~*~INSTRUCTIONS HERE~*~*~//

	//autoplay first vid

//~*~*~*~*~*~*~*~*~*~*~*~*~*~//
	/*
	alt option: play iframe with the same title as the first item in vid_info list:
	iframe = event.target.a.outerHTML;//could also do w 
	var re = '(.*)title="YouTube (.*)" w(.*)';
	var title = iframe.match(re);
	if (vid_info[0].title == title[2]){
		event.target.playVideo();
	}*/

	url = event.target.v.videoUrl;
	var re = '(.*)?v=(.*)';
	var id = url.match(re);
	console.log(url);
	if (vid_info[0].id == id[2]){
		event.target.playVideo();
	}

}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for two seconds and then record title 
//	  at top of page.
//var done = false;
function onPlayerStateChange(event) { //stops listening after first play

//~*~*~INSTRUCTIONS HERE~*~*~//

	//if vid is played, set other vids to paused and record the play

//~*~*~*~*~*~*~*~*~*~*~*~*~*~//
	//if vid is playing from first 10 secs, save to list after 10 seconds
	if(event.data == YT.PlayerState.PLAYING && event.target.v.currentTime <=10.0){
		setTimeout(recordPlay(event.target.a.outerHTML), 10000);
	}



}
function recordPlay(iframe) {


	//everytime you press play it goes here 3x and everytime you pause it goes here 1x
	//var name = counter.toString();
	//$(name).prepend("play_")

	//$("<div></div>").attr('id',name).appendTo('#record_plays');
	var re = '(.*)title="YouTube(.*)" w(.*)';
	var title = iframe.match(re);
	//alert(title);
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