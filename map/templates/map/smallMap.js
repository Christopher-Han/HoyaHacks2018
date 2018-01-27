var width = 960,
    height = 500;

// defines size of map, and location on the screen
var projection = d3.geo.albersUsa()
	.translate([100,100])
    .scale([200]);

var path = d3.geo.path().projection(projection);

// list of cities to show, and locations
var citiesData = [{"city": "Chicago", location: {"lat": 41.87811, "long": -87.62980}},
				  {"city": "New Orleans", location: {"lat": 29.95107 , "long": -90.07153}},
				  {"city": "Seattle", location: {"lat": 47.60621, "long": -122.33207}},
				  {"city": "Boston", location: {"lat":  42.35849, "long": -71.06010}}];

// normal svg setup
var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

// read in US geometry
d3.json("us.json", function(error, topology) {

  // limit to continental US
  topology.objects.cb_2013_us_state_20m.geometries = 
  	topology.objects.cb_2013_us_state_20m.geometries.filter(
  		function(d){if(["Alaska", "Hawaii", "Puerto Rico"].indexOf(d.id) == -1){return d}}
  		)
  // attach path for US boundary
  svg.append("path")
      .datum(topojson.feature(topology, topology.objects.cb_2013_us_state_20m))
      .attr("d", path);
 
  // append cities
  svg.append("g")
    .attr("class", "cities")
  .selectAll("circle")
    .data(citiesData)
  .enter().append("circle")
    .attr("transform", function(d) {
    	return "translate(" + projection([
      		d.location.long,
      		d.location.lat
    		]) + ")"
  		})
    .attr("r", 3);
});
