/* global d3, topojson, chroma, arrSuburbs, arrMapColours */

var width;
var height;
var active;
var projection;
var path;
var svg;
var g;
var tooltip;
var values;
var colours;

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

  tooltip.style("display", "block").text(suburbname + " " + postcode + ": $" + medianprice);
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

var load_suburbprofile = function(item) {
    var objSuburb = arrSuburbs[item.index];
    // animate box in
    $('#map .overlay .information').removeClass('hidden');

    // make a request and show loading animation on pre-thingo. Also add the class for css stuff
};
var show_maploader = function() {
  $('#map .map-container .overlay .loader').removeClass('hidden');
};

var hide_maploader = function() {
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
    d3.select("#map .fp-tableCell .map-container svg").remove();
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
  svg = d3.select("#map .fp-tableCell .map-container").append("svg").attr("width", width).attr("height", height); // make svg tag
  svg.append("rect").attr("class", "background").attr("width", width).attr("height", height).on("click", reset_map); // add background
  g = svg.append("g").attr("class", "suburbs"); // add path group
  var selected = d3.set([305011143, 305011146]);
  tooltip = d3.select("#map .fp-tableCell .map-container").append("div").attr("class", "tooltip");
  values = [];
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
        obj.active = true;
        var obj2 = new Object();
        obj2.value = MedianPrice;
        obj2.index = currentindex;
        values.push(obj2);
      }
      $(this).attr("data-postcode", post);
      $(this).attr("data-medianprice", MedianPrice);
      $(this).attr("data-houseprice", HousePrice);
      $(this).attr("data-unitprice", UnitPrice);
      $(this).attr("data-index", currentindex);
    });

    function sortValues(a, b) {
      return a.value - b.value;
    }
    // sort values in order
    values.sort(sortValues);
    // generate colours
    // create 1 colour for every active suburb
    if (!destroy) {
      colours = chroma.scale(arrMapColours)
      .mode('lch').correctLightness().colors(arrSuburbs.filter(function(obj) {
        return obj.active === true;
      }).length);
    }
    // match colour to suburb!
    if (colours.length === values.length) {
      var i;
      for (i = 0; i < colours.length; i++) {
        var obj = arrSuburbs[values[i].index];
        obj.color = colours[i];
      }
    } else {
      console.log("colours.length !== values.length");
    }
    // apply those colours!
    g.selectAll('.active').each(function(d, i) {
      var colour = "#000";
      var name = $(this).attr("data-suburbname");
      var obj = arrSuburbs.filter(function(obj) {
        return obj.SuburbName === name;
      })[0];
      if (obj !== undefined) {
        colour = obj.color;
      }
      $(this).css("fill", colour);
    });

    // Make the legend!
    var ranges = $('#map .map-container .overlay .legend .range');
    $(ranges["0"]).html('$' + values[0].value);
    $(ranges["1"]).html('$' + values[values.length - 1].value);
    // Fill colour bar
    var bar_width = 100 / values.length;
    $.each(colours, function(d, i) {
      $('#map .map-container .overlay .legend .bar').append('<span style="width: ' + bar_width + '%; background-color: ' + i + '"></span>');
    });

    // Map Ready!
    hide_maploader();
  });

g.attr("transform", "translate(" + width * 0.11 + ",0)"); // center it! kindof...
};
