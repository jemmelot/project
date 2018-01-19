# Jesse Emmelot
# 11963522

# This file converts several txt files into one JSON file.

import csv
import json

radiation_txt = 'radiation.txt'
temperature_txt = 'temperature.txt'
locations = 'locations.txt'

combined_json = 'data.json'

all_data = {}
months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

with open(locations, 'rb') as infile:
	reader = csv.reader(infile)
	for row in reader:
		all_data[row[3]] = {}
		all_data[row[3]]['id'] = row[0]
		all_data[row[3]]['lon'] = float(row[1])
		all_data[row[3]]['lat'] = float(row[2])
		all_data[row[3]]['dates'] = {}
		
		for month in months:
			all_data[row[3]]['dates'][month] = []
		
with open(radiation_txt, 'rb') as infile:
	reader = csv.reader(infile)
	for row in reader:
		for line in all_data:
			temp = all_data.get(line, '')
			if temp['id'] == row[0]:
				for month in months:
					if month in row[1]:
						temp['dates'][month].append({'date': row[1], 'radiation': int(row[2])}) 
						
with open(temperature_txt, 'rb') as infile:
	reader = csv.reader(infile)
	for row in reader:
		for line in all_data:
			temp = all_data.get(line, '')
			if temp['id'] == row[0]:
				for month in months:
					if month in row[1]:
						for info in temp['dates'][month]:
							temp2 = info.get('date')
							if temp2 == row[1]:
								info['temperature'] = int(row[2]) 
										
with open(combined_json, 'w') as outfile:
	json.dump(all_data, outfile)
