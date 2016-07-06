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
			$("#results").empty();

			var results = response.result;
			i = 0;
			$.each(results.items, function(index, item){
				//stores title and video in global array
				vid_info [i] = new YoutubeVideo(item.id.videoId, item.snippet.title);
				id = vid_info[i].id.toString();
				title = vid_info[i].title.toString();
				play_button = "<br>"+title+"<button type='button' id='"+id+"' value='"+id+","+title+"' onclick='playVideo('"+id+"','"+title+"')'> Play </button><br>";
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

/*

$().onClick(function (){
	console.log("hi!");
	//load iframe api scripts
	var tag = document.createElement('script');
	tag.src = "https://www.youtube.com/iframe_api";
	var firstScriptTag = document.getElementsByTagName('script')[0];
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

	console.log($(this).attr('value'));
});*/

function playVideo(id, title) {
	var tag = document.createElement('script');
	tag.src = "https://www.youtube.com/iframe_api";
	var firstScriptTag = document.getElementsByTagName('script')[0];
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

	play.id = id;
	play.title = title;
}

function onYouTubeIframeAPIReady() {

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


function init(){
	//test key:
	gapi.client.setApiKey("AIzaSyB8Myy78KEAuztudBxlM7ZwMbVnu7VQZpA");
	//live:
	//gapi.client.setApiKey("AIzaSyBb7dtTX5v8gJN-tD8Mbm8jCdBqlXIeY2k");
	
	gapi.client.load("youtube","v3", function(){
		//youtube api is ready
	});

}