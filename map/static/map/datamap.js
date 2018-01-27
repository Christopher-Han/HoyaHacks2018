var bombMap = new Datamap({
  element: document.getElementById("map"),
  scope: 'usa',
  fills: {
    defaultFill: "#FFFFFF",
    win: '#000000',
    'BUB':'000000'
  },
  data: {
    'BUB':{fillKey:'BUB'}
  }
});

// Arcs coordinates can be specified explicitly with latitude/longtitude,
// or just the geographic center of the state/country.
var bombs = [{
	name:'Harvey Weinstein',
	radius:5,
	significance:'First victim speaks',
        latitude: 40.639722,
        longitude: -73.778889,
	fillKey:'BUB'
  }
];

bombMap.bubbles(bombs, {
	popupTemplate: function (geo, data) {
		return ['<div class="hoverinfo" color="red">' + data.name,
            	'<br/>Info: ' +  data.significance + '',
            	'</div>'].join('');
	}
});
