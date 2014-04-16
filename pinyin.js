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

var tones = [ "1", "2", "3", "4" ]

function getInitial(pin) {
  if(!pin) return "";
  for(var i = 0; i < initialsLen; i++) {
    if(pin.indexOf(initials[i]) === 0) return initials[i];
  }
  return "";
}
function getFinal(pin) {
  if(!pin) return "";
  for(var i = 0; i < finalsLen; i++) {
    if(pin.indexOf(finals[i]) >= 0) return finals[i];
  }
  return "";
}
function getTone(pin) {
  if(!pin) return "";
  for(var i = 0; i < 4; i++) {
    if(pin.indexOf(tones[i]) >= 0) return tones[i];
  }
  return "";
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
  var toneses = xf.dimension(function(d) {
    var pin = d.pinyin.split(",")[0];
    // find out which final matches
    return getTone(pin || "");
  });
  var match = xf.dimension(function(d) {
    var pin = d.pinyin.split(",")[0];
    return pin || "";
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
  closure.filterTone = function(tone) {
    toneses.filter(tone)
  }
  closure.filterMatch = function(pin) {
    match.filter(function(d) {
      if(!d) return false;
      return d.indexOf(pin) === 0;
    });
  }
  closure.clear = function() {
    starts.filter(null)
    ends.filter(null)
    toneses.filter(null)
    match.filter(null)
  }
  function copyGroup(array) {
    return array.map(function(d) {
      return { key: d.key, value: d.value };
    })
  }
  closure.groups = function() {
    var startGroups = copyGroup(starts.group().all());
    var endGroups = copyGroup(ends.group().all());
    var toneGroups = copyGroup(toneses.group().all());
    return {starts: startGroups, ends: endGroups, tones: toneGroups }
  }
  closure.starts = starts;
  closure.ends = ends;
  closure.tones = toneses;

  closure.top = function(x) {
    return match.top(x);
  }
  return closure;
}
