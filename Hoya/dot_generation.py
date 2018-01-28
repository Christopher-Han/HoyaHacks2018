
import csv
import numpy as np
import pandas as pd
import sys
import math
import random
import json
import copy


loc = pd.read_csv('cities.csv')
loc = loc.dropna(how='all')
lats = np.asarray(loc['lat'])
lngs = np.asarray(loc['lng'])
probs = list(loc['n_prob'])

probs[0] = probs[0] + (1-sum(probs)) 

## Build coordinates
coords = []
for i in range (0, len(lats)):
	coords.append((lats[i], lngs[i]))


## Build a list of dictionaries, each corresponding to a day

reader = csv.DictReader(open('search.csv', 'rb'))
days_dict = []
for line in reader:
	days_dict.append(line)

#print "days_dict: ", days_dict

## Build a dot dictionary for each google search 

dot_dict = {}
j_list = [{}]
count = 0
a = []
#print "probs: ", probs
#print "lats: ", lats
#print "lngs: ", lngs
print "Is sum 1:", sum(probs)

for day in range (0, len(days_dict)):
	todays_points = int(days_dict[day]['score'])
	print "Todays points:", todays_points
	
	for loop in range (0 , todays_points):
		
		dot_dict['day'] = day
		dot_dict['lat'] = np.random.choice(lats, 1, False, probs)[0] #+ random.uniform(-1.0, 1.0)
		dot_dict['lng'] = np.random.choice(lngs, 1, False, probs)[0] #+ random.uniform(-1.0, 1.0) 
		j_list.append(copy.copy(dot_dict))
		count+=1

'''
print "j_list:"
for i in range (0, len(j_list)):
	print j_list[i]
'''

with open('smalldots.json', 'w') as outfile:
    json.dump(j_list, outfile)
print count




