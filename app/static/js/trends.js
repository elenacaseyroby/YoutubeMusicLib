$(function(){
  //fill listens over time graph
  var listens = $.ajax({
    type: 'GET'
    , url: '/trends'
    , data: {'data_type': 'listens',
             'chart_type': 'time'}
    ,dataType: 'json'
  }).done(function(listens){
    $("#range-slider-header").empty();
    $("#range-slider-header").append("You haven't listened to any videos yet!<br><br>  Listen <a href='/play'>here</a> to track trends in your listening habits :~)");
    if(listens.length > 0){
      $("#range-slider-header").empty();
      $("#range-slider-header").append("<h4><b>Select Date Range To See Trends In Your Listening</b></h4>");
      $("#overview-header").empty();
      $("#overview-header").append("<h4><b>Overview</b></h4>");
      var start_date = new Date(listens[0]['Week']).getTime();
      var last_month = new Date()
      last_month.setMonth(last_month.getMonth() - 1);
      last_month = last_month.getTime();
      if (start_date > last_month){
        start_date = last_month;
      }
      $( "#slider-range" ).slider({
        range: true,
        min: start_date/1000,
        max: new Date().getTime()/1000,
        step: 86400,
        values: [ last_month/1000, new Date().getTime() / 1000 ],
        slide: function(event,ui) {
          $( "#date-range-text" ).val( (new Date(ui.values[ 0 ] *1000).toDateString() ) + " - " + (new Date(ui.values[ 1 ] *1000)).toDateString() );  
        },
        stop: function(event,ui){
          start_date = convertSlidertoMySQLDate(ui.values[0]);
          end_date = convertSlidertoMySQLDate(ui.values[1], end = true);
          listensByWeekChart(start_date = start_date, end_date = end_date, redraw = true);
          genresScatterPlot(start_date = start_date, end_date = end_date, redraw = true);
          topGenresList(start_date = start_date, end_date = end_date);
        }
      }); 
      $( "#date-range-text" ).val( (new Date($( "#slider-range" ).slider( "values", 0 )*1000).toDateString()) +
        " - " + (new Date($( "#slider-range" ).slider( "values", 1 )*1000)).toDateString());
      start_date = convertSlidertoMySQLDate($( "#slider-range" ).slider( "values", 0 ));
      end_date = convertSlidertoMySQLDate($( "#slider-range" ).slider( "values", 1 ), end = true);
      listensByWeekChart(start_date = start_date, end_date = end_date);
      genresScatterPlot(start_date = start_date, end_date = end_date);
      topGenresList(start_date = start_date, end_date = end_date);
    }
  });
});

function genresScatterPlot(start_date = null, end_date = null, redraw = false){
  //fill scatter plot
  var correlation_coefficient = 0;
  var data = $.ajax({//can add morning, afternoon, night later
    type: 'GET'
    ,url: '/trends'
    ,data: {'data_type': 'genres'
      , 'chart_type': 'linear regression'
      , 'start_date': start_date
      , 'end_date': end_date}
    ,dataType: 'json'
  }).done(function(genres){
    var points = {
      x: [],
      y: [],
      name: 'Listens v. Likes',
      mode: 'markers'
    };
    $.each(genres['regression_data'], function(index, item){
      points.x.push(item[0]);
      points.y.push(item[1]);    
    });

    //find start and end points of regression line
    var x = genres['regression_data'][0][0]
    var y = genres['regression_line']['m'] * x + genres['regression_line']['b']
    correlation_coefficient = Math.abs(genres['regression_line']['m']);
    if(correlation_coefficient<.05){
      strength = " (Weak)";
      overview_strength = "For this date range, <b>genre is a poor indicator</b> of whether you will like a video.";
    }
    else if(correlation_coefficient >= .7){
      strength = " (Strong)";
      overview_strength = "For this date range, <b>genre is a great indicator</b> of whether you will like a video.";
    }else if(correlation_coefficient<.7 && correlation_coefficient>.3){
      strength = " (Moderate)";
      overview_strength = "For this date range, <b>genre is a good indicator</b> of whether you will like a video.";
    }else{
      strength = " (Weak)";
      overview_strength = "For this date range, <b>genre is an ok indicator</b> of whether you will like a video.";
    }

    var regression_line = {
      x: [0, x],
      y: [0, y],
      name: 'Correlation'+strength,
      mode: 'lines'
    };
    var data = [points, regression_line];

    var layout = {
      title:'Genres',
      height: 400,
      width: 480
    };
    if(redraw){
      Plotly.purge('genre-chart');
      Plotly.newPlot('genre-chart', data, layout);
    }else{
      Plotly.newPlot('genre-chart', data, layout);
    }
    $("#genre-correlation").empty();
    $("#genre-correlation").append(overview_strength);
  }); 
}
function topGenresList(start_date = null, end_date = null){
  var data = $.ajax({//can add morning, afternoon, night later
    type: 'GET'
    ,url: '/trends'
    ,data: {'data_type': 'genres'
      , 'chart_type': 'top list'
      , 'start_date': start_date
      , 'end_date': end_date}
    ,dataType: 'json'
  }).done(function(top_genres){
    console.log(top_genres)
    $("#genre-list").empty();
    $("#genre-list-overview").empty();
    $("#genre-list-header").empty();
    if (top_genres.length == 0){
      overview_strength = "We don't know enough to give detailed feedback on your listening habits.  Change the date range or <b>listen to more videos <a href='play'>here</a></b>!";
    }
    $.each(top_genres, function(index, genre){
      if(genre['listens'] > 0){
        if(index == 0){
          $("#genre-list-header").append("<h4><b>Most Listened Genres</b></h4>");
          $("#genre-list-overview").append("<b>Your most listened genres for this date range are:</b> ");
        }
        $("#genre-list").append('<li>'+genre['name']+'</li>')
        if(index>0){
          $("#genre-list-overview").append(", ");
        }
        $("#genre-list-overview").append(genre['name']);
      }
    });
  });

}

function listensByWeekChart(start_date = null, end_date = null, redraw = false){
//fill listens over time graph
  var total_listens = 0;
  var listens = $.ajax({
    type: 'GET'
    , url: '/trends'
    ,data: {'data_type': 'listens',
             'chart_type': 'time',
             'start_date': start_date,
             'end_date': end_date}
    ,dataType: 'json'
  }).done(function(listens){
    var points = {
      x: [],
      y: [],
      type: 'scatter'
    };
    $.each(listens, function(index, item){
      points.x.push(item['Week']); //make model return data in the same format for scatter as line plots. reduce confusion.
      points.y.push(item['Listens']);
      total_listens = item['Listens'] + total_listens;
    });
    var data = [points];
    var layout = {
        title: 'Listens By Week',
        height: 400,
        width: 1000
    };
    if(redraw){
      Plotly.purge('listens-by-week-graph');
      Plotly.newPlot('listens-by-week-graph', data, layout);
    }else{
      Plotly.plot('listens-by-week-graph', data, layout);
    }
    $("#total-listens").empty();
    $("#total-listens").append("<b>Total listens:</b> "+total_listens.toString());
    if(total_listens<100){
      $("#overview-note").empty();
      $("#overview-note").append('<i>Please note, "likes" are based on your listens. Listen to more music <a href="/play">here</a> for more detailed and accurate trends.</i>');
    }else{
      $("#overview-note").empty();
    }
  });
}

function convertSlidertoMySQLDate(ui_value, end = false){
  var year = (new Date(ui_value *1000).getFullYear()).toString();
  var month = (Number((new Date(ui_value *1000).getMonth()))+1).toString();
  if (month.length <2){
    month = "0"+month;
  }
  var day = (new Date(ui_value *1000).getDate()).toString();
  if (day.length <2){
    day = "0"+day;
  }
  if(end){
    var date = year+"-"+month+"-"+day+" 23:59:59";
  }else{
    var date = year+"-"+month+"-"+day+" 00:00:00";
  }
  return date;
}