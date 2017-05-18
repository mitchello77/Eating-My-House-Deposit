var width;
var height;
var active;
var projection;
var path;
var svg;
var g;

build_map = function() {
// set vars
width = 1800;
height = 900;
active = d3.select(null);
projection = d3.geo.mercator()
    .center([153.02, -27.45])
    .scale(150000)
    .translate([width / 2, height / 2]);
path = d3.geo.path().projection(projection);
svg = d3.select("#map .fp-tableCell").append("svg").attr("width", width).attr("height", height); // make svg tag
svg.append("rect").attr("class", "background").attr("width", width).attr("height", height).on("click", ResetMap); // add background
g = svg.append("g").attr("class", "suburbs"); // add path group
d3.json("../maps/brisbane_simp.json", function(error, map) {
  if (error) throw error;

  g.selectAll("path")
      .data(topojson.feature(map, map.objects["Qld-brisbane"]).features)
    .enter().append("path")
      .attr("id", function(d) { return d.properties.name; })
      .attr("d", path)
      .attr("class", "suburb")
      .attr("data-postcode", GetSuburbPostcode(function(d) { return d.properties.name; }))
      .on("click", OnSuburbClick);

  g.append("path")
      .datum(topojson.mesh(map, map.objects["Qld-brisbane"], function(a, b) { return a !== b; }))
      .attr("class", "mesh")
      .attr("d", path);
});
};

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
