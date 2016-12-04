//look at input formats for Plotly.plot() and try to figure out why it isn't accepting the dates I'm inputting

$(function(){
  //fill listens over time graph
  var listens = $.ajax({
    type: 'GET'
    , url: '/getlistensbydate'
    ,dataType: 'json'
  }).done(function(listens){
    var selectorOptions = {
        buttons: [{
            step: 'month',
            stepmode: 'backward',
            count: 1,
            label: '1m'
        }, {
            step: 'month',
            stepmode: 'backward',
            count: 6,
            label: '6m'
        }, {
            step: 'year',
            stepmode: 'todate',
            count: 1,
            label: 'YTD'
        }, {
            step: 'year',
            stepmode: 'backward',
            count: 1,
            label: '1y'
        }, {
            step: 'all',
        }],
    };
    var points = {
      x: [],
      y: [],
      mode: 'lines'
    };
    $.each(listens, function(index, item){
      points.x.push(Date(item['Week'])); //make model return data in the same format for scatter as line plots. reduce confusion.
      points.y.push(item['Listens']);
    });
    var data = [points];
    var layout = {
        title: 'Listens By Week',
        xaxis: {
            rangeselector: selectorOptions,
            rangeslider: {}
        },
        yaxis: {
            fixedrange: true
        }
    };
    console.log(data);
    Plotly.plot('listens-by-week-graph', data, layout);
  });
  //fill scatter plot
  var data = $.ajax({//can add morning, afternoon, night later
    type: 'GET'
    ,url: '/getchartdatabytime'
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
    console.log(data);
    Plotly.newPlot('myDiv', data, layout);
  });
  


});



