$(function(){
  var data = $.ajax({//can add morning, afternoon, night later
    type: 'GET'
    ,url: '/getlisteningdatabytime'
    ,data: {'start_time': '2016-01-01 12:00:00'
      ,'end_time': '2016-11-20 12:00:00'
    }
    ,dataType: 'json'
  }).done(function(data){
    var points = {
      x: [],
      y: [],
      mode: 'markers'
    };
    
    $.each(data['regression_data'], function(index, item){
      points.x.push(item[0]);
      points.y.push(item[1]);
      
    });

    //find start and end points of regression line
    var x = data['regression_data'][0][0]
    var y = data['line_best_fit']['m']*data['regression_data'][0][0]+data['line_best_fit']['b']

    var regression_line = {
      x: [0, x],
      y: [0, y],
      mode: 'lines'
    };
    var data = [points, regression_line];

    var layout = {
      title:'Genre Listens V. Likes in Genre',
      height: 400,
      width: 480
    };

    Plotly.newPlot('myDiv', data, layout);
  });


});
//add thing to load top genres dynamically
//make plotly chart of listens over time.  
//then on change have it make the below ajax call to repopulate the scatterplot
//use ajax and a new def in views.py to pull data for scatterplot on load and fill the above info
