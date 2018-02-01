function lineChart(data) {
	// select svg element to put the line chart into	
	svgChart = 	d3.select("#chart"),
		chartMargin = {top: 30, right: 20, bottom: 10, left: 50},
		chartWidth = 850 - chartMargin.left - chartMargin.right,
		chartHeight = 285 - chartMargin.top - chartMargin.bottom,
		gChart = svgChart.append("g").attr("transform", "translate(" + chartMargin.left + "," + chartMargin.top + ")");
	
	// line chart x axis	
	x = d3.time.scale()
		.rangeRound([0, chartWidth])

	// line chart temperature axis	
	y = d3.scale.linear()
		.rangeRound([chartHeight, 0])

	// line	chart radiation axis
	yTwo = d3.scale.linear()
		.rangeRound([chartHeight, 0])

	// temperature line variable	
	tempLine = d3.svg.line()
		.x(function(d) { return x(d.date); })
		.y(function(d) { return y(d.temperature); });

	// radiation line variable
	radLine = d3.svg.line()
		.x(function(d) { return x(d.date); })
		.y(function(d) { return yTwo(d.radiation); });
		
	// line chart x axis properties		
	xAxis = d3.svg.axis()
		.scale(x)
		.tickFormat(d3.time.format("%b"))
		.orient("bottom");
		
	// line chart y axis properties	
	yAxis = d3.svg.axis()
		.scale(y)
		.orient("left");
		
	// line chart y axis properties	
	yAxisTwo = d3.svg.axis()
		.scale(yTwo)
		.orient("right");		
		
	// add the a axis
	gChart.append("g")
		.attr("class", "xAxis")
		.attr("transform", "translate(0," + chartHeight + ")")
		.call(xAxis)
		.select(".domain")
			.remove();
	
	// add the temperature axis
	gChart.append("g")
		.attr("class", "yAxis")
		.style("fill", "#cc0000")
		.style("stroke", "#cc0000")
		.call(yAxis.tickFormat(""))
		.append("text")
		.attr("class", "label")
		.attr("x", -29)
		.attr("y", -25)
		.attr("dy", ".71em")
		.text("Temperatuur(°C)");
	
	// add the radiation axis
	gChart.append("g")
		.attr("class", "yAxisTwo")
		.attr("transform", "translate(" + chartWidth + " ,0)")	
		.style("fill", "#ffcc00")
		.style("stroke", "#ffcc00")
		.call(yAxisTwo.tickFormat(""))
		.append("text")
		.attr("class", "label")
		.attr("x", -57)
		.attr("y", -25)
		.attr("dy", ".71em")
		.text("Straling(J/cm2)");
	
	// add the temperature line
	gChart.append("path")
		.attr("class", "tempLines")
		.attr("id", "tempLine")
		.datum(lineData)
		.attr("fill", "none")
		.attr("stroke", "#cc0000")
		.attr("stroke-linejoin", "round")
		.attr("stroke-linecap", "round")
		.attr("stroke-width", 2)
		.attr("d", tempLine);
	
	// add the radiation line
	gChart.append("path")
		.attr("class", "radLines")
		.attr("id", "radLine")
		.datum(lineData)
		.attr("fill", "none")
		.attr("stroke", "#ffcc00")
		.attr("stroke-linejoin", "round")
		.attr("stroke-linecap", "round")
		.attr("stroke-width", 2)
		.attr("d", radLine);
	
	// define variable to serve as the basis for the crosshair functionality
	focus = gChart.append('g')
		.style('display', 'none');
    
	/*
		define all visible crosshair parts
	*/
	focus.append('line')
		.attr('id', 'focusLineX')
		.attr('class', 'focusLine');
	focus.append('line')
		.attr('id', 'focusLineY')
		.attr('class', 'focusLine');
	focus.append('line')
		.attr('id', 'focusLineYTwo')
		.attr('class', 'focusLine');
	focus.append('circle')
		.attr('id', 'focusCircle')
		.attr('r', 5)
		.attr('class', 'circle focusCircle');
	focus.append('circle')
		.attr('id', 'focusCircleTwo')
		.attr('r', 5)
		.attr('class', 'circle focusCircle');
	focus.append('text')	
		.attr('id', 'focusTextX')
		.attr("x", 9)
		.attr("fill", "black")
		.attr("stroke", "none")
		.attr("font-weight", "550")
		.attr("dy", ".35em");
	focus.append('text')	
		.attr('id', 'focusTextXTwo')
		.attr("x", 9)
		.attr("fill", "black")
		.attr("stroke", "none")
		.attr("dy", ".35em");
	focus.append('text')	
		.attr('id', 'focusTextY')
		.attr("x", 9)
		.attr("fill", "black")
		.attr("stroke", "none")
		.attr("font-weight", "550")
		.attr("dy", ".35em");	
	focus.append('text')	
		.attr('id', 'focusTextYTwo')
		.attr("x", 9)
		.attr("fill", "black")
		.attr("stroke", "none")
		.attr("font-weight", "550")
		.attr("dy", ".35em");
}