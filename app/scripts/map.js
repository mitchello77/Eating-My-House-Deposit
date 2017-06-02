/* global d3, topojson, chroma, arrSuburbs, arrMapColours */

var width;
var height;
var active;
var projection;
var path;
var svg;
var g;
var tooltip;
var fillcolours;
var strokecolours;

var isActiveSuburb = function(name) {
  var result = false;
  var obj = arrSuburbs.filter(function(obj) {
    return obj.SuburbName === name;
  })[0];
  if (obj !== undefined) {
    // suburb exists!
    result = true;
  }
  return result;
};

var moveTooltip = function(d) {
  tooltip.style("left", (d3.event.pageX - 10) + "px").style("top", (d3.event.pageY - ($("#map .map-container").offset().top) - 5) + "px");
};

// Create a tooltip, hidden at the start
var showTooltip = function(d) {
  moveTooltip();
  var suburbname = d3.select(this).attr("data-suburbname");
  var postcode = d3.select(this).attr("data-postcode");
  var houseprice = d3.select(this).attr("data-houseprice");
  var unitprice = d3.select(this).attr("data-unitprice");
  var medianprice = d3.select(this).attr("data-medianprice");
  var payofftime = d3.select(this).attr("data-payofftime");
  var html_onlyprice = '<span class="suburb-name">%s </span><span class="postcode">%s</span>:<span class="price"> %s</span>';
  var html_payyof = '<span class="suburb-name">%s </span><span class="postcode">%s</span>:<span class="payofftime"> %s</span><span class="price"> (%s)</span>';
  tooltip.style("display", "block");
  if (results_ready) {
    var payofftime_string = getTimeFromYears(parseFloat(payofftime));
    $('#map .map-container .tooltip').html(sprintf(html_payyof, suburbname, postcode, payofftime_string, moneyFormat.to(parseInt(medianprice, 10))));
  } else {
    $('#map .map-container .tooltip').html(sprintf(html_onlyprice, suburbname, postcode, moneyFormat.to(parseInt(medianprice, 10))));
  }
};

var hideTooltip = function(d) {
  tooltip.style("display", "none");
};

var reset_map = function(d) {
  active.classed("selected", false);
  active = d3.select(null);
  $('#map .map-container .overlay .information').addClass('hidden');
  $('.suburb.active').removeClass("dull")
  g.transition()
      .duration(750)
      .style("stroke-width", "1.5px")
      .attr("transform", "translate(" + width * 0.11 + ",0)")
      .attr('style', null);
};

function build_overlay(objSuburb, objProfile) {
  console.log('build_overlay');
  generateChart_SuburbOverview(objSuburb);
  // animate box in
  hide_maploader()
  $('#map .overlay .information').removeClass('hidden');
}

var load_suburbprofile = function(item) {
  var objSuburb = arrSuburbs[item.index];
  if (objSuburb.profile !== null) {
    build_overlay(objSuburb, objSuburb.profile)
  } else {
    // need to query data
    getAPIData(sprintf('/profile/suburb/%s/postcode/%s', objSuburb.SuburbName, objSuburb.Postcode), function(jqXHR, settings) {
      /* beforeSend */
      setTimeout(function(){
        show_maploader();
      }, 750);
    }, function(data, textStatus, jqXHR) {
      /* success */
      // handle data
      var objProfile = data[objSuburb.SuburbName.toUpperCase() + - + objSuburb.Postcode];
      objSuburb.lastupdated = objProfile.processed_date.sale;
      objSuburb.profile = objProfile;
      build_overlay(objSuburb, objSuburb.profile)
    });
  }
};

function show_maploader() {
  $('#map .map-container .overlay .loader').removeClass('hidden');
};

function hide_maploader() {
  $('#map .map-container .overlay .loader').addClass('hidden');
};

function round_number(num, dec) {
    return Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
}

var OnSuburbClick = function(d) {
  if (active.node() === this) {
    return reset_map();
  }
  var bounds = path.bounds(d);
  var dx = bounds[1][0] - bounds[0][0];
  var dy = bounds[1][1] - bounds[0][1];
  var x = (bounds[0][0] + bounds[1][0]) / 2;
  var y = (bounds[0][1] + bounds[1][1]) / 2;
  var scale = 0.9 / Math.max(dx / width, dy / height);
  var translate = [width / 2 - scale * x, height / 2 - scale * y];
  var other_suburbs = $('.suburb.active');

  g.transition()
      .duration(750)
      .style("stroke-width", 2 / scale + "px")
      .attr("transform", "translate(" + translate + ")scale(" + scale + ")");

  active.classed("selected", false);
  active = d3.select(this).classed("selected", true);
  var item = new Object();
  item.name = active.attr('data-suburbname');
  item.postcode = active.attr('data-postcode');
  item.index = active.attr('data-index');
  load_suburbprofile(item);
  other_suburbs.addClass('dull');

};

var build_map = function(destroy) {
  show_maploader();
  if (destroy) {
    d3.select("#map .fp-tableCell .map-container #map_obj").remove();
    d3.select("#map .fp-tableCell .map-container .tooltip").remove();
  }
  // set vars
  width = $("#map .fp-tableCell .map-container").width();
  height = $("#map .fp-tableCell .map-container").height();
  active = d3.select(null);
  projection = d3.geo.mercator()
  .center([153.075, -27.467])
  .scale(190 * width)
  .translate([width / 2, height / 2]);
  path = d3.geo.path().projection(projection);
  svg = d3.select("#map .fp-tableCell .map-container").append("svg").attr("width", width).attr("height", height).attr("id", "map_obj"); // make svg tag
  svg.append("rect").attr("class", "background").attr("width", width).attr("height", height).on("click", reset_map); // add background
  g = svg.append("g").attr("class", "suburbs"); // add path group
  var selected = d3.set([305011143, 305011146]);
  tooltip = d3.select("#map .fp-tableCell .map-container").append("div").attr("class", "tooltip");
  price_values = [];
  paytimevalues = [];
  // done

  d3.json("../maps/brisbane.json", function(error, map) {
    if (error) {
      throw error;
    }
    g.selectAll("path")
    .data(topojson.feature(map, map.objects.collection).features)
    .enter().append("path")
    .attr("d", path)
    .attr("class", "suburb")
    .attr("data-suburbname", function(d) {
      return d.properties.SuburbName;
    })
    .filter(function(d) {
      return isActiveSuburb(d.properties.SuburbName);
    })
    .on("mouseover", showTooltip)
    .on("mousemove", moveTooltip)
    .on("mouseout", hideTooltip)
    .on("click", OnSuburbClick);

    g.append("path")
    .datum(topojson.mesh(map, map.objects.collection, function(a, b) {
      return a !== b;
    }))
    .attr("class", "mesh")
    .attr("d", path);

    g.append("path") // Merge brisbane CBD. Oringally its split up.
    .datum(topojson.merge(map, map.objects.collection.geometries.filter(function(d) {
      return selected.has(d.id);
    })))
    .attr("class", "suburb")
    .attr("id", "Brisbane_City")
    .attr("d", path)
    .attr("data-postcode", "4000")
    .attr("data-suburbname", "Brisbane City")
    .on("mouseover", showTooltip)
    .on("mousemove", moveTooltip)
    .on("mouseout", hideTooltip)
    .on("click", OnSuburbClick);

    // add extra attributes
    g.selectAll('path').each(function(d, i) {
      var name = $(this).attr("data-suburbname");
      var post = "0";
      var HousePrice = "0";
      var UnitPrice = "0";
      var MedianPrice = "0";
      var currentindex = 0;
      var payofftime = 0.0;
      var payofftimeHouse = 0.0;
      var payofftimeUnit = 0.0;
      var obj = arrSuburbs.filter(function(obj) {
        return obj.SuburbName === name;
      })[0];
      if (obj !== undefined) {
        // suburb exists!
        currentindex = arrSuburbs.findIndex(function(x) {
          return x.SuburbName === name;
        });
        $(this).addClass('active');
        post = obj.Postcode;
        HousePrice = obj.HousePrice;
        UnitPrice = obj.UnitPrice;
        MedianPrice = obj.MedianPrice;
        payofftimeHouse = obj.payofftimeHouse;
        payofftimeUnit = obj.payofftimeUnit;
        payofftime = obj.payofftime;
        obj.active = true;
        var obj2 = new Object();
        obj2.value = MedianPrice;
        obj2.index = currentindex;
        price_values.push(obj2);
        var obj3 = new Object();
        obj3.value = payofftime;
        obj3.index = currentindex;
        paytimevalues.push(obj3);
      }
      $(this).attr("data-postcode", post);
      $(this).attr("data-medianprice", MedianPrice);
      $(this).attr("data-houseprice", HousePrice);
      $(this).attr("data-unitprice", UnitPrice);
      $(this).attr("data-index", currentindex);
      $(this).attr("data-payofftime", payofftime);
      $(this).attr("data-payoffHouse", payofftimeHouse);
      $(this).attr("data-payoffUnit", payofftimeUnit);
    });

    function sortValues(a, b) {
      return a.value - b.value;
    }
    // sort price_values in order
    price_values.sort(sortValues);

    // sort paytimevalues in order
    paytimevalues.sort(sortValues);
    // generate colours
    // create 1 colour for every active suburb
    if (!destroy) {
      fillcolours = chroma.scale(arrMapFillColours)
      .mode('lch').correctLightness().colors(arrSuburbs.filter(function(obj) {
        return obj.active === true;
      }).length);
      strokecolours = chroma.scale(arrMapStrokeColours)
      .mode('lch').correctLightness().colors(arrSuburbs.filter(function(obj) {
        return obj.active === true;
      }).length);
    }

    // match fill colour to suburb!
    if (fillcolours.length === price_values.length) {
      var i;
      for (i = 0; i < fillcolours.length; i++) {
        var obj;
        if (results_ready) {
          // user has compleated the questionair.
          obj = arrSuburbs[paytimevalues[i].index]
        } else {
          obj = arrSuburbs[price_values[i].index]
        }
        obj.fillcolor = fillcolours[i];
      }
    } else {
      console.log("colours.length !== price_values.length");
    }

    // match stroke colour to suburb!
    if (strokecolours.length === paytimevalues.length) {
      var i;
      for (i = 0; i < strokecolours.length; i++) {
        var obj;
        obj = arrSuburbs[price_values[i].index];
        if (results_ready) {
          // user has compleated the questionair.
          obj.strokecolor = strokecolours[i];
        } else {
          obj.strokecolor = '#ffffff';
        }
      }
    } else {
      console.log("colours.length !== paytimevalues.length");
    }

    // apply those colours!
    g.selectAll('.active').each(function(d, i) {
      var fillcolour = "#000";
      var strokecolor = "#000";
      var name = $(this).attr("data-suburbname");
      var obj = arrSuburbs.filter(function(obj) {
        return obj.SuburbName === name;
      })[0];
      if (obj !== undefined) {
        fillcolour = obj.fillcolor;
        strokecolor = obj.strokecolor;
      }
      $(this).css("fill", fillcolour);
      $(this).css("stroke", strokecolor);
    });

    if (results_ready) {
      // display both legends. Fill = pay off
      $('#map .map-container .overlay .stroke').removeClass('hidden');
      {
        var ranges = $('#map .map-container .overlay .legend.stroke .range');
        $(ranges["0"]).html(moneyFormat.to(price_values[0].value));
        $(ranges["1"]).html(moneyFormat.to(price_values[price_values.length - 1].value));
        // Fill colour bar
        var bar_width = 100 / price_values.length;
        $('#map .map-container .overlay .legend.stroke .bar').html('');
        $.each(strokecolours, function(d, i) {
          $('#map .map-container .overlay .legend.stroke .bar').append('<span style="width: ' + bar_width + '%; background-color: ' + i + '"></span>');
        });
        $('#map .map-container .overlay .legend.stroke .label').html('Price');
      }
      {
        var ranges = $('#map .map-container .overlay .legend.fill .range');
        $(ranges["0"]).html(parseInt(paytimevalues[0].value, 10));
        $(ranges["1"]).html(parseInt(paytimevalues[paytimevalues.length - 1].value, 10));
        // Fill colour bar
        var bar_width = 100 / paytimevalues.length;
        $('#map .map-container .overlay .legend.fill .bar').html('');
        $.each(fillcolours, function(d, i) {
          $('#map .map-container .overlay .legend.fill .bar').append('<span style="width: ' + bar_width + '%; background-color: ' + i + '"></span>');
        });
        $('#map .map-container .overlay .legend.fill .label').html('Pay Off Time (Years)');
      }
    } else {
      // ensure stroke legend is hidden.
      $('#map .map-container .overlay .stroke').addClass('hidden');
      var ranges = $('#map .map-container .overlay .legend.fill .range');
      $(ranges["0"]).html(moneyFormat.to(price_values[0].value));
      $(ranges["1"]).html(moneyFormat.to(price_values[price_values.length - 1].value));
      // Fill colour bar
      var bar_width = 100 / price_values.length;
      $('#map .map-container .overlay .legend.fill .bar').html('');
      $.each(fillcolours, function(d, i) {
        $('#map .map-container .overlay .legend.fill .bar').append('<span style="width: ' + bar_width + '%; background-color: ' + i + '"></span>');
      });
      $('#map .map-container .overlay .legend.fill .label').html('Price ($)');
    }

    // Map Ready!
    hide_maploader();
  });

g.attr("transform", "translate(" + width * 0.11 + ",0)"); // center it! kindof...
};
