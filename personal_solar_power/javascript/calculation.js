/*
	calculate energy production and profit for any particular day of the year
*/
function dailyResults(dailyTemp, dailyRad, data, monthEfficiency) {
	idealInsolation = (dailyRad*10000)/3600000;
	insolationEfficiency = monthEfficiency[monthValue]["angle"][angle];
	trueInsolationEfficiency = insolationEfficiency * orientationEfficiency;
	trueInsolation = idealInsolation * trueInsolationEfficiency;
	basicOutput = trueInsolation*capacity;
	productionDay = basicOutput*(1-(((dailyTemp - 25)*coefficient))/100);
	profitDay = productionDay*energy;
	
	var dailyArray = [productionDay, profitDay]
	
	return dailyArray;
};

/*
	combine all daily results from a particular month and the whole year
*/
function periodResults(monthValue, station, data, monthEfficiency) {
	var yearProduction = 0;
	var yearProfit = 0;
	var monthProduction = 0;
	var monthProfit = 0;
			
	if (monthValue != "") {			
		for (var i = 0; i < ((months.length) - 1); i++) {
			var tempProduction = 0;
							
			for (var j = 0; j < data[station].dates[months[i]].length; j++) {
				yearProduction += dailyResults(data[station].dates[months[i]][j].temperature, data[station].dates[months[i]][j].radiation, data, monthEfficiency)[0];
				yearProfit += dailyResults(data[station].dates[months[i]][j].temperature, data[station].dates[months[i]][j].radiation, data, monthEfficiency)[1];
				tempProduction += dailyResults(data[station].dates[months[i]][j].temperature, data[station].dates[months[i]][j].radiation, data, monthEfficiency)[0];
			}
			
			monthFactors[i]["value"] = tempProduction;
		}
		
		var periodArray = [yearProduction, yearProfit]
								
		if (monthValue != "Jaar") {
			for (var i = 0; i < data[station].dates[monthValue].length; i++) {
				monthProduction += dailyResults(data[station].dates[monthValue][i].temperature, data[station].dates[monthValue][i].radiation, data, monthEfficiency)[0];
				monthProfit += dailyResults(data[station].dates[monthValue][i].temperature, data[station].dates[monthValue][i].radiation, data, monthEfficiency)[1];
			}
			
			periodArray.push(monthProduction);
			periodArray.push(monthProfit);
		}
					
		return periodArray;
	}
}

/*
	adjust roof angle score based on which period is selected
*/
function scoreAngle(data, monthEfficiency) {
	var tempArray = Object.keys(monthEfficiency[monthValue]["angle"]).map(function ( key ) { return monthEfficiency[monthValue]["angle"][key]; });
	bestAngle = Math.max.apply( null, tempArray );
	worstAngle = Math.min.apply( null, tempArray );
	angleScore = ((monthEfficiency[monthValue]["angle"][angle]) - worstAngle)/(bestAngle - worstAngle);

	return angleScore;
};

/* 
	main calculation function
*/
function calculation(data, monthEfficiency) {
	if (orientation.length != 0 && angle.length != 0 && surface !=0 && panel.length != 0 && usage != 0) {
		
		// update roof angle score and overall score
		angleScore = scoreAngle(data, monthEfficiency);				
		houseScore = ((orientationScore + angleScore + surfaceScore + panelScore + usageScore)/5)*100; 
		
		// update radar chart data
		radarData = [
			[
				{axis: "Oriëntatie", value: orientationScore},
				{axis: "Dakhoek", value: angleScore},
				{axis: "Dakoppervlak", value: surfaceScore},
				{axis: "Paneeltype", value: panelScore},
				{axis: "Verbruik", value: usageScore},								
			]
		];
				
		// update radar chart
		updateRadar(radarData, cfg);
		
		// calculate production and profit for a particular period
		capacity = surface*efficiency*inverterEfficiency;
		totalCost = (surface/size)*cost;		
		productionYear = periodResults(monthValue, station, data, monthEfficiency)[0];
		profitYear = periodResults(monthValue, station, data, monthEfficiency)[1];
		productionMonth = periodResults(monthValue, station, data, monthEfficiency)[2];
		profitMonth = periodResults(monthValue, station, data, monthEfficiency)[3];
		
		// calculate payback period based on yearly profit
		payback = totalCost/profitYear;
				
		monthFactors.forEach(function(d) {
			d["value"] /= productionYear;				
		});
		pieColors(monthFactors, piePath);
		
		// update pie chart
		updatePie(monthFactors);
							
		// update result div values when a new calculation is made
		if (monthValue == "Jaar") {
			$(".results > .production").text(Math.round(parseFloat(productionYear)));
			$(".results > .profit").text(Math.round(parseFloat(profitYear)));
		}
		else {
			$(".results > .production").text(Math.round(parseFloat(productionMonth)));
			$(".results > .profit").text(Math.round(parseFloat(profitMonth)));
		};	
		$(".results > .payback").text(Math.round(parseFloat(payback)));
		
		d3.select("#progress").select(".radial-progress").remove();
		d3.select("#progress").select("svg").remove();
		
		// update radial progress bar to reflect any changes in user input
		if (progressMade == 1)
		{
			updateProgress(houseScore);
		}	
		
		// on the first calculation, draw the initial radial progress bar
		if (progressMade == 0) {
			progressBar(houseScore);
			progressMade = 1;
		}				
	}
};

