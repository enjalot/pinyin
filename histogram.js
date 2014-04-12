// Define our histogram component's controller code
function Histogram() {}
// All components have an init function that runs before anything happens
Histogram.prototype.init = function() {
  var model = this.model;
  model.setNull("data", []); // setNull only sets the value if the data doesnt already exist
  model.setNull("selection", []);
  model.setNull("height", 100);

  this.yScale = d3.scale.linear()
    .range([0, model.get("height")]);
  this.transform();
};

// create runs after the component (and the DOM) have been loaded.
Histogram.prototype.create = function() {
  var that = this;
  var model = this.model;

  // changes in values inside the array
  model.on("all", "data**", function() {
    that.transform()
  })
  model.on("all", "selection**", function() {
    that.transform()
  });
};

// This is where we transform the data into a format that's easier to render.
// this is following the d3 pattern of layouts (and copying d3.chart's naming convention)
Histogram.prototype.transform = function() {
  var model = this.model;
  var that = this;
  var data = model.get("data");
  var selection = model.get("selection");

  var totalMax = d3.max(data, function(d) { return d.value }) || 0;
  this.yScale.domain([0, totalMax]);

  // update the layout
  var layout = data.map(function(d,i) {
    var sel = selection[i] || { value: 0 };
    return {
      y: that.yScale.range()[1] - that.yScale(d.value),
      selectionY: that.yScale(d.value) - that.yScale(sel.value),
      height: that.yScale(d.value),
      selectionHeight: that.yScale(sel.value)
    }
  })
  // we do more computing in js (setDiffDeep) to avoid extra re-rendering.
  // Since Derby handles the data->DOM binding, we also tell it to judiciously
  // update the data if possible.
  model.setDiffDeep("layout", layout);
};

