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
          loadGenreTopTen(
            start_date = start_date,
            end_date = end_date);
          loadListensChart(
            start_date = start_date,
            end_date = end_date,
            redraw = true);
          loadGenreScatterPlot(
            start_date = start_date,
            end_date = end_date,
            redraw = true);
        }
      }); 
      // Set date label and load charts on page load.
      $("#date-range-label").val(
        (
          new Date($("#slider-range").slider("values", 0) * 1000)
        ).toDateString() +
        " - " +
        (
          new Date($("#slider-range").slider("values", 1) * 1000)
        ).toDateString()
      );
      start_date = convertSlidertoMySQLDate(
        ui_value=$("#slider-range").slider("values", 0 ));
      let end_date = convertSlidertoMySQLDate(
        ui_value=$("#slider-range").slider("values", 1 ), 
        end_of_day=true);
      loadGenreTopTen(start_date=start_date, end_date=end_date);
      loadListensChart(start_date=start_date, end_date=end_date);
      loadGenreScatterPlot(start_date=start_date, end_date=end_date);
      
    }
  });
});

function loadGenreScatterPlot(start_date=null, end_date=null, redraw=false){
  const genres = $.ajax({
    type: 'GET',
    url: '/trends',
    data: {'data-type': 'genres',
      'chart-type': 'linear regression',
      'start-date': start_date,
      'end-date': end_date},
    dataType: 'json'
  }).done(function(genres){
    // Set data points for scatter plot, where x is listens and y is likes.
    var points = {
      x: [],
      y: [],
      name: 'Played, Liked',
      mode: 'markers'
    };
    $.each(genres['regression_data'], function(index, genre){
      points.x.push(genre[0]);
      points.y.push(genre[1]);
    });
    // Find x,y of endpoint of regression line, where x will be largest x value.
    const regression_line_x = genres['regression_data'][0][0];
    const regression_line_y = (
      genres['regression_line']['m'] * regression_line_x +
      genres['regression_line']['b']);
    /* Set correlation strength descriptors for chart and overview 
    *  based on the correlation coefficient.*/
    const correlation_coefficient = Math.abs(genres['regression_line']['m']);
    let strength_label = " (Weak)";
    let strength_overview = "an ok";
    if(correlation_coefficient < .05){
      strength_label = " (Weak)";
      strength_overview = "a poor";
    }
    else if(correlation_coefficient >= .7){
      strength_label = " (Strong)";
      strength_overview = "a great";
    }else if(correlation_coefficient < .7 && correlation_coefficient > .3){
      strength_label = " (Moderate)";
      strength_overview = "a good";
    }
    // Set regression line start and end points for plotly chart.
    const regression_line = {
      x: [0, regression_line_x],
      y: [genres['regression_line']['b'], regression_line_y],
      name: 'Correlation' + strength_label,
      mode: 'lines'
    };
    // Fill plotly chart and render.
    var data = [points, regression_line];
    var layout = {
      height: 400,
      width: 480
    };
    if(redraw){
      Plotly.purge('genre-scatter-plot');
      Plotly.newPlot('genre-scatter-plot', data, layout);
    }else{
      Plotly.newPlot('genre-scatter-plot', data, layout);
    }
    // Set overview text.
    $("#overview-genre-correlation").empty();
    $("#overview-genre-correlation").append(
      "For this date range, <b>genre is " +
      strength_overview +
      " indicator</b> of whether you will like a video.");
  }); 
}
function loadGenreTopTen(start_date=null, end_date=null){
  const top_genres = $.ajax({
    type: 'GET',
    url: '/trends',
    data: {'data-type': 'genres',
      'chart-type': 'top list',
      'start-date': start_date,
      'end-date': end_date
    },
    dataType: 'json'
  }).done(function(top_genres){
    // Clear previous top 10 and overview.
    $("#genre-top-ten").empty();
    $("#overview-genre-top-ten").empty();
    $("#genre-top-ten-header").show();
    $("#overview-genre-top-ten").append(
      "<b>Your most listened genres for this date range are:</b> ");
    $.each(top_genres, function(index, genre){
      if(genre['played-videos-count'] > 0){
        // Render top 10 list.
        $("#genre-top-ten").append('<li>'+genre['name']+'</li>')
        // Set overview text.
        if(index > 0){
          $("#overview-genre-top-ten").append(", ");
        }
        $("#overview-genre-top-ten").append(genre['name']);
      }else{
        $("#genre-top-ten-header").hide()
        $("#overview-genre-top-ten").empty()
      }
    });
  });
}
function loadListensChart(start_date=null, end_date=null, redraw=false){
  const listens_data = $.ajax({
    type: 'GET',
    url: '/trends',
    data: {
      'data-type': 'listens',
      'chart-type': 'time',
      'start-date': start_date,
      'end-date': end_date
    },
    dataType: 'json'
  }).done(function(listens_data){
    // Set data points for listens over time chart.
    const points = {
      x: [],
      y: [],
      type: 'scatter'
    };
    let total_listens = 0;
    $.each(listens_data, function(index, item){
      points.x.push(item['Week']); 
      points.y.push(item['Listens']);
      total_listens = item['Listens'] + total_listens;
    });
    // Fill plotly chart and render.
    const chart_data = [points];
    const layout = {
        height: 400,
        width: 1000
    };
    if(redraw){
      Plotly.purge('listens-by-week-chart');
      Plotly.newPlot('listens-by-week-chart', chart_data, layout);
    }else{
      Plotly.plot('listens-by-week-chart', chart_data, layout);
    }
    // Set overview text.
    $("#overview-total-listens").empty();
    $("#overview-total-listens").append(
      "<b>Total listens:</b> " +
      total_listens.toString()
      );
    $('#insufficient-data-message').hide();
    if(total_listens<100){
      $('#insufficient-data-message').show();
    }
  });
}

function convertSlidertoMySQLDate(ui_value, end_of_day=false){
  const year = (new Date(ui_value * 1000).getFullYear()).toString();
  let month = (Number((new Date(ui_value * 1000).getMonth())) + 1).toString();
  if (month.length < 2){
    month = "0" + month;
  }
  let day = (new Date(ui_value * 1000).getDate()).toString();
  if (day.length < 2){
    day = "0" + day;
  }
  if(end_of_day){
    return year + "-" + month + "-" + day + " 23:59:59";
  }else{
    return year + "-" + month + "-" + day + " 00:00:00";
  }
}