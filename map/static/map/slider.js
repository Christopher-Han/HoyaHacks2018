function update() {

}

update();
var currentYear = 2000;
d3.selectAll(".news").style("opacity", 0);
d3.select("#slider").call(chroniton().width(1476).playButton(true).playbackRate(0.2).loop(true).on('change', function(date) {
  var newYear = Math.ceil((date.getFullYear())) * 10; // (2)
  if (newYear != currentYear) { // (3)
        currentYear = newYear;
        d3.select("#date").html(currentYear);
        d3.selectAll(".news").style("opacity", 0);
        var randNum = Math.floor(Math.random() * 700) + 700;
        d3.selectAll(".news").style("left", randNum + "px"); 
        d3.selectAll(".news").style("opacity", 0).transition().duration(750).style("opacity", 1);
  }

}));
