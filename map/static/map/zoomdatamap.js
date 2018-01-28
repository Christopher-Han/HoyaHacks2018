function Zoom(args) {
  $.extend(this, {
    $buttons:   $(".zoom-button"),
    $info:      $("#zoom-info"),
    scale:      { max: 50, currentShift: 0 },
    $container: args.$container,
    datamap:    args.datamap
  });

  this.init();
}

Zoom.prototype.init = function() {
  var paths = this.datamap.svg.selectAll("path"),
      subunits = this.datamap.svg.selectAll(".datamaps-subunit");

  // preserve stroke thickness
  paths.style("vector-effect", "non-scaling-stroke");

  // disable click on drag end
  subunits.call(
    d3.behavior.drag().on("dragend", function() {
      d3.event.sourceEvent.stopPropagation();
    })
  );

  this.scale.set = this._getScalesArray();
  this.d3Zoom = d3.behavior.zoom().scaleExtent([ 1, this.scale.max ]);
  this.$container = $("#map");

  this._displayPercentage(1);
  this.listen();
};

Zoom.prototype.listen = function() {
  this.$buttons.off("click").on("click", this._handleClick.bind(this));

  this.datamap.svg
    .call(this.d3Zoom.on("zoom", this._handleScroll.bind(this)))
    .on("dblclick.zoom", null); // disable zoom on double-click
};

Zoom.prototype.reset = function() {
  this._shift("reset");
};

Zoom.prototype._handleScroll = function() {
  var translate = d3.event.translate,
      scale = d3.event.scale,
      limited = this._bound(translate, scale);
  console.log("Trans: " + limited.translate);
  console.log("s: " + limited.scale);
  this.scrolled = true;

  this._update(limited.translate, limited.scale);
};

Zoom.prototype._handleClick = function(event) {
  var direction = $(event.target).data("zoom");

  this._shift(direction);
};

Zoom.prototype._shift = function(direction) {
  this.$container = $("#map");
  this.d3Zoom = d3.behavior.zoom().scaleExtent([ 1, this.scale.max ]);
  var center = [ this.$container.width() / 2, this.$container.height() / 2 ],
      translate = this.d3Zoom.translate(), translate0 = [], l = [],
      view = {
        x: translate[0],
        y: translate[1],
        k: this.d3Zoom.scale()
      }, bounded;

  translate0 = [
    (center[0] - view.x) / view.k,
    (center[1] - view.y) / view.k
  ];

	if (direction == "reset") {
  	view.k = 1;
    this.scrolled = true;
  } else {
  	view.k = this._getNextScale(direction);
  }

l = [ translate0[0] * view.k + view.x, translate0[1] * view.k + view.y ];

  view.x += center[0] - l[0];
  view.y += center[1] - l[1];

  bounded = this._bound([ view.x, view.y ], view.k);

  this._animate(bounded.translate, bounded.scale);
};

Zoom.prototype._repeat = function() {
	Zoom.prototype._shift("out");
}

Zoom.prototype._bound = function(translate, scale) {
  var width = this.$container.width(),
      height = this.$container.height();

  translate[0] = Math.min(
    (width / height)  * (scale - 1),
    Math.max( width * (1 - scale), translate[0] )
  );

  translate[1] = Math.min(0, Math.max(height * (1 - scale), translate[1]));

  return { translate: translate, scale: scale };
};

Zoom.prototype._update = function(translate, scale) {
  this.d3Zoom
    .translate(translate)
    .scale(scale);

  this.datamap.svg.selectAll("g")
    .attr("transform", "translate(" + translate + ")scale(" + scale + ")");

  this._displayPercentage(scale);
};

Zoom.prototype._animate = function(translate, scale) {
  var _this = this,
      d3Zoom = this.d3Zoom;

  d3.transition().duration(10000).tween("zoom", function() {
    var iTranslate = d3.interpolate(d3Zoom.translate(), translate),
        iScale = d3.interpolate(d3Zoom.scale(), scale);

		return function(t) {
      _this._update(iTranslate(t), iScale(t));
    };
  });
};

Zoom.prototype._displayPercentage = function(scale) {
  var value;

  value = Math.round(Math.log(scale) / Math.log(this.scale.max) * 100);
  this.$info.text(value + "%");
};

Zoom.prototype._getScalesArray = function() {
  var array = [],
      scaleMaxLog = Math.log(this.scale.max);

  for (var i = 0; i <= 10; i++) {
    array.push(Math.pow(Math.E, 0.1 * i * scaleMaxLog));
  }

  return array;
};

Zoom.prototype._getNextScale = function(direction) {
  var scaleSet = this.scale.set,
      currentScale = this.d3Zoom.scale(),
      lastShift = scaleSet.length - 1,
      shift, temp = [];

  if (this.scrolled) {

    for (shift = 0; shift <= lastShift; shift++) {
      temp.push(Math.abs(scaleSet[shift] - currentScale));
    }

    shift = temp.indexOf(Math.min.apply(null, temp));

    if (currentScale >= scaleSet[shift] && shift < lastShift) {
      shift++;
    }

    if (direction == "out" && shift > 0) {
      shift--;
    }

    this.scrolled = false;

  } else {

    shift = this.scale.currentShift;

    if (direction == "out") {
      shift > 0 && shift--;
    } else {
      shift < lastShift && shift++;
    }
  }

  this.scale.currentShift = shift;

  return scaleSet[shift];
};

function Datamap() {
    this.$container = $("#map");
    this.instance = new Datamaps({
    scope: 'world',
    element: this.$container.get(0),
    projection: 'mercator',
    done: this._handleMapReady.bind(this),
    geographyConfig: {
	highlightFillColor: 'white',
	highlightOnHover: false,
	popupOnHover: false,
    },
    fills: {
	defaultFill: "#white",
	BUB:'black'
    },
    bubblesConfig: {
    	borderColor:'grey',
	animate: true,
	highlightFillColor: 'white',
    }
    });

    
this.instance.bubbles(
[{"name": "Adam Venit", "latitude": 34.90085448424187, "longitude": -117.74864267075895, "radius": 1.5, "fillKey": "BUB"}, {"name": "Jon Grissom", "latitude": 34.776592083560175, "longitude": -118.14853659253048, "radius": 1.5, "fillKey": "BUB"}, {"name": "Kevin Spacey", "latitude": 34.648655750031935, "longitude": -118.88125999776737, "radius": 1.5, "fillKey": "BUB"}, {"name": "Kevin Spacey", "latitude": 34.391065325022474, "longitude": -118.57207625829228, "radius": 1.5, "fillKey": "BUB"}, {"name": "Kevin Spacey", "latitude": 35.77470897502638, "longitude": -118.16405939763065, "radius": 1.5, "fillKey": "BUB"}, {"name": "Kevin Spacey", "latitude": 34.44364106372582, "longitude": -117.520554223222, "radius": 1.5, "fillKey": "BUB"}, {"name": "Kevin Spacey", "latitude": 34.76263073622775, "longitude": -118.423698487352, "radius": 1.5, "fillKey": "BUB"}, {"name": "Kevin Spacey", "latitude": 34.890197547591704, "longitude": -118.21352207849081, "radius": 1.5, "fillKey": "BUB"}, {"name": "Kevin Spacey", "latitude": 35.80076103757435, "longitude": -119.30130737044104, "radius": 1.5, "fillKey": "BUB"}, {"name": "Kevin Spacey", "latitude": 34.318653938726236, "longitude": -118.82694867514664, "radius": 1.5, "fillKey": "BUB"}, {"name": "Jeremy Piven", "latitude": 42.24113547798341, "longitude": -74.4210004369514, "radius": 1.5, "fillKey": "BUB"}, {"name": "Steven Seagal", "latitude": 34.44651398036724, "longitude": -117.9929840625665, "radius": 1.5, "fillKey": "BUB"}, {"name": "Steven Seagal", "latitude": 41.40752235574988, "longitude": -73.00041293935557, "radius": 1.5, "fillKey": "BUB"}, {"name": "Ed Westwick", "latitude": 35.35816474116783, "longitude": -118.41248546349293, "radius": 1.5, "fillKey": "BUB"}, {"name": "Ed Westwick", "latitude": 35.679277950909544, "longitude": -118.83126933942954, "radius": 1.5, "fillKey": "BUB"}, {"name": "Ed Westwick", "latitude": 34.540793231570476, "longitude": -118.15296738361462, "radius": 1.5, "fillKey": "BUB"}, {"name": "Robert Knepper", "latitude": 33.311839105401646, "longitude": -108.57033016195096, "radius": 1.5, "fillKey": "BUB"}, {"name": "Robert Knepper", "latitude": 41.69033400467996, "longitude": -74.61906372353351, "radius": 1.5, "fillKey": "BUB"}, {"name": "Robert Knepper", "latitude": 40.821303652212855, "longitude": -74.13162270560471, "radius": 1.5, "fillKey": "BUB"}, {"name": "Dustin Hoffman", "latitude": 35.48234830993095, "longitude": -117.58339587339786, "radius": 1.5, "fillKey": "BUB"}, {"name": "Dustin Hoffman", "latitude": 42.166388528755256, "longitude": -73.99073388207965, "radius": 1.5, "fillKey": "BUB"}, {"name": "Dustin Hoffman", "latitude": 41.060418424689296, "longitude": -73.59037904720522, "radius": 1.5, "fillKey": "BUB"}, {"name": "Dustin Hoffman", "latitude": 40.73784569980852, "longitude": -74.52244043639156, "radius": 1.5, "fillKey": "BUB"}, {"name": "Oliver Stone", "latitude": 35.59893908565953, "longitude": -117.86653116139954, "radius": 1.5, "fillKey": "BUB"}, {"name": "Oliver Stone", "latitude": 35.18344160351057, "longitude": -118.05685510386245, "radius": 1.5, "fillKey": "BUB"}, {"name": "Louis C.K.", "latitude": 40.94936362902724, "longitude": -106.8932648310181, "radius": 1.5, "fillKey": "BUB"}, {"name": "Louis C.K.", "latitude": 39.40322688998328, "longitude": -107.61174694773351, "radius": 1.5, "fillKey": "BUB"}, {"name": "Louis C.K.", "latitude": 40.780815300195115, "longitude": -107.28867475663894, "radius": 1.5, "fillKey": "BUB"}, {"name": "Jesse Lacey", "latitude": 41.305651003422405, "longitude": -74.0356678692474, "radius": 1.5, "fillKey": "BUB"}, {"name": "Jesse Lacey", "latitude": 41.40785746790194, "longitude": -74.36692137158474, "radius": 1.5, "fillKey": "BUB"}, {"name": "Brett Ratner", "latitude": 35.47476529685899, "longitude": -117.47533529008103, "radius": 1.5, "fillKey": "BUB"}, {"name": "Brett Ratner", "latitude": 35.54691228830854, "longitude": -118.90324687780438, "radius": 1.5, "fillKey": "BUB"}, {"name": "Brett Ratner", "latitude": 42.198189117372635, "longitude": -74.81589391511187, "radius": 1.5, "fillKey": "BUB"}, {"name": "Brett Ratner", "latitude": 35.83143416236029, "longitude": -117.35409176497757, "radius": 1.5, "fillKey": "BUB"}, {"name": "Brett Ratner", "latitude": 34.244485065443534, "longitude": -117.75208266679786, "radius": 1.5, "fillKey": "BUB"}, {"name": "George Takei", "latitude": 34.23316608491458, "longitude": -117.58131437366431, "radius": 1.5, "fillKey": "BUB"}, {"name": "Mark Schwan", "latitude": 35.203878222032415, "longitude": -117.83822502657478, "radius": 1.5, "fillKey": "BUB"}, {"name": "Russel Simmons", "latitude": 35.607081881034524, "longitude": -118.21086008675977, "radius": 1.5, "fillKey": "BUB"}, {"name": "James Woods", "latitude": 34.216245591818115, "longitude": -118.8692710924881, "radius": 1.5, "fillKey": "BUB"}, {"name": "Ryan Seacrest", "latitude": 35.49757085168763, "longitude": -119.28529299610807, "radius": 1.5, "fillKey": "BUB"}, {"name": "Murray Miller", "latitude": 34.97745009222519, "longitude": -117.90021478804945, "radius": 1.5, "fillKey": "BUB"}, {"name": "Jeffrey Tambor", "latitude": 35.476404987871945, "longitude": -117.68076694314645, "radius": 1.5, "fillKey": "BUB"}, {"name": "Jeffrey Tambor", "latitude": 34.16783352188714, "longitude": -117.86397255412516, "radius": 1.5, "fillKey": "BUB"}, {"name": "Jeffrey Tambor", "latitude": 34.800142083745726, "longitude": -117.40890345223885, "radius": 1.5, "fillKey": "BUB"}, {"name": "John Lasseter", "latitude": 35.18772685050153, "longitude": -117.40821288892982, "radius": 1.5, "fillKey": "BUB"}, {"name": "Nick Carter", "latitude": 35.981892687517814, "longitude": -117.88276033349807, "radius": 1.5, "fillKey": "BUB"}, {"name": "James Levine", "latitude": 41.070637693554744, "longitude": -73.7936228703877, "radius": 1.5, "fillKey": "BUB"}, {"name": " Melanie Martinez", "latitude": 34.85114348641272, "longitude": -118.65420164251029, "radius": 1.5, "fillKey": "BUB"}, {"name": "Lee Trull", "latitude": 33.226391225123415, "longitude": -96.4835468404761, "radius": 1.5, "fillKey": "BUB"}, {"name": "Bryan Singer", "latitude": 48.29492541118364, "longitude": -121.61765124818504, "radius": 1.5, "fillKey": "BUB"}, {"name": "Johnny Iuzzin", "latitude": 42.60863579063056, "longitude": -73.77202635848201, "radius": 1.5, "fillKey": "BUB"}, {"name": "Mario Batali", "latitude": 31.05450760754587, "longitude": -89.21519911903604, "radius": 1.5, "fillKey": "BUB"}, {"name": "Morgan Spurlock ", "latitude": 35.59625600513719, "longitude": -118.18749625204782, "radius": 1.5, "fillKey": "BUB"}, {"name": "John Besh", "latitude": 30.191300761177004, "longitude": -89.10748577303598, "radius": 1.5, "fillKey": "BUB"}, {"name": "John Besh", "latitude": 31.04769946349338, "longitude": -89.196667442135, "radius": 1.5, "fillKey": "BUB"}, {"name": "John Besh", "latitude": 30.01665069176846, "longitude": -89.24205249001291, "radius": 1.5, "fillKey": "BUB"}, {"name": "T.J. Miller", "latitude": 35.85272935621399, "longitude": -118.53168591686739, "radius": 1.5, "fillKey": "BUB"}, {"name": "Charles Dutoit", "latitude": 41.8975512142502, "longitude": -73.95416778443526, "radius": 1.5, "fillKey": "BUB"}, {"name": "Max Landis", "latitude": 35.3675745595163, "longitude": -118.8775668698357, "radius": 1.5, "fillKey": "BUB"}, {"name": "Max Landis", "latitude": 34.95761662716033, "longitude": -118.36682794430048, "radius": 1.5, "fillKey": "BUB"}, {"name": "Max Landis", "latitude": 35.59446284626364, "longitude": -117.56445356556183, "radius": 1.5, "fillKey": "BUB"}]	

	,{
	popupTemplate: function(geo, data) {
   		return "<div class='hoverinfo'><font color="black"> + "Test!" + </font>";
 	}
});
}

Datamap.prototype._handleMapReady = function(datamap) {
	this.zoom = new Zoom({
  	$container: this.$container,
  	datamap: datamap
  });
}

dm = new Datamap();

repeat = function() {
	dm.zoom._shift();
}
