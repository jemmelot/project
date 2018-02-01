function pieChart(data) {
	// select svg to put the pie chart into
	svgPie = d3.select("#pie"),
		pieWidth = 260,
		pieHeight = 260,
		radius = Math.min(pieWidth, pieHeight) / 2,
		gPie = svgPie.append("g").attr("transform", "translate(" + (pieWidth / 2 + 15) + "," + (pieHeight / 2 + 15) + ")");
	
	// declare pie chart basis	
	pie = d3.layout.pie()
			.sort(null)
			.value(function(d) { return d.value; });

	// pie chart parameters		
	piePath = d3.svg.arc()
		.outerRadius(radius - 10)
		.innerRadius(0);
	
	// text label position arc
	labelArc = d3.svg.arc()
		.outerRadius(radius - 45)
		.innerRadius(radius - 45);	

	// define tooltip that shows the value at each pie chart slice
	pieTip = d3.tip()
		.attr("class", "tip")
		.offset([40, 0])
		.html(function(d) {
			return "<strong>Bijdrage:<strong> <span>" + parseInt(d.value*100) + "%</span>";
		});
	
	// variable to distribute the slices based on data
	arc = gPie
		.datum(monthFactors)
		.selectAll("path")
		.data(pie)
		.enter()
		.append("path")
		.attr("d", piePath)
		.attr("stroke", "white")
		.attr("fill", function(d) { return d.data["color"]; })
		.attr("id", function(d) { return "pieName" + d.data["month"] ;})
		.each(function(d) {
			this._current = d;			
		})
		.on("click", function(d) {
			monthValue = d.data["month"];
			
			// when a particular month is selected from the pie chart, change the slider position and thereby all visualization data and results
			slider.value(monthValue);
			
			gPie.selectAll("path")
				.style("fill", "#ffffcc")
			d3.select(this)
				.style("fill", "orange")		
		})
		.on('mouseover', pieTip.show)
		.on('mouseout', pieTip.hide);
	
	gPie.append("g")
		.attr("class", "labelText");
	
	// add month names to their corresponding slice
	pieText = gPie.select(".labelText").selectAll("text")
		.data(pie(monthFactors), function(d) {
			return d.data["month"]
		})
		.enter()
		.append("text")	
		.attr("transform", function(d) { 
			var midAngle = d.endAngle < Math.PI ? d.startAngle/2 + d.endAngle/2 : d.startAngle/2  + d.endAngle/2 + Math.PI ;
			return "translate(" + labelArc.centroid(d)[0] + "," + labelArc.centroid(d)[1] + ") rotate(-90) rotate(" + (midAngle * 180/Math.PI) + ")"; })
		.attr("dy", "0.35em")
		.attr("font-size", "15px")
		.attr('text-anchor','middle')
		.text(function(d) { return d.data["month"]; })
		.each(function(d) {
			this._current = d;			
		});
	
	// draw the pie chart along with tooltip functionality
	svgPie.call(pieTip);	
};