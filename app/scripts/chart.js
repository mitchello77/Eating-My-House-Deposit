var color = Chart.helpers.color;
function generateChart_SuburbOverview(objSuburb) {
  var ctx = document.getElementById("chartSuburbProfile").getContext("2d");
  var data_presentprice = [];
  var data_pastprice = [];
  var data_presentsold = [];
  var data_pastsold = [];
  var labels = [];

  $.each(objSuburb.profile.property_types, function(index, item) {
    var ptype = capitalizeFirstLetter(index.toLowerCase());
    $.each(item.bedrooms, function(index, _item) {
      labels.push(capitalizeFirstLetter(index.toLowerCase()) + ' - ' + ptype);
      var value = _item.investor_metrics.median_sold_price;
      var count = _item.investor_metrics.sold_properties;
      if (value === null) {
        value = 0;
      }
      if (count === null) {
        count = 0;
      }
      data_presentprice.push(value);
      data_presentsold.push(count);
      value = _item.investor_metrics.median_sold_price_five_years_ago;
      count = _item.investor_metrics.sold_properties_five_years_ago;
      if (value === null) {
        value = 0;
      }
      if (count === null) {
        count = 0;
      }
      data_pastprice.push(value);
      data_pastsold.push(count);
    });
  });

  var barChartData = {
      labels: labels,
      datasets: [{
          label: 'Current Sold',
          xAxisID: 'bedrooms',
          yAxisID: 'sold_count',
          type: 'line',
          backgroundColor: '#ffffff',
          borderColor: color('rgb(255, 159, 64)').alpha(0.8).rgbString(),
          borderWidth: 2,
          fill: false,
          data: data_presentsold
      }, {
          label: 'Past Sold',
          xAxisID: 'bedrooms',
          yAxisID: 'sold_count',
          type: 'line',
          backgroundColor: '#ffffff',
          borderColor: color('rgb(255, 205, 86)').alpha(0.8).rgbString(),
          borderWidth: 2,
          fill: false,
          data: data_pastsold
      }, {
          label: 'Present Price',
          xAxisID: 'bedrooms',
          yAxisID: 'price',
          type: 'bar',
          backgroundColor: color('rgb(255, 99, 132)').alpha(0.8).rgbString(),
          data: data_presentprice
      }, {
          label: 'Past Price',
          xAxisID: 'bedrooms',
          yAxisID: 'price',
          type: 'bar',
          backgroundColor: color('rgb(75, 192, 192)').alpha(0.8).rgbString(),
          data: data_pastprice
      }]

  };
  var stacked_chart = new Chart(ctx, {
      type: 'bar',
      data: barChartData,
      options: {
          title:{
              display:true,
              text:"Current and Past Price vs Property Type"
          },
          tooltips: {
              mode: 'index',
              intersect: false
          },
          responsive: true,
          scales: {
              xAxes: [{
                  id: 'bedrooms',
                  stacked: false,
                  /* ticks: {
                    callback: function(label) {
                      var labelArray = label.split("|");
                      return 	labelArray[0];
                    }
                  } */
              }/*, {
                  id: 'property_type',
                  stacked: false,
                  drawTicks: true,
                  gridLines: {
                    drawOnChartArea: false, // only want the grid lines for one axis to show up
                  },
                   ticks: {
                    callback: function(label) {
                      var labelArray = label.split("|");
                      if (labelArray[0] === "4") {
                        return labelArray[1];
                      } else if (labelArray[0] === "1") {
                        return "";
                      } else if (labelArray[0] === "All") {
                        return "";
                      } else {
                        return null;
                      }
                    }
                  }
              }*/],
              yAxes: [{
                id: 'price',
                stacked: false,
                labelString: 'Price ($)',
                ticks: {
                    // Include a dollar sign in the ticks
                    callback: function(value, index, values) {
                        return '$' + value;
                    }
                }
              }, {
                id: 'sold_count',
                stacked: false,
                position: 'right',
                labelString: 'Sold Count'
              }]
          }
      }
  });

}

function generateChart_Conclusion() {
  var ctx = document.getElementById("chartSuburbsPrice");
  var suburbs = [];
  var labels = [];
  var bg_colours = [];

  $.each(arrSuburbs, function(index, item) {
    var suburb_name = item.SuburbName;
    var suburb_medprice = item.MedianPrice;
  });

}

 function randomScalingFactor() {
	return (Math.random() > 0.5 ? 1.0 : -1.0) * Math.round(Math.random() * 100);
};

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
