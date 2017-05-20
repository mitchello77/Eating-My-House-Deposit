/* global d3, topojson, chroma, arrSuburbs */

var width;
var height;
var active;
var projection;
var path;
var svg;
var g;
var tooltip;
var values;

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
  tooltip.style("left", (d3.event.pageX - 10) + "px").style("top", (d3.event.pageY - ($("#map").offset().top) - 5) + "px");
};

// Create a tooltip, hidden at the start
var showTooltip = function(d) {
  moveTooltip();
  var suburbname = d3.select(this).attr("data-suburbname");
  var postcode = d3.select(this).attr("data-postcode");
  var houseprice = d3.select(this).attr("data-houseprice");
  var unitprice = d3.select(this).attr("data-unitprice");
  tooltip.style("display", "block").text(suburbname + " - " + postcode + ": H$" + houseprice + " U$" + unitprice);
};

var hideTooltip = function(d) {
  tooltip.style("display", "none");
};

var reset_map = function(d) {
  active.classed("selected", false);
  active = d3.select(null);
  $('#map .overlay .information').addClass('hidden');
  g.transition()
      .duration(750)
      .style("stroke-width", "1.5px")
      .attr("transform", "translate(" + width * 0.11 + ",0)")
      .attr('style', null);
};

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

  g.transition()
      .duration(750)
      .style("stroke-width", 2 / scale + "px")
      .attr("transform", "translate(" + translate + ")scale(" + scale + ")");

  active.classed("selected", false);
  active = d3.select(this).classed("selected", true);
  $('#map .overlay .information').removeClass('hidden');
};

var build_map = function(destroy) {
  if (destroy) {
    d3.select("#map .fp-tableCell svg").remove();
    d3.select("#map .fp-tableCell .tooltip").remove();
  }
  // set vars
  width = $("#map .fp-tableCell").width();
  height = $("#map .fp-tableCell").height();
  active = d3.select(null);
  projection = d3.geo.mercator()
  .center([153.075, -27.465])
  .scale(170 * width)
  .translate([width / 2, height / 2]);
  path = d3.geo.path().projection(projection);
  svg = d3.select("#map .fp-tableCell").append("svg").attr("width", width).attr("height", height); // make svg tag
  svg.append("rect").attr("class", "background").attr("width", width).attr("height", height).on("click", reset_map); // add background
  g = svg.append("g").attr("class", "suburbs"); // add path group
  var selected = d3.set([305011143, 305011146]);
  tooltip = d3.select("#map .fp-tableCell").append("div").attr("class", "tooltip");
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
      var obj = arrSuburbs.filter(function(obj) {
        return obj.SuburbName === name;
      })[0];
      if (obj !== undefined) {
        // suburb exists!
        $(this).addClass('active');
        post = obj.Postcode;
        HousePrice = obj.HousePrice;
        UnitPrice = obj.UnitPrice;
        MedianPrice = obj.MedianPrice;
        obj.active = true;
        var obj2 = new Object();
        obj2.value = MedianPrice;
        obj2.index = arrSuburbs.findIndex(function(x) {
          return x.SuburbName === name;
        });
        values.push(obj2);
      }
      $(this).attr("data-postcode", post);
      $(this).attr("data-medianprice", MedianPrice);
      $(this).attr("data-houseprice", HousePrice);
      $(this).attr("data-unitprice", UnitPrice);
    });

    // add extra attributes
    console.log("Values");
    console.log(values);
    // generate colours
    // create 1 colour for every active suburb
    var colours = chroma.scale(['#fafa6e', '#2A4858'])
    .mode('lch').colors(arrSuburbs.filter(function(obj) {
      return obj.active === true;
    }).length);
    console.log("Colours");
    console.log(colours);
    console.log("Loop Active");

    g.selectAll('.active').each(function(d, i) {
      // console.log($(this));
      $(this).css("fill", colours[i]);
    });
  });

g.attr("transform", "translate(" + width * 0.11 + ",0)"); // center it! kindof...
};
