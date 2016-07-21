function lastFMGetSimilar(trackName, artistName, callBack) {
    console.log("trackName: ", trackName);
    console.log("artistName: ", artistName);

    $.ajax({
        url: "http://ws.audioscrobbler.com/2.0/",
        data: "method=track.getsimilar&" +
            "artist=" +
            artistName +
            "&" +
            "track=" +
        	trackName +
            "&" +
        	"api_key=175f6031e4788e29a9ff3961219ffc06&" +
        	"format=json",
        dataType: "jsonp"
        success: function (data) {
            for (var i = 0; i < data.similartracks.track.length, i++) {
                console.log(i + " - " + data.similartracks.track[i]);
            }
        }
    });
    callBack();
}