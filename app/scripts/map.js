var width;
var height;
var active;
var projection;
var path;
var svg;
var g;
var tooltip;

build_map = function(destroy) {

  if (destroy) {
    d3.select("#map .fp-tableCell svg").remove();
    d3.select("#map .fp-tableCell .tooltip").remove();
  }
// set vars
width = $("#map .fp-tableCell").width();
height = $("#map .fp-tableCell").height();;
active = d3.select(null);
projection = d3.geo.mercator()
    .center([153.05, -27.47])
    .scale(130*width)
    .translate([width / 2, height / 2]);
path = d3.geo.path().projection(projection);
svg = d3.select("#map .fp-tableCell").append("svg").attr("width", width).attr("height", height); // make svg tag
svg.append("rect").attr("class", "background").attr("width", width).attr("height", height).on("click", ResetMap); // add background
g = svg.append("g").attr("class", "suburbs"); // add path group
var selected = d3.set([305011143, 305011146]);
tooltip = d3.select("#map .fp-tableCell").append("div").attr("class","tooltip");
d3.json("../maps/brisbane.json", function(error, map) {
  if (error) throw error;

  g.selectAll("path")
      .data(topojson.feature(map, map.objects["collection"]).features)
    .enter().append("path")
      .attr("id", function(d) { return d.properties.SuburbName; })
      .attr("d", path)
      .attr("class", "suburb")
      .attr("data-postcode", GetSuburbPostcode(function(d) { return d.properties.SuburbName; }))
      .attr("data-suburbname", function(d) { return d.properties.SuburbName; })
      .on("mouseover",showTooltip)
      .on("mousemove",moveTooltip)
      .on("mouseout",hideTooltip)
      .on("click", OnSuburbClick);

  g.append("path")
      .datum(topojson.mesh(map, map.objects["collection"], function(a, b) { return a !== b; }))
      .attr("class", "mesh")
      .attr("d", path);

  g.append("path") // Merge brisbane CBD. Oringally its split up.
    .datum(topojson.merge(map, map.objects["collection"].geometries.filter(function(d) { return selected.has(d.id); })))
    .attr("class", "suburb")
    .attr("id", "Brisbane City")
    .attr("d", path)
    .attr("data-postcode", "4000")
    .attr("data-suburbname", "Brisbane City")
    .on("mouseover",showTooltip)
    .on("mousemove",moveTooltip)
    .on("mouseout",hideTooltip)
    .on("click", OnSuburbClick);
});
g.attr("transform", "translate("+width*0.1+",0)"); // center it! kindof...
};

//Create a tooltip, hidden at the start
function showTooltip(d) {
  moveTooltip();
  var suburbname = d3.select(this).attr("data-suburbname");
  var postcode = d3.select(this).attr("data-postcode");
  tooltip.style("display","block").text(suburbname+" - "+postcode);
}
function moveTooltip(d) {
tooltip.style("left", (d3.event.pageX-10) + "px").style("top", (d3.event.pageY-($("#map").offset().top)-5) + "px");
}
function hideTooltip(d) {
  tooltip.style("display","none");
}


OnSuburbClick = function(d) {
  if (active.node() === this) return ResetMap();
  var bounds = path.bounds(d),
      dx = bounds[1][0] - bounds[0][0],
      dy = bounds[1][1] - bounds[0][1],
      x = (bounds[0][0] + bounds[1][0]) / 2,
      y = (bounds[0][1] + bounds[1][1]) / 2,
      scale = .9 / Math.max(dx / width, dy / height),
      translate = [width / 2 - scale * x, height / 2 - scale * y];
  g.transition()
      .duration(750)
      .style("stroke-width", 2 / scale + "px")
      .attr("transform", "translate(" + translate + ")scale(" + scale + ")");

  active.classed("active", false);
  active = d3.select(this).classed("active", true);
  $('#map .overlay .information').removeClass('hidden');
};

ResetMap = function(d) {
  active.classed("active", false);
  active = d3.select(null);
  $('#map .overlay .information').addClass('hidden');
  g.transition()
      .duration(750)
      .style("stroke-width", "1.5px")
      .attr("transform", "")
      .attr('style', null);
};

GetSuburbPostcode = function(name) {
  return '4000';
};
