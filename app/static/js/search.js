number_of_plays = 0;

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
				numbering = (i+1).toString();
				play_button = "<br>"+numbering+". "+title+"<button type='button' id='"+id+"' value='"+id+","+title+"' onclick=\"playVideo('"+id+"','"+title+"')\"> Play </button><br>";
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

function playVideo(id, title) {
	play.id = id;
	play.title = title;
	if(number_of_plays<1){
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
	  	videoId: play.id,
	  	title: play.title,
	  	events: {
	    	'onStateChange': onPlayerStateChange
	  	}
	});
	number_of_plays++;
		
}

function onPlayerStateChange(event) { 
	//if vid is playing from first 2 secs, save to list after 1 second
	if(event.data == YT.PlayerState.PLAYING && event.target.v.currentTime <= 2.0){
		setTimeout(savePlay(event), 1000);
	}
}

//records play at top of page
function savePlay(event) {
	//todo
	//save stop time

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