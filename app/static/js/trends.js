$(function(){
  //fill listens over time graph
  var listens = $.ajax({
    type: 'GET'
    , url: '/getlistensbydate'
    ,dataType: 'json'
  }).done(function(listens){

    var start_date = new Date(listens[0]['Week']).getTime();
    //var min = start_date/1000;
    //var max = new Date().getTime()/1000;
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
        end_date = convertSlidertoMySQLDate(ui.values[1]);
        listensByWeekChart(start_date = start_date, end_date = end_date, redraw = true);
        genresScatterPlot(start_date = start_date, end_date = end_date, redraw = true);
      }
    });
      
    $( "#date-range-text" ).val( (new Date($( "#slider-range" ).slider( "values", 0 )*1000).toDateString()) +
      " - " + (new Date($( "#slider-range" ).slider( "values", 1 )*1000)).toDateString());
    start_date = convertSlidertoMySQLDate($( "#slider-range" ).slider( "values", 0 ));
    end_date = convertSlidertoMySQLDate($( "#slider-range" ).slider( "values", 1 ));
    listensByWeekChart(start_date = start_date, end_date = end_date);
    genresScatterPlot(start_date = start_date, end_date = end_date);
  });
});

function genresScatterPlot(start_date = null, end_date = null, redraw = false){
  //fill scatter plot
  var data = $.ajax({//can add morning, afternoon, night later
    type: 'GET'
    ,url: '/getgenredata'
    ,data: {'start_date': start_date
      ,'end_date': end_date
    }
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
    var y = genres['line_best_fit']['m']*genres['regression_data'][0][0]+genres['line_best_fit']['b']
    correlation_coefficient = Math.abs(genres['line_best_fit']['m']);
    if(correlation_coefficient >= .7){
      strength = " (Strong)";
    }else if(correlation_coefficient<.7 && correlation_coefficient>.3){
      strength = " (Moderate)";
    }else{
      strength = " (Weak)";
    }
    console.log(correlation_coefficient);
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
    $("#genre-list").empty();
    $.each(genres['top_genres'], function(index, item){
      $("#genre-list").append('<li>'+item+'</li>')
    });
  });
}

function listensByWeekChart(start_date = null, end_date = null, redraw = false){
//fill listens over time graph
  var listens = $.ajax({
    type: 'GET'
    , url: '/getlistensbydate'
    , data: {'start_date': start_date
      ,'end_date': end_date
    }
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
  });
}

function convertSlidertoMySQLDate(ui_value){
  var year = (new Date(ui_value *1000).getFullYear()).toString();
  var month = (Number((new Date(ui_value *1000).getMonth()))+1).toString();
  if (month.length <2){
    month = "0"+month;
  }
  var day = (new Date(ui_value *1000).getDate()).toString();
  if (day.length <2){
    day = "0"+day;
  }
  var date = year+"-"+month+"-"+day+" 00:00:00";
  return date;
}



