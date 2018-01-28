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
	BUB:'white'
    },
    bubblesConfig: {
    	borderColor:'grey',
	animate: true,
	highlightFillColor: 'white',
	fillOpacity: 0.0,
	borderOpacity: 0.0,
    }
    });
    this.instance.bubbles( 
	[{"name": "Jeremy Piven", "date": "10/08/2017", "latitude": 42.01058288736683, "longitude": -74.68105313914677, "radius": 1.5, "fillKey": "BUB"}, {"name": "Adam Venit", "date": "10/10/2017", "latitude": 35.07534743826728, "longitude": -117.62383268335262, "radius": 1.5, "fillKey": "BUB"}, {"name": "Kevin Spacey", "date": "10/10/2017", "latitude": 36.01208637341128, "longitude": -119.2818019760097, "radius": 1.5, "fillKey": "BUB"}, {"name": "Oliver Stone", "date": "10/15/2017", "latitude": 35.36912937633856, "longitude": -118.76670565793644, "radius": 1.5, "fillKey": "BUB"}, {"name": "John Besh", "date": "10/21/2017", "latitude": 30.844205823792038, "longitude": -90.21851002521181, "radius": 1.5, "fillKey": "BUB"}, {"name": "John Besh", "date": "10/26/2017", "latitude": 31.22499274670905, "longitude": -90.54402455887401, "radius": 1.5, "fillKey": "BUB"}, {"name": "Brett Ratner", "date": "10/27/2017", "latitude": 34.71554039403516, "longitude": -119.25059883407299, "radius": 1.5, "fillKey": "BUB"}, {"name": "Brett Ratner", "date": "10/27/2017", "latitude": 34.23705375110091, "longitude": -118.97814228067058, "radius": 1.5, "fillKey": "BUB"}, {"name": "John Besh", "date": "10/27/2017", "latitude": 30.741135765893798, "longitude": -89.90336841716692, "radius": 1.5, "fillKey": "BUB"}, {"name": "Kevin Spacey", "date": "10/29/2017", "latitude": 34.84771951615004, "longitude": -118.81684253898021, "radius": 1.5, "fillKey": "BUB"}, {"name": "Kevin Spacey", "date": "10/31/2017", "latitude": 35.00683170576257, "longitude": -119.31868056268141, "radius": 1.5, "fillKey": "BUB"}, {"name": "Kevin Spacey", "date": "11/01/2017", "latitude": 35.97229427973187, "longitude": -118.66025775259078, "radius": 1.5, "fillKey": "BUB"}, {"name": "Brett Ratner", "date": "11/01/2017", "latitude": 41.184163603112395, "longitude": -73.44886697310834, "radius": 1.5, "fillKey": "BUB"}, {"name": "Ed Westwick", "date": "11/07/2017", "latitude": 35.6956940229393, "longitude": -117.79304345228154, "radius": 1.5, "fillKey": "BUB"}, {"name": "Robert Knepper", "date": "11/08/2017", "latitude": 33.53188432489383, "longitude": -108.20296208690228, "radius": 1.5, "fillKey": "BUB"}, {"name": "Jeffrey Tambor", "date": "11/08/2017", "latitude": 34.47406229565223, "longitude": -117.39526603669837, "radius": 1.5, "fillKey": "BUB"}, {"name": "Steven Seagal", "date": "11/09/2017", "latitude": 40.96416976202743, "longitude": -74.16723512529573, "radius": 1.5, "fillKey": "BUB"}, {"name": "Ed Westwick", "date": "11/09/2017", "latitude": 35.22219881496947, "longitude": -119.00854579736604, "radius": 1.5, "fillKey": "BUB"}, {"name": "Ed Westwick", "date": "11/09/2017", "latitude": 35.69934734066986, "longitude": -118.70094401785204, "radius": 1.5, "fillKey": "BUB"}, {"name": "Louis C.K.", "date": "11/09/2017", "latitude": 40.25006838455358, "longitude": -107.32568970274063, "radius": 1.5, "fillKey": "BUB"}, {"name": "Louis C.K.", "date": "11/09/2017", "latitude": 40.01953990269713, "longitude": -107.62110989707904, "radius": 1.5, "fillKey": "BUB"}, {"name": "Louis C.K.", "date": "11/09/2017", "latitude": 40.950117783006014, "longitude": -106.01595637402121, "radius": 1.5, "fillKey": "BUB"}, {"name": "Kevin Spacey", "date": "11/1/2017", "latitude": 34.14825913680018, "longitude": -117.95293160927524, "radius": 1.5, "fillKey": "BUB"}, {"name": "Brett Ratner", "date": "11/10/2017", "latitude": 35.37323490182497, "longitude": -118.52542535292086, "radius": 1.5, "fillKey": "BUB"}, {"name": "George Takei", "date": "11/10/2017", "latitude": 34.387137072193106, "longitude": -117.3969217365918, "radius": 1.5, "fillKey": "BUB"}, {"name": "Mark Schwan", "date": "11/12/2017", "latitude": 36.02159683511485, "longitude": -117.50213845551133, "radius": 1.5, "fillKey": "BUB"}, {"name": "Jesse Lacey", "date": "11/13/2017", "latitude": 42.12472344896444, "longitude": -74.50876042243353, "radius": 1.5, "fillKey": "BUB"}, {"name": "Jesse Lacey", "date": "11/13/2017", "latitude": 41.06802864032021, "longitude": -74.65588925634584, "radius": 1.5, "fillKey": "BUB"}, {"name": "James Woods", "date": "11/13/2017", "latitude": 35.03987137272975, "longitude": -118.7418000769942, "radius": 1.5, "fillKey": "BUB"}, {"name": "Kevin Spacey", "date": "11/16/2017", "latitude": 35.09863916444548, "longitude": -118.51510653535844, "radius": 1.5, "fillKey": "BUB"}, {"name": "Jeffrey Tambor", "date": "11/16/2017", "latitude": 36.02499200839335, "longitude": -118.42107020952422, "radius": 1.5, "fillKey": "BUB"}, {"name": "Ryan Seacrest", "date": "11/17/2017", "latitude": 35.724847867645, "longitude": -119.02692234858085, "radius": 1.5, "fillKey": "BUB"}, {"name": "Jeffrey Tambor", "date": "11/19/2017", "latitude": 34.12788951898909, "longitude": -119.31573960935356, "radius": 1.5, "fillKey": "BUB"}, {"name": "Jon Grissom", "date": "11/2/2017", "latitude": 35.2074509260052, "longitude": -119.15059027591985, "radius": 1.5, "fillKey": "BUB"}, {"name": "Oliver Stone", "date": "11/20/2017", "latitude": 35.23330802356847, "longitude": -117.49535728197316, "radius": 1.5, "fillKey": "BUB"}, {"name": "Russel Simmons", "date": "11/20/2017", "latitude": 34.386264124773945, "longitude": -117.4380105583345, "radius": 1.5, "fillKey": "BUB"}, {"name": "John Lasseter", "date": "11/21/2017", "latitude": 34.72604684087669, "longitude": -119.27613076370106, "radius": 1.5, "fillKey": "BUB"}, {"name": "Brett Ratner", "date": "11/22/2017", "latitude": 34.9860419363663, "longitude": -117.5589770397664, "radius": 1.5, "fillKey": "BUB"}, {"name": "Nick Carter", "date": "11/22/2017", "latitude": 34.301562550281794, "longitude": -118.6957967479216, "radius": 1.5, "fillKey": "BUB"}, {"name": "Johnny Iuzzin", "date": "11/29/2017", "latitude": 41.00931775263083, "longitude": -73.94983378184149, "radius": 1.5, "fillKey": "BUB"}, {"name": "Kevin Spacey", "date": "11/5/2017", "latitude": 34.302465098385206, "longitude": -118.5257685025851, "radius": 1.5, "fillKey": "BUB"}, {"name": "Kevin Spacey", "date": "11/5/2017", "latitude": 35.54589128590148, "longitude": -117.46000949150354, "radius": 1.5, "fillKey": "BUB"}, {"name": "James Levine", "date": "12/03/2017", "latitude": 40.8765841133474, "longitude": -74.69707137966937, "radius": 1.5, "fillKey": "BUB"}, {"name": " Melanie Martinez", "date": "12/04/2017", "latitude": 35.89783493609322, "longitude": -117.4053983974801, "radius": 1.5, "fillKey": "BUB"}, {"name": "Robert Knepper", "date": "12/05/2017", "latitude": 42.20050319335945, "longitude": -73.70399703240247, "radius": 1.5, "fillKey": "BUB"}, {"name": "Robert Knepper", "date": "12/05/2017", "latitude": 41.27463438412968, "longitude": -74.89506369811255, "radius": 1.5, "fillKey": "BUB"}, {"name": "Lee Trull", "date": "12/05/2017", "latitude": 33.203859865105166, "longitude": -96.43492989867678, "radius": 1.5, "fillKey": "BUB"}, {"name": "Bryan Singer", "date": "12/07/2017", "latitude": 47.665748669336956, "longitude": -122.09911790053131, "radius": 1.5, "fillKey": "BUB"}, {"name": "Dustin Hoffman", "date": "12/08/2017", "latitude": 35.38970834339593, "longitude": -118.04777226061348, "radius": 1.5, "fillKey": "BUB"}, {"name": "Murray Miller", "date": "12/11/2017", "latitude": 34.9476793296341, "longitude": -118.0343027970027, "radius": 1.5, "fillKey": "BUB"}, {"name": "Mario Batali", "date": "12/11/2017", "latitude": 31.213332492326956, "longitude": -90.71902653851883, "radius": 1.5, "fillKey": "BUB"}, {"name": "Dustin Hoffman", "date": "12/14/2017", "latitude": 42.580178721312315, "longitude": -74.31759950347822, "radius": 1.5, "fillKey": "BUB"}, {"name": "Dustin Hoffman", "date": "12/14/2017", "latitude": 42.29249414596385, "longitude": -73.03513675867583, "radius": 1.5, "fillKey": "BUB"}, {"name": "Dustin Hoffman", "date": "12/14/2017", "latitude": 40.879453312273384, "longitude": -74.65735707032695, "radius": 1.5, "fillKey": "BUB"}, {"name": "Morgan Spurlock ", "date": "12/14/2017", "latitude": 34.251135297731125, "longitude": -119.12392421999277, "radius": 1.5, "fillKey": "BUB"}, {"name": "T.J. Miller", "date": "12/19/2017", "latitude": 35.93880241316877, "longitude": -118.6594333290625, "radius": 1.5, "fillKey": "BUB"}, {"name": "Charles Dutoit", "date": "12/21/2017", "latitude": 42.13560288148717, "longitude": -73.66018140228833, "radius": 1.5, "fillKey": "BUB"}, {"name": "Max Landis", "date": "12/22/2017", "latitude": 36.014084705247186, "longitude": -118.14186117093698, "radius": 1.5, "fillKey": "BUB"}, {"name": "Max Landis", "date": "12/22/2017", "latitude": 34.37399040687443, "longitude": -118.23592478666527, "radius": 1.5, "fillKey": "BUB"}, {"name": "Max Landis", "date": "12/23/2017", "latitude": 34.27638961695541, "longitude": -118.66612304633128, "radius": 1.5, "fillKey": "BUB"}]
	    
	,{
	popupTemplate: function(geo, data) {
   		return "<div class='hoverinfo'>" + "Test!" + "</div>";
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

nextBubbleDate = function( currentDate ) {
	d3.selectAll(".datamaps-bubble")
		.filter(function(d) { 
			var datedata = currentDate.split("/");
			month = parseInt(datedata[0]);
			day = parseInt(datedata[1]);
			year = parseInt(datedata[2]);
			console.log((year * 365) + (month * 30) + day);
			var dated = d.date.split("/");
			monthd = parseInt(dated[0]);
			dayd = parseInt(dated[1]);
			yeard = parseInt(dated[2]);
			console.log((yeard*365)+(monthd*30)+dayd)	
			//return ((yeard*365)+(monthd+30)+dayd) <= ((year * 365) + (month * 30) + day )})
			return currentDate == d.date })
		.transition()
		.duration(1000)
		.ease(d3.easeLinear)
		.style("fill-opacity", 0.75);
}
//	.filter(function(d) { return d.date == currentDate })
