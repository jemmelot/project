# Jesse Emmelot
# 11963522

# This file converts several txt files into one JSON file.

import csv
import json

radiation_txt = 'radiation.txt'
temperature_txt = 'temperature.txt'
locations = 'locations.txt'

combined_json = 'data.json'

all_data = []

with open(locations, 'rb') as infile:
	reader = csv.reader(infile)
	for row in reader:
		data = {}
		data['name'] = row[3]
		data['id'] = row[0]
		data['lon'] = row[1]
		data['lat'] = row[2]
		data['dates'] = {}
		all_data.append(data)

with open(radiation_txt, 'rb') as infile:
	reader = csv.reader(infile)
	for row in reader:
		for line in all_data:
			if line['id'] == row[0]:
				line['dates'][row[1]] = {'radiation': row[2]}

with open(temperature_txt, 'rb') as infile:
	reader = csv.reader(infile)
	for row in reader:
		for line in all_data:
			if line['id'] == row[0]:
				line['dates'][row[1]]['temperature'] = row[2]
				
with open(combined_json, 'w') as outfile:
	json.dump(all_data, outfile)
