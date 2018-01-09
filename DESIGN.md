# Design Document
###### Jesse Emmelot <br> 11963522

### Data sources
###### KNMI
http://projects.knmi.nl/klimatologie/daggegevens/selectie.cgi
- temperature for all weather stations in 2017
- radiation for all weather stations in 2017

All KNMI data is in .txt format and can be converted to JSON by running a selfmade Python file. Before conversion the excess text at the top of every data file will be trimmed, after which each data category (date, temperature etc.) get their own JSON key name. To use the JSON data in JavaScript, categories can be called by their key name from the JSON files.
