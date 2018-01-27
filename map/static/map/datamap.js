var bombMap = new Datamap({
  element: document.getElementById("map"),
  height: null,
  width: null, 
  scope: 'world',
  setProjection: function(element) {
    var projection = d3.geo.equirectangular()
      .center([-98.5,40])
      .rotate([4.4, 0])
      .scale(400)
      .translate([element.offsetWidth / 2, element.offsetHeight / 2]);
    var path = d3.geo.path()
      .projection(projection);

    return {path: path, projection: projection};
  },
  fills: {
    defaultFill: "grey",
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


