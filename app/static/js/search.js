//errors: 
//onclick = playVideo is triggering syntax error (dropped ;)
//don't think it's going in onYouTubeIframeAPIReady() ~~ no iframe rendered


function YoutubeVideo(id, title){
	this.id = id;
	this.title = title;
}
var vid_info = [];
play = new YoutubeVideo("98T3lkkdKqk","Teenage Fanclub - Bandwagonesque - Full Album - 1991");

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
				vid_info [i] = new YoutubeVideo(item.id.videoId, item.snippet.title);
				id = vid_info[i].id.toString();
				title = vid_info[i].title.toString();
				play_button = "<br>"+title+"<button type='button' id='"+id+"' value='"+id+","+title+"' onclick=\"playVideo('"+id+"','"+title+"')\"> Play </button><br>";
				$("#selectedvideos").append(play_button);
				i++;
			});
			/*
			//pass to views.py
			console.log(vid_info[0]);
			$.ajax({
				type: "POST",
			    url: '/printplaylist',
			    data: {vid1: JSON.stringify({id: vid_info[0].id, title: vid_info[0].title}),
						vid2: JSON.stringify({id: vid_info[1].id, title: vid_info[1].title}),
						vid3: JSON.stringify({id: vid_info[2].id, title: vid_info[2].title})}
		    });
			*/
		});	
	});	
});


/* taken care of in button
$().click(function (){
	console.log($(this).val());
	console.log("hi!");
	//load iframe api scripts
	var tag = document.createElement('script');
	tag.src = "https://www.youtube.com/iframe_api";
	var firstScriptTag = document.getElementsByTagName('script')[0];
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

	//console.log($(this).attr('value'));
});*/

function playVideo(id, title) {
	var tag = document.createElement('script');
	tag.src = "https://www.youtube.com/iframe_api";
	var firstScriptTag = document.getElementsByTagName('script')[0];
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

	play.id = id;
	play.title = title;
	console.log("play vid!");
}

function onYouTubeIframeAPIReady() {

	console.log("vid info");
	console.log(play.id);
	console.log(play.title);

	$("<div></div>").attr('id','rendered_iframe').appendTo('#iframe');

	player = new YT.Player('rendered_iframe', {
		height: '390',
	  	width: '640',
	  	videoId: play.id,
	  	title: play.title,
	  	events: {
	    	'onReady': onPlayerReady,
	    	'onStateChange': onPlayerStateChange
	  	}
	});
		
}

function onPlayerReady(event) {

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