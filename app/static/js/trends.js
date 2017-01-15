$(function(){
  // Get user's listens over time.
  const listens = $.ajax({
    type: 'GET',
    url: '/trends',
    data: {
      'data-type': 'listens',
      'chart-type': 'time'
    },
    dataType: 'json'
  }).done(function(listens){
    $('#data-visualization').hide();
    if(listens.length > 1){
      $('#data-visualization').show();
      $('#no-data-message').hide();
      /* Slider start_date set to date of user's first listen.  
      *  If date of first listen was within last month, 
      *  set slider start_date to one_month_ago. */
      let start_date = new Date(listens[0]['Week']).getTime();
      const today = new Date();
      let one_month_ago = new Date();
      one_month_ago.setMonth(today.getMonth() - 1);
      one_month_ago = one_month_ago.getTime();
      if (start_date > one_month_ago){
        start_date = one_month_ago;
      }
      /* Set date range slider date range, update date label on slide
      *  and reload charts on stop. */
      $("#slider-range").slider({
        range: true,
        min: start_date/1000,
        max: today.getTime()/1000,
        step: 86400,
        values: [ one_month_ago/1000, today.getTime() / 1000 ],
        slide: function(event,ui) {
          $("#date-range-label").val(
            (new Date(ui.values[0] * 1000)).toDateString() +
            " - " +
            (new Date(ui.values[1] * 1000)).toDateString()
          ); 
        },
        stop: function(event,ui){
          start_date = convertSlidertoMySQLDate(
            ui_value=ui.values[0]);
          end_date = convertSlidertoMySQLDate(
            ui_value=ui.values[1],
            end_of_day=true);
          loadListensChart(
            start_date = start_date,
            end_date = end_date,
            redraw = true);
          loadGenreScatterPlot(
            start_date = start_date,
            end_date = end_date,
            redraw = true);
          loadGenreTopTen(
            start_date = start_date,
            end_date = end_date);
        }
      }); 
      // Set date label and load charts on page load.
      $("#date-range-label").val(
        (new Date($("#slider-range").slider("values", 0) * 1000)).toDateString() +
        " - " +
        (new Date($("#slider-range").slider("values", 1) * 1000)).toDateString()
      );
      start_date = convertSlidertoMySQLDate(
        ui_value=$("#slider-range").slider("values", 0 ));
      let end_date = convertSlidertoMySQLDate(
        ui_value=$("#slider-range").slider("values", 1 ), 
        end_of_day=true);
      loadListensChart(start_date = start_date, end_date = end_date);
      loadGenreScatterPlot(start_date = start_date, end_date = end_date);
      loadGenreTopTen(start_date = start_date, end_date = end_date);
      
    }
  });
});

function initializeDateRangeSlider(listens){ //DATE RANGE LABEL NOT RENDERING
      
}

function loadGenreScatterPlot(start_date = null, end_date = null, redraw = false){
  let correlation_coefficient = 0;
  const genres = $.ajax({
    type: 'GET'
    ,url: '/trends'
    ,data: {'data-type': 'genres'
      , 'chart-type': 'linear regression'
      , 'start-date': start_date
      , 'end-date': end_date}
    ,dataType: 'json'
  }).done(function(genres){
    const points = {
      x: [],
      y: [],
      name: 'Likes v. Listens',
      mode: 'markers'
    };
    $.each(genres['regression_data'], function(index, item){
      points.x.push(item[0]);
      points.y.push(item[1]);    
    });
    //find start and end points of regression line
    const x = genres['regression_data'][0][0]
    const y = genres['regression_line']['m'] * x + genres['regression_line']['b']
    const correlation_coefficient = Math.abs(genres['regression_line']['m']);
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
    const regression_line = {
      x: [0, x],
      y: [0, y],
      name: 'Correlation' + strength,
      mode: 'lines'
    };
    const data = [points, regression_line];
    const layout = {
      title:'Genres',
      height: 400,
      width: 480
    };
    if(redraw){
      Plotly.purge('genre-scatter-plot');
      Plotly.newPlot('genre-scatter-plot', data, layout);
    }else{
      Plotly.newPlot('genre-scatter-plot', data, layout);
    }
    $("#overview-genre-correlation").empty();
    $("#overview-genre-correlation").append(overview_strength);
  }); 
}
function loadGenreTopTen(start_date = null, end_date = null){
  const top_genres = $.ajax({//can add morning, afternoon, night later
    type: 'GET'
    ,url: '/trends'
    ,data: {'data-type': 'genres'
      , 'chart-type': 'top list'
      , 'start-date': start_date
      , 'end-date': end_date}
    ,dataType: 'json'
  }).done(function(top_genres){
    $("#genre-top-ten").empty();
    $("#overview-genre-top-ten").empty();
    $("#genre-top-ten-header").empty();
    if (top_genres.length == 0){
      overview_strength = "We don't know enough to give detailed feedback on your listening habits.  Change the date range or <b>listen to more videos <a href='play'>here</a></b>!";
    }
    $.each(top_genres, function(index, genre){
      if(genre['listens'] > 0){
        if(index == 0){
          $("#genre-top-ten-header").append("<h4><b>Most Listened Genres</b></h4>");
          $("#overview-genre-top-ten").append("<b>Your most listened genres for this date range are:</b> ");
        }
        $("#genre-top-ten").append('<li>'+genre['name']+'</li>')
        if(index>0){
          $("#overview-genre-top-ten").append(", ");
        }
        $("#overview-genre-top-ten").append(genre['name']);
      }
    });
  });
}
function loadListensChart(start_date = null, end_date = null, redraw = false){
//fill listens over time graph
  var total_listens = 0;
  var listens = $.ajax({
    type: 'GET',
    url: '/trends',
    data: {
      'data-type': 'listens',
      'chart-type': 'time',
      'start-date': start_date,
      'end-date': end_date
    },
    dataType: 'json'
  }).done(function(listens){
    var points = {
      x: [],
      y: [],
      type: 'scatter'
    };
    $.each(listens, function(index, item){
      points.x.push(item['Week']); 
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
      Plotly.purge('listens-by-week-chart');
      Plotly.newPlot('listens-by-week-chart', data, layout);
    }else{
      Plotly.plot('listens-by-week-chart', data, layout);
    }
    $("#overview-total-listens").empty();
    $("#overview-total-listens").append("<b>Total listens:</b> "+total_listens.toString());
    $('#insufficient-data-message').hide();
    if(total_listens<100){
      $('#insufficient-data-message').show();
    }
  });
}

function convertSlidertoMySQLDate(ui_value, end_of_day=false){
  const year = (new Date(ui_value *1000).getFullYear()).toString();
  let month = (Number((new Date(ui_value *1000).getMonth()))+1).toString();
  if (month.length <2){
    month = "0"+month;
  }
  let day = (new Date(ui_value *1000).getDate()).toString();
  if (day.length <2){
    day = "0"+day;
  }
  if(end_of_day){
    return year+"-"+month+"-"+day+" 23:59:59";
  }else{
    return year+"-"+month+"-"+day+" 00:00:00";
  }
}