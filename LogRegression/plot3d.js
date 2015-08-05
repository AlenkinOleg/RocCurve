 var data3d;
 var xSc3D, ySc3D, zSc3D;
 var ease;
 //Some variables are defined at main.html (like labels, dataset, ...)
function scatterPlot3d(parent)
{
	  var x3d = parent  
		.append("x3d")
		  .style( "width", parseInt(parent.style("width"))+"px" )
		  .style( "height", parseInt(parent.style("height"))+"px" )
		  .style( "border", "none" )
		  
	  var scene = x3d.append("scene")

	  scene.append("orthoviewpoint")
		 .attr( "centerOfRotation", [5, 5, 5])
		 .attr( "fieldOfView", [-5, -5, 15, 15])
		 .attr( "orientation", [-0.5, 1, 0.2, 1.12*Math.PI/4])
		 .attr( "position", [8, 4, 15])

	  var axisRange = [0, 8];
	  var scales = [];
	  var initialDuration = 0;
	  var defaultDuration = 800;
	  ease = 'linear';
	  var time = 0;
	  var axisKeys = ["x", "y", "z"];
  // Helper functions for initializeAxis() and drawAxis()
  function axisName( name, axisIndex ) {
    return ['x','y','z'][axisIndex] + name;
  }

  function constVecWithAxisValue( otherValue, axisValue, axisIndex ) {
    var result = [otherValue, otherValue, otherValue];
    result[axisIndex] = axisValue;
    return result;
  }

  // Used to make 2d elements visible
  function makeSolid(selection, color) {
    selection.append("appearance")
      .append("material")
         .attr("diffuseColor", color||"black")
    return selection;
  }

  // Initialize the axes lines and labels.
  function initializePlot() {
    initializeAxis(0, [-4, 4]);
    initializeAxis(1, [0, Math.max(lr.loglossPenalties([-4, -4])[0], lr.loglossPenalties([4, 4])[0], lr.loglossPenalties([-4, -4])[1], lr.loglossPenalties([4, 4])[1])]);
    initializeAxis(2, [-4, 4]);
  }

  function initializeAxis( axisIndex, axisDomain )
  {
    var key = axisKeys[axisIndex];
    drawAxis( axisIndex, key, initialDuration, axisDomain );

    var scaleMin = axisRange[0];
    var scaleMax = axisRange[1];

    // the axis line
    var newAxisLine = scene.append("transform")
         .attr("class", axisName("Axis", axisIndex))
         .attr("rotation", ([[0,0,0,0],[0,0,1,Math.PI/2],[0,1,0,-Math.PI/2]][axisIndex]))
      .append("shape")
    newAxisLine
      .append("appearance")
      .append("material")
        .attr("emissiveColor", "lightgray")
    newAxisLine
      .append("polyline2d")
         // Line drawn along y axis does not render in Firefox, so draw one
         // along the x axis instead and rotate it (above).
        .attr("lineSegments", "0 0," + scaleMax + " 0")

   // axis labels
   var newAxisLabel = scene.append("transform")
       .attr("class", axisName("AxisLabel", axisIndex))
       .attr("translation", constVecWithAxisValue( 0, scaleMin + 1.1 * (scaleMax-scaleMin), axisIndex ))

   var newAxisLabelShape = newAxisLabel
     .append("billboard")
       .attr("axisOfRotation", "0 0 0") // face viewer
     .append("shape")
     .call(makeSolid)

   var labelFontSize = 0.6;

   newAxisLabelShape
     .append("text")
       .attr("class", axisName("AxisLabelText", axisIndex))
       .attr("solid", "true")
       .attr("string", key)
    .append("fontstyle")
       .attr("size", labelFontSize)
       .attr("family", "SANS")
       .attr("justify", "END MIDDLE" )
  }

  // Assign key to axis, creating or updating its ticks, grid lines, and labels.
  function drawAxis( axisIndex, key, duration, axisDomain ) {

    var scale = d3.scale.linear()
      .domain( axisDomain ) // demo data range
      .range( axisRange )
    
    scales[axisIndex] = scale;

    var numTicks = 8;
    var tickSize = 0.1;
    var tickFontSize = 0.5;

    // ticks along each axis
    var ticks = scene.selectAll( "."+axisName("Tick", axisIndex) )
       .data( scale.ticks( numTicks ));
    var newTicks = ticks.enter()
      .append("transform")
        .attr("class", axisName("Tick", axisIndex));
    newTicks.append("shape").call(makeSolid)
      .append("box")
        .attr("size", tickSize + " " + tickSize + " " + tickSize);
    // enter + update
    ticks.transition().duration(duration)
      .attr("translation", function(tick) { 
         return constVecWithAxisValue( 0, scale(tick), axisIndex ); })
    ticks.exit().remove();

    // tick labels
    var tickLabels = ticks.selectAll("billboard shape text")
      .data(function(d) { return [d]; });
    var newTickLabels = tickLabels.enter()
      .append("billboard")
         .attr("axisOfRotation", "0 0 0")     
      .append("shape")
      .call(makeSolid)
    newTickLabels.append("text")
      .attr("string", scale.tickFormat(10))
      .attr("solid", "true")
      .append("fontstyle")
        .attr("size", tickFontSize)
        .attr("family", "SANS")
        .attr("justify", "END MIDDLE" );
    tickLabels // enter + update
      .attr("string", scale.tickFormat(10))
    tickLabels.exit().remove();

    // base grid lines
    if (axisIndex==0 || axisIndex==2) {

      var gridLines = scene.selectAll( "."+axisName("GridLine", axisIndex))
         .data(scale.ticks( numTicks ));
      gridLines.exit().remove();
      
      var newGridLines = gridLines.enter()
        .append("transform")
          .attr("class", axisName("GridLine", axisIndex))
          .attr("rotation", axisIndex==0 ? [0,1,0, -Math.PI/2] : [0,0,0,0])
        .append("shape")

      newGridLines.append("appearance")
        .append("material")
          .attr("emissiveColor", "gray")
      newGridLines.append("polyline2d");

      gridLines.selectAll("shape polyline2d").transition().duration(duration)
        .attr("lineSegments", "0 0, " + axisRange[1] + " 0")

      gridLines.transition().duration(duration)
         .attr("translation", axisIndex==0
            ? function(d) { return scale(d) + " 0 0"; }
            : function(d) { return "0 0 " + scale(d); }
          )
    }  
  }

  function plotData() {
	var x = scales[0], y = scales[1], z = scales[2];
    var sphereRadius = 0.1;

    // Draw a sphere at each x,y,z coordinate.
    var datapoints = scene.selectAll(".datapoint").data(dataset);
    datapoints.exit().remove()

    var newDatapoints = datapoints.enter()
      .append("transform")
        .attr("class", "datapoint")
        .attr("scale", [sphereRadius, sphereRadius, sphereRadius])
      .append("shape");
    newDatapoints
      .append("appearance")
      .append("material");
    newDatapoints
      .append("sphere")
       // Does not work on Chrome; use transform instead
       //.attr("radius", sphereRadius)

    datapoints.select("shape appearance material")
        .attr("diffuseColor", function(d, i){
			if (labels[i]) return 'red';
			return 'blue';
		} )

    datapoints.transition().ease(ease).duration(0)
        .attr("translation", function(d, i) {
			if (labels[i]) return x(d[0]) + " " + y(lr.loglossPenalties(d)[0]) + " " + z(d[1]);
			return x(d[0]) + " " + y(lr.loglossPenalties(d)[1]) + " " + z(d[1]);
		})
	data3D = datapoints;
	xSc3D = x;
	ySc3D = y;
	zSc3D = z;
  }

  initializePlot();
  plotData(defaultDuration);
}