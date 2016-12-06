$(function(){
  //fill listens over time graph
  var listens = $.ajax({
    type: 'GET'
    , url: '/getlistensbydate'
    ,dataType: 'json'
  }).done(function(listens){
    start_date = new Date(listens[0]['Week']).getTime();
    $( "#slider-range" ).slider({
      range: true,
      min: start_date / 1000,
      max: new Date().getTime() / 1000,
      step: 86400,
      values: [ start_date /1000, new Date().getTime() / 1000 ],
      slide: function( event, ui ) {
        $( "#date-range-text" ).val( (new Date(ui.values[ 0 ] *1000).toDateString() ) + " - " + (new Date(ui.values[ 1 ] *1000)).toDateString() );
      }
    });
    plotListensByWeek();
  });
  //fill scatter plot
  var data = $.ajax({//can add morning, afternoon, night later
    type: 'GET'
    ,url: '/getchartdatabytime'
    ,data: {'start_time': '2016-01-01 12:00:00'
      ,'end_time': '2016-11-20 12:00:00'
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

    var regression_line = {
      x: [0, x],
      y: [0, y],
      name: 'Correlation',
      mode: 'lines'
    };
    var data = [points, regression_line];

    var layout = {
      title:'Genres',
      height: 400,
      width: 480
    };
    Plotly.newPlot('genre-chart', data, layout);
    $.each(genres['top_genres'], function(index, item){
      $("#genre-list").append('<li>'+item+'</li>')
    });
  });

  //could I do w selectors?
  

});

function plotListensByWeek(start_date = null, end_date = null){
//fill listens over time graph
  var listens = $.ajax({
    type: 'GET'
    , url: '/getlistensbydate'
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
        xaxis: {
            rangeslider: {}
        },
        yaxis: {
            fixedrange: true
        },
        height: 400,
        width: 1000
    };
    Plotly.plot('listens-by-week-graph', data, layout);
  });
}



