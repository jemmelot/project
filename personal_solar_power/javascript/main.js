/*
	Jesse Emmelot
	11963522

	Code sources:
	- http://bl.ocks.org/phil-pedruco/9344373
	- http://bl.ocks.org/phil-pedruco/7745589
	- https://www.w3schools.com/
	- https://www.bootply.com/113296
	
	Data sources:
	- http://projects.knmi.nl/klimatologie/daggegevens/selectie.cgi
	- https://thegrid.rexel.com/en-us/energy_efficiency/w/solar_renewable_and_energy_efficiency/72/how-to-calculate-the-output-of-a-solar-photovoltaic-system---a-detailed-guide#
	- https://mijnhernieuwbareenergie.be/cfs-file/__key/communityserver-blogs-components-weblogfiles/00-00-00-00-01/Tabel-PV-ori_EB00_ntatie-_2D00_-rendement.jpg
	- https://woonbewust.nl/blog/soorten-zonnepanelen
*/

// define map size
var width = 450;
var height = 520;

// set map projection type
var projection = d3.geo.mercator()
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
	.defer(d3.json, "datasets/percentages.json")
	.await(ready);
	
function ready(error, data, nld, percentages) {
	console.log(data);
	console.log(percentages);
		
	// add weather station names to dropdown menu
	for(index in data)
	{
		$('#location ul').append('<li><a href="#" class="location_a" data-location="'+data[index].name+'"</a>'+data[index].name+'</li>');   
	}
	
	// instantiate variables for calculations
	var station = "";
	var orientation = "";
	var angle = "";
	var surface = 0;
	var panel = 0;
	var coefficient = 0;
	var cost = 0;
	var usage = 0;
	
	// placeholder variables for testing
	var radiation = 1000;
	var temperature = 100;
	
	// instantiate other calculation variables
	var capacity = 0;
	var inverter_efficiency = 0.95;
	var insolation = 0;
	var reference = 25;
	var temperature_factor = 0;
	
	// cost per kWh
	var energy = 0.20;
	
	// size of one panel in square meters
	var size = 1.65
			
	// calculation function
	function calculation(orientation, angle, surface, panel, coefficient, cost, usage) {
		if (orientation.length != 0 && angle.length != 0 && surface !=0 && panel != 0 && usage != 0) {
			insolation_efficiency = percentages[orientation]["angle"][angle];
									
			ideal_insolation = (radiation*10000)/3600000;
			
			true_insolation = ideal_insolation*insolation_efficiency;
			
			capacity = surface*panel*inverter_efficiency;
			
			basic_output = true_insolation*capacity;
						
			production_day = basic_output*(1-(((temperature - 25)*coefficient))/100);
			production_year = production_day*365;
			
			total_cost = (surface/size)*cost;
			console.log(total_cost);
						
			profit = production_year*energy;
			
			payback = total_cost/profit;
			console.log(payback);
			
			// update span values when a new calculation is made
			$("span.production").find("p.p_production").text(parseInt(production_year));
			$("span.profit").find("p.p_profit").text(parseInt(profit));
			$("span.payback").find("p.p_payback").text(parseInt(payback));					
		}
	};
	
	// when a location is selected, display it in the button and store its value in a variable for calculation
	$('a[class=location_a]').on('click', function(){
		station = $(this).attr('data-location');
		console.log(station);
		$("button.button_width_location").text($(this).text());	
		
		// highlight the selected weather station dot and make all other dots red
		d3.selectAll("circle")
			.style("fill","red")
			.attr("r", 8);
		d3.select("#name" + station)
			.style("fill", "#FFB6C1")
			.attr("r", 8);
		
		// select corresponding station data from json
		for (var i = 0; i < data.length; i++) {
			if (data[i].name == station) {
				console.log(data[i]);
			}					
		};
		
		calculation(orientation, angle, surface, panel, coefficient, cost, usage);
	});
	
	// when an orientation is selected, display it in the button and store its value in a variable for calculation
	$('a[class=orientation_a]').on('click', function(){
		orientation = $(this).attr('data-orientation');
		$("button.button_width_orientation").text($(this).text());	
		calculation(orientation, angle, surface, panel, coefficient, cost, usage);		
	});
	
	// when an angle is selected, display it in the button and store its value in a variable for calculation
	$('a[class=angle_a]').on('click', function(){
		angle = $(this).attr('data-angle');
		$("button.button_width_angle").text($(this).text());
		calculation(orientation, angle, surface, panel, coefficient, cost, usage);
	});
	
	// when a surface is selected, display it in the button and store its value in a variable for calculation
	$('a[class=surface_a]').on('click', function(){
		surface = parseInt($(this).attr('data-surface'));
		$("button.button_width_surface").text($(this).text());
		calculation(orientation, angle, surface, panel, coefficient, cost, usage);
	});
	
	// when a panel is selected, display it in the button and store its value in a variable for calculation
	$('a[class=panel_a]').on('click', function(){
		panel = parseFloat($(this).attr('data-panel'));
		$("button.button_width_panel").text($(this).text());
		coefficient = parseFloat($(this).attr('data-coefficient'));
		cost = parseInt($(this).attr('data-price'));
		calculation(orientation, angle, surface, panel, coefficient, cost, usage);		
	});
	
	// when a usage is selected, display it in the button and store its value in a variable for calculation
	$('a[class=usage_a]').on('click', function(){
		usage = parseInt($(this).attr('data-usage'));
		$("button.button_width_usage").text($(this).text());
		calculation(orientation, angle, surface, panel, coefficient, cost, usage);
	});
	
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
		.attr("id", function(d){ return 'name' + d[2]; })
		.attr("cx", function (d) { return projection(d)[0]; })
		.attr("cy", function (d) { return projection(d)[1]; })
		.attr("r", "8px")
		.attr("fill", "red")
		.on("click", function (d) { 
			// display the name of the clicked station in the button
			$("button.button_width_location").text(d[2]);
			
			// select corresponding station data from json
			for (var i = 0; i < data.length; i++) {
				if (data[i].name == d[2]) {
					console.log(data[i]);
				}					
			};
						
			// highlight the clicked dot and make all other dots red
			d3.selectAll("circle")
				.style("fill","red")
				.attr("r", 8);
			d3.select(this)
				.style("fill", "#FFB6C1")
				.attr("r", 8);
		});

	// add slider
	d3.select('#slider').call(d3.slider());
		
};