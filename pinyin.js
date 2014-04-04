// UI for visualizing Pinyin

// keep track of state
var selected = {
  pinyin: "",
  bupo: "",
  finals: ""
}

// Constants
//  http://en.wikipedia.org/wiki/Pinyin#Initials
// cheating a little bit to go more with how we type than the official
// pinyin system. technically w and y arent initials, but for all practical
// typing purposes they are
var initials = [
 "zh", "ch", "sh", "b", "p", "m", "f", "d", "t", "n", "l", "g", "k", "h", "j",
 "q", "x", "r", "z", "c", "s", "w", "y"
];
var initialsLen = initials.length;

//http://en.wikipedia.org/wiki/Pinyin#Finals
var finals = [
  "ang", "an", "ai", "ao",
  "iang", "ian", "ia",
  "iong", "ie", "ing", "in", "iu",
  "u:an", "u:e", "u:n", "u:",
  "uang", "uan", "ua", "ui", "un", "uo",
  "eng", "en", "ei", "e",
  "ou", "ong",
  "u", "i", "o", "a"
];
var finalsLen = finals.length;

function getInitial(pin) {
  for(var i = 0; i < initialsLen; i++) {
    if(pin.indexOf(initials[i]) === 0) return initials[i];
  }
  return "";
}
function getFinal(pin) {
  for(var i = 0; i < finalsLen; i++) {
    if(pin.indexOf(finals[i]) >= 0) return finals[i];
  }
  return "";
}

function histo() {
  var groups;
  var div, bars;
  var yscale = d3.scale.linear()
    .range([0, 100]);
  var chart = function(sel) {
    div = sel;
    bars = div.append("div").classed("bars", true);
  }
  chart.update = function() {
    yscale.domain([0, d3.max(groups, function(d) { return d.value })]);
    var barSel = bars.selectAll('div.bar')
      .data(groups);

    var barEnter = barSel.enter()
      .append("div")
      .classed("bar", true)
    barEnter.append("span").classed("letter", true)
    .style({
      "margin-top": function(d) { return (yscale.range()[1] - yscale(d.value)) + "px" },
    })
    .text(function(d) { return d.key })
    //barEnter.append("span").classed("letter", true)
    //.text(function(d) { return d.key })


    barSel.style({
      "margin-top": function(d) { return (yscale.range()[1] - yscale(d.value)) + "px" },
      height: function(d) { return yscale(d.value) + "px" }
    })

    barSel.on("click", function(d,i) {
      console.log("BAR", d);
    })

  }
  chart.data = function(_) {
    if(!arguments.length) return groups;
    groups = _;
    return chart;
  }
  return chart;
}

function cross() {
  var xf = crossfilter();
  var starts = xf.dimension(function(d) {
    // split on , for chars with multiple pronounciations
    // we go with the first pinyin for now.
    var pin = d.pinyin.split(",")[0];
    // find out which initial matches
    return getInitial(pin);
  });
  var ends = xf.dimension(function(d) {
    var pin = d.pinyin.split(",")[0];
    // find out which final matches
    return getFinal(pin);
  });
  var match = xf.dimension(function(d) {
    var pin = d.pinyin.split(",")[0];
    return pin;
  });
  /*
  var tones = xf.dimension(function(d) {
    return false;
  });
  */

  var closure = function(chars) {
    xf.add(chars);
  }

  closure.filterStart = function(start) {
    starts.filter(start);
  }
  closure.filterEnd = function(end) {
    ends.filter(end)
  }
  closure.filterMatch = function(pin) {
    match.filter(function(d) {
      return d.indexOf(pin) === 0;
    });
  }
  closure.clear = function() {
    starts.filter(null)
    ends.filter(null)
    match.filter(null)
  }
  closure.groups = function() {
    var startGroups = starts.group().all();
    var endGroups = ends.group().all();
    return {starts: startGroups, ends: endGroups }
  }
  closure.top = function(x) {
    return match.top(x);
  }
  return closure;
}
