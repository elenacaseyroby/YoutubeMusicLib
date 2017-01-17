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
    // If no listens, hide data visualizations and show no data message.
    $('#data-visualization').hide();
    if(listens.length > 0){
      $('#data-visualization').show();
      $('#no-data-message').hide();
      // Get date range slider start_date.
      let start_date = new Date(listens[0]['Week']).getTime();
      const one_month_ago = subtract_months_from_today(1)
      if (start_date > one_month_ago){
        start_date = one_month_ago;
      }
      // Set date range slider date range.
      const today = new Date().getTime();
      $("#slider-range").slider({
        range: true,
        min: start_date / 1000,
        max: today / 1000,
        step: 86400,
        values: [ one_month_ago / 1000, today / 1000 ],
        slide: function(event,ui) {
          // Update date label on slide.
          $("#date-range-label").val(
            (new Date(ui.values[0] * 1000)).toDateString() +
            " - " +
            (new Date(ui.values[1] * 1000)).toDateString()
          ); 
        },
        stop: function(event,ui){
          // Reload charts on stop.
          start_date = convertSlidertoMySQLDate(
            ui_value=ui.values[0]);
          end_date = convertSlidertoMySQLDate(
            ui_value=ui.values[1], end_of_day=true);
          loadGenreTopTen(
            start_date=start_date, end_date=end_date);
          loadListensChart(
            start_date=start_date, end_date=end_date, redraw=true);
          loadGenreScatterPlot(
            start_date=start_date, end_date=end_date, redraw=true);
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
      loadGenreTopTen(start_date=start_date, end_date=end_date);
      loadListensChart(start_date=start_date, end_date=end_date);
      loadGenreScatterPlot(start_date=start_date, end_date=end_date);  
    }
  });
});


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
    // Create points object for plotly chart.
    const points = {
      x: [],
      y: [],
      type: 'scatter'
    };
    // Set points where x is the week and y is the listens count.
    let total_listens = 0;
    $.each(listens_data, function(index, item){
      points.x.push(item['Week']); 
      points.y.push(item['Listens']);
      total_listens = item['Listens'] + total_listens;
    });
    const chart_data = [points];
    const layout = {
        height: 400,
        width: 1000
    };
    // Render plotly chart.
    if(redraw){
      Plotly.purge('listens-by-week-chart');
      Plotly.newPlot('listens-by-week-chart', chart_data, layout);
    }else{
      Plotly.plot('listens-by-week-chart', chart_data, layout);
    }
    setTotalListensOverviewText(total_listens);
  });
}


function setTotalListensOverviewText(total_listens){
  // Set overview text.
  $("#overview-total-listens").empty();
  $("#overview-total-listens").append(
    "<b>Total listens:</b> " +
    total_listens.toString()
  );
  $('#insufficient-data-message').hide();
  if(total_listens < 100){
    $('#insufficient-data-message').show();
  }
}


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
    // Format points and regression line for plotly chart.
    const chart_data = prepareRegressionDataForPlotly(data=genres, point_label='Played, Liked');
    var layout = {
      height: 400,
      width: 480
    };
    // If redrawing chart (ex. after changing date range), 
    // clear old chart and render new chart.
    if(redraw){
      Plotly.purge('genre-scatter-plot');
      Plotly.newPlot('genre-scatter-plot', chart_data, layout);
    }else{
      Plotly.newPlot('genre-scatter-plot', chart_data, layout);
    }
    const correlation_coefficient = Math.abs(genres['regression_line']['m']);
    setGenreCorrelationOverviewText(correlation_coefficient)
  }); 
}


function prepareRegressionDataForPlotly(data, point_label){
  // Create points object for plotly chart.
  const points = {
    x: [],
    y: [],
    name: point_label,
    mode: 'markers'
  };
  let max_x_value = 0;
  $.each(data['regression_data'], function(index, genre){
    // Find biggest x value to calculate end point of regression line.
    if(genre[0] > max_x_value){
      max_x_value = genre[0];
    }
    // Set points by genre, where x is the listens count and y is the likes count.
    points.x.push(genre[0]);
    points.y.push(genre[1]);
  });
  // Calculate start and end points of regression line.
  const start_x = 0;
  const start_y = data['regression_line']['b'];
  const end_x = max_x_value;
  const end_y = (
    data['regression_line']['m'] * end_x +
    data['regression_line']['b']);
  // Set correlation strength label for plotly chart legend.
  const correlation_coefficient = Math.abs(data['regression_line']['m']);
  const strength_label = getCorrelationStrengthLabel(correlation_coefficient);
  // Set regression line start and end points for plotly chart.
  const regression_line = {
    x: [start_x, end_x],
    y: [start_y, end_y],
    name: 'Correlation (' + strength_label + ')',
    mode: 'lines'
  };
  // Format data for plotly chart.
  const chart_data = [points, regression_line];
  return chart_data;
}


function setGenreCorrelationOverviewText(correlation_coefficient){
  if(correlation_coefficient >= .7){
    strength_overview = "a great";
  }else if(correlation_coefficient < .7 && correlation_coefficient > .3){
    strength_overview = "a good";
  }else if(correlation_coefficient <= .3 && correlation_coefficient > .05){
    strength_overview = "an okay";
  }else{
    strength_overview = "a poor";
  }
  // Set overview text.
  $("#overview-genre-correlation").empty();
  $("#overview-genre-correlation").append(
    "For this date range, <b>genre is " +
    strength_overview +
    " indicator</b> of whether you will like a video.");
}


function getCorrelationStrengthLabel(correlation_coefficient){
  let strength_label = "Weak"
  if(correlation_coefficient >= .7){
    strength_label = "Strong";
  }else if(correlation_coefficient < .7 && correlation_coefficient > .3){
    strength_label = "Moderate";
  }
  return strength_label;
}


function convertSlidertoMySQLDate(ui_value, end_of_day=false){
  const year = (new Date(ui_value * 1000).getFullYear()).toString();
  let month = (Number(new Date(ui_value * 1000).getMonth()) + 1).toString();
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


function subtract_months_from_today(number_of_months){
  let new_date = new Date();
  new_date.setMonth(new Date().getMonth() - number_of_months);
  new_date = new_date.getTime();
  return new_date
}
