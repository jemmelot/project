# Design Document
###### Jesse Emmelot <br> 11963522

### Data sources
###### KNMI
http://projects.knmi.nl/klimatologie/daggegevens/selectie.cgi
- temperature for all weather stations in 2017
- radiation for all weather stations in 2017

All KNMI data is in .txt format and can be converted to JSON by running a selfmade Python file. Before conversion the excess text at the top of every data file will be trimmed, after which each data category (date, temperature etc.) gets its own JSON key name. To use the JSON data in JavaScript, categories can be called by their key name from the JSON files.

###### Solar panel data
- https://www.zonne-energiegids.nl/soorten-zonnepanelen/ <br> Four common types of solar panel. These could easily be displayed in a dropdown menu.

- https://woonbewust.nl/blog/soorten-zonnepanelen <br> Also four types of solar panel, including efficiency percentage as well as pros and cons. These pros and cons could also be in a tooltip that gets displayed when a dropdown menu option is hovered over.

###### User data
All user specific variables will have a selection menu of several value choices, for quicker usability and more concise plotting.

### Component overview (some images are not up to date. The actual working visualization has the most up to date designs)
###### Country map
![](doc/advanced_sketch_map.png)

###### Chart containing lines and bars
![](doc/advanced_sketch_linegraph.png)

###### Radar plot
![](doc/advanced_sketch_radarplot.png)

###### Results section
![](doc/advanced_sketch_results.png)

### Components description
###### Overall data structure
Since most components of this visualization are linked together, changing a value in one place may usually mean other values and visualization elements have to be updated. These updates can be made using an update function, which takes new data as input values to apply to other elements. Data is processed in the following ways:
- KNMI data: JSON format, each category has its own key-value pairs which can be called using a return-function with the key name as specified place to return from (for example "return d.temperature")
- Solar panel data: information stored as strings linked to a variable, processed by calling variable names.
- User data: inputs in the dropdown menus can be used as input values for calculation functions.

The images above contain general descriptions of how they function. This paragraph will add remaining details.
- ###### Country map
The dots representing the locations of the weather stations can be made by appending circles at the coordinates on the map, which are included in the KNMI datasets. An event listener will check for hovers, then change the color of the hovered dot.

- ###### Chart containing lines and bars
To switch between showing temperature/radiation and energy/profit potential next to the crosshairs, an simple switch element may be added to the charts.

- ###### Radar plot
Plotting the colored lines on the radarplot can be done by connecting the five radial points of data together. 

### Functions (in order)
###### updateRadar
Replots the colors area and lines on the radar chart everytime a user input is altered.

###### updateLine
Replots the colored lines and y-axes of the line chart when the weather station or month are changed

###### progressBar
Replots the radial progress bar everytime a user input is altered. This function contains two functions, 'update' and 'iterate' in order to animate the drawing of the bar.

##### calFactors
Determines monthly or yearly average temperature and radiation for calculation

###### calculation
Takes all user inputs, combined with the temperature/radiation data from the dataset to calculate the results and be able to plot all visualizations.

###### on click functions
Defined right after the calculation function, used to register all user inputs into variables.

###### lineCalculation
calculation function for the daily production and profit values to be displayed along the crosshair on the line chart

###### chartPlot
Used to update the currently selected month variable and call the line update function.

### D3 plugins
###### d3-tip
This plugin will be used to display most text and information on hover.
- displaying name of weather stations on the map
- displaying line/bar chart values next to the crosshair
- possibly displaying months above the slider

###### datamaps
This could be used to format and style the country map.

###### d3.slider
This offers simple and effective methods to make a slider.

###### d3.time.format
Used to convert dates from the dataset to proper date values.
