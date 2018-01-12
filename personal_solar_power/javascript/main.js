/*
	Jesse Emmelot
	11963522

	Code sources:
	- http://bl.ocks.org/phil-pedruco/9344373
	- http://bl.ocks.org/phil-pedruco/7745589
	- https://www.w3schools.com/
	
	Data sources:
	- http://projects.knmi.nl/klimatologie/daggegevens/selectie.cgi
	- https://thegrid.rexel.com/en-us/energy_efficiency/w/solar_renewable_and_energy_efficiency/72/how-to-calculate-the-output-of-a-solar-photovoltaic-system---a-detailed-guide#
	- https://mijnhernieuwbareenergie.be/cfs-file/__key/communityserver-blogs-components-weblogfiles/00-00-00-00-01/Tabel-PV-ori_EB00_ntatie-_2D00_-rendement.jpg
*/

// log user input
function locations(clicked)
{
    console.log(clicked);
}

// log user input
function orientation(clicked)
{
    console.log(clicked);
}

// log user input
function angle(clicked)
{
    console.log(clicked);
}

// log user input
function surface(clicked)
{
    console.log(clicked);
}

// log user input
function panel(clicked)
{
    console.log(clicked);
}

// log user input
function usage(clicked)
{
    console.log(clicked);
}

// define map size
var width = 450;
var height = 520;

// set map projection type
var projection = d3. geo.mercator()
	.scale(1)
	.translate([0,0]);

// set map path
var path = d3.geo.path()
	.projection(projection);

// add an svg element to put the map into	
var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height)

// queue weather station data and map data
d3.queue()
	.defer(d3.json, "datasets/data.json")
	.defer(d3.json, "datasets/map.json")	
	.await(ready);
	
function ready(error, data, nld) {
	// log all weather station data
	console.log(data);
	
	// map scale and position
	projection
		.scale(6000)
		.translate([-320, 6690]);

	// draw the map
	svg.selectAll("path")
		.data(topojson.feature(nld, nld.objects.subunits).features).enter()
		.append("path")
		.attr("d", path)
		.attr("fill", "#ffaa55")
		.attr("class", function(d, i) {
			return d.properties.name;
		});
	
	dots = [];
		
	// make an array with weather station coordinates
	for (var i = 0; i < data.length; i++) {
		dot = [data[i].lon, data[i].lat, data[i].name];
		dots.push(dot)		
	}
			
	// add circles to svg
    svg.selectAll("circle")
		.data(dots).enter()
		.append("circle")
		.attr("cx", function (d) { return projection(d)[0]; })
		.attr("cy", function (d) { return projection(d)[1]; })
		.attr("r", "8px")
		.attr("fill", "red")
		.on("click", function (d) { 		
			console.log(d[2])
			
			d3.selectAll("circle")
				.style("fill","red")
				.attr("r", 8);
			d3.select(this)
				.style("fill", "#FFB6C1")
				.attr("r", 8);
		});
};