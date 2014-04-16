// Define our histogram component's controller code
function Definition() {}
// All components have an init function that runs before anything happens
Definition.prototype.init = function() {
  var model = this.model;
  model.setNull("char", ""); // setNull only sets the value if the data doesnt already exist

}

Definition.prototype.create = function() {
  var that = this;
  var model = this.model;
  model.on("change", "char", function() {
    that.fetch();
  })
}

Definition.prototype.fetch = function() {
  var model = this.model;
  var character = model.get("char");
  if(!character["char"]) {
    model.set("definition", []);
    model.set("numDefinitions", 0);
    return;
  }
  var s3url = "https://s3.amazonaws.com/pinyin/characters/charhash/";
  var url = s3url + encodeURIComponent(character["char"]) + ".csv";
  model.set("loading", true)
  d3.csv(url, function(err, data) {
    model.set("loading", false)
    if(err) {
      model.set("error", err);
      console.log("error", err);
      return;
    }
    data.sort(function(a,b) {
      return a["char"].length - b["char"].length
    });
    model.set("definition", data);
    model.set("numDefinitions", data.length);
  });
}
Definition.prototype.firstPinyin = function(pin) {
  console.log("pin", pin)
  return pin.split(",")[0];
}
