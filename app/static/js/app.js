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
			$("#results").empty();

			var results = response.result;
			$.each(results.items, function(index, item){
				//ideally would pass vars into youtubeiframe.html and then append the 
				//filled html onto the #results element in index.html
				$("#results").append('<div class="vid"><h2>'+item.snippet.title+'</h2><iframe class="video w100" width="640" height="360" src="//www.youtube.com/embed/'+item.id.videoId+'" frameborder="0" allowfullscreen></iframe></div>');
				
			});
		});
	});
});


function init(){
	//test key:
	gapi.client.setApiKey("AIzaSyB8Myy78KEAuztudBxlM7ZwMbVnu7VQZpA");
	//live:
	//gapi.client.setApiKey("AIzaSyBb7dtTX5v8gJN-tD8Mbm8jCdBqlXIeY2k");
	
	gapi.client.load("youtube","v3", function(){
		//youtube api is ready
	});
}