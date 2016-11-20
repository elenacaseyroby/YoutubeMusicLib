$(function(){
  var data = $.ajax({//can add morning, afternoon, night later
    type: 'GET'
    ,url: '/getlisteningdatabytime'
    ,data: {'start_time': '2016-01-01 12:00:00'
      ,'end_time': '2016-11-20 12:00:00'
    }
    ,dataType: 'json'
  })
  //how to extract data from the returned json object... why is it diff this time?
  console.log(data);
  var linear_regression_data = data.responseJSON.regression_data;//undefined at this point
  console.log(linear_regression_data);

  var trace1 = {
    x: [],
    y: [],
    mode: 'markers'
  };

  $.each(linear_regression_data, function(index, item){
    trace1['x'].push(item[0])
    trace1['y'].push(item[1])

  });
  console.log(trace1);
  console.log('hey!');
  
/*
  var trace2 = {
    x: [2, 3, 4, 5],
    y: [16, 5, 11, 10],
    mode: 'lines'
  };

  var trace3 = {
    x: [1, 2, 3, 4],
    y: [12, 9, 15, 12],
    mode: 'lines+markers'
  };
*/
  var data = [trace1];

  var layout = {
    title:'Line and Scatter Plot',
    height: 400,
    width: 480
  };

  Plotly.newPlot('myDiv', data, layout);
});

//make plotly chart of listens over time.  
//then on change have it make the below ajax call to repopulate the scatterplot

//use ajax and a new def in views.py to pull data for scatterplot on load and fill the above info
