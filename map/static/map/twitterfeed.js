var config5 = {
  "id": '957345317984325634',
  "domId": 'tweets',
  "maxTweets": 20,
  "enableLinks": false,
  "showUser": false,
  "showTime": false,
  "dateFunction": '',
  "showRetweet": false,
  "customCallback": handleTweets,
  "showInteraction": false
};
var textarray = []; 
function RndText()
{
    var rannum = Math.floor(Math.random() * textarray.length);

    $('#tweets').fadeOut(2000, function() {
	 $(this).html(
      '<div style="text-align:center"><p style="font-family:\'Roboto\', sans-serif;">' + textarray[rannum] + "</p></div>"
    ).fadeIn(2000);
    });
}

function handleTweets(tweets){
    /*
    var x = tweets.length;
    var n = 0;
    var element = document.getElementById('tweets');
    var html = '<ul>';
    while(n < x) {
      html += '<li>' + tweets[n] + '</li>';
      n++;
    }
    html += '</ul>';
    element.innerHTML = html;
    */
    textarray = tweets; 
}

twitterFetcher.fetch(config5);

$(function() {
    // Call the random function when the DOM is ready:
    RndText(); 
});

var inter = setInterval(function() { RndText(); }, 10000);
