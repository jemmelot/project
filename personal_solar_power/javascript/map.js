function drawMap(data, nld, monthEfficiency) {
	// define map size
	var mapHeight = 400;
	var mapWidth = 350;

	// set map projection type
	var projection = d3.geo.mercator()
		.scale(1)
		.translate([0,0]);

	// set map path
	var path = d3.geo.path()
		.projection(projection);

	// add an svg element to put the map into	
	svgNL = d3.select("body").append("svg")
		.attr("width", mapWidth)
		.attr("height", mapHeight);
		
	// define tooltip that shows the name of every weather station on the map
	var mapTip = d3.tip()
		.attr("class", "tip")
		.offset([-12, 0])
		.html(function(d) {
			return "<span>" + d[2] + "</span>";
		});	
		
	// map scale and position
	projection
		.scale(4300)
		.translate([-206, 4800]);
		
	// draw the map
	svgNL.selectAll("path")
		.data(topojson.feature(nld, nld.objects.subunits).features).enter()
		.append("path")
		.attr("d", path)
		.attr("fill", "#ffaa55")
		.attr("class", function(d, i) {
			return d.properties.name;
		});
	
	// make an array with parts of the json data to determine placement of the dots on the map
	dots = [];	
	Object.keys(data).forEach(function(key,index) {
		dot = [data[key].lon, data[key].lat, key];
		dots.push(dot);
	});
				
	// add circles to map svg
    svgNL.selectAll("circle")
		.data(dots).enter()
		.append("circle")
		.attr("id", function(d){ return "name" + d[2].replace(/ /g,''); })
		.attr("cx", function (d) { return projection(d)[0]; })
		.attr("cy", function (d) { return projection(d)[1]; })
		.attr("r", "8px")
		.attr("fill", "red")
		.on("click", function (d) { 
			station = d[2];
			
			// update line chart to display current weather station data
			updateLine(station, monthValue, data, monthEfficiency);		
						
			// display the name of the clicked station in the button
			$("button.button-width-location").text(d[2]);
									
			// highlight the clicked dot and make all other dots red
			svgNL.selectAll("circle")
				.style("fill","red")
				.attr("r", 8);
			d3.select(this)
				.style("fill", "#FFB6C1")
				.attr("r", 8);
			
			// recalculate results
			calculation(data, monthEfficiency);
		})
		.on('mouseover', mapTip.show)
		.on('mouseout', mapTip.hide);
	
	// call map tooltip functionality
	svgNL.call(mapTip);	
};
	