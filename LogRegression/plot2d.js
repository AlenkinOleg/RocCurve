function plot2d(div) {
	var svg = div.append("svg")
		.attr("width", w + padding)
   	 	.attr("height", h + padding);
	var xScale = d3.scale.linear()
	    .domain([minValue, maxValue])
	    .range([0, w]);
	var yScale = d3.scale.linear()
	    .domain([minValue, maxValue])
	    .range([h, 0]);
	var xAxis = d3.svg.axis()
		.scale(xScale)
		.orient("bottom")
		.ticks(5);
	var yAxis = d3.svg.axis()
		.scale(yScale)
		.orient("left")
		.ticks(5);
	svg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(" + padding + "," + h + ")")
		.call(xAxis);
	svg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(" + padding + ",0)")
		.call(yAxis);
	var colorScale = d3.scale.linear()
		.domain([-1, 1])
		.interpolate(d3.interpolateHcl)
		.range(["#007AFF", "#FFF500"]);
	var numStrokes = 50;
	var delta = (maxValue - minValue) / numStrokes; // grid
	for (var i = minValue; i < maxValue; i += delta) {
		for (var j = minValue; j < maxValue; j += delta) {
			svg.append("line") //horizontal lines
				.attr("x1", xScale(i) + padding)
				.attr("x2", xScale(i + delta) + padding)
				.attr("y1", yScale(j))
				.attr("y2", yScale(j))
				.attr("stroke", colorScale(lr.probability([i + delta / 2, j])))
				.attr("stroke-width", 1);
			svg.append("line") //vertical lines
				.attr("x1", xScale(i) + padding)
				.attr("x2", xScale(i) + padding)
				.attr("y1", yScale(j))
				.attr("y2", yScale(j + delta))
				.attr("stroke", colorScale(lr.probability([i, j + delta / 2])))
				.attr("stroke-width", 1);
		}
	}
	var grid = svg.selectAll("line");
	svg.selectAll("circle").data(dataset).enter().append("circle")
		.attr("cx", function(d) {return xScale(d[0]) + padding;})
   		.attr("cy", function(d) {return yScale(d[1]);})
   		.attr("fill", function(d, i) {
   			if (labels[i]) return "red";
   				return "blue";
   		})
   		.attr("r", 3);
	var l = lr.decisionLine();
	var decLine = svg.append("line")  //decLine
		.attr("x1", xScale(l.x1) + padding)
		.attr("x2", xScale(l.x2) + padding)
		.attr("y1", yScale(l.y1))
		.attr("y2", yScale(l.y2))
		.attr("stroke", "gray")
		.attr("stroke-width", 2);
	var nV = lr.normalVector();
	var xReturnScale = d3.scale.linear()
	    .domain([0, w])
	    .range([minValue, maxValue]);
	var yReturnScale = d3.scale.linear()
	    .domain([h, 0])
	    .range([minValue, maxValue]);
	/*var drag = d3.behavior.drag()
	    .on("drag", function(d) {
			var newDirection = {x: xReturnScale(d3.event.x - padding) - nV.x1, y: yReturnScale(d3.event.y) - nV.y1};
			nV.x2 = nV.x1 + newDirection.x;
			nV.y2 = nV.y1 + newDirection.y;
			nvLine
				.attr("x2", xScale(nV.x2) + padding)
				.attr("y2", yScale(nV.y2));
			lr.coeff = [nV.x2 - nV.x1, nV.y2 - nV.y1];
			lr.bias = returnBias(nV.x1, nV.y1, lr.coeff[0], lr.coeff[1]);
			grid
				.attr("stroke", function() {
					return colorScale(lr.probability([xReturnScale(this.getAttribute("x1") - padding), yReturnScale(this.getAttribute("y1"))]));
				});
			l = lr.decisionLine();
			decLine
				.attr("x1", xScale(l.x1) + padding)
				.attr("x2", xScale(l.x2) + padding)
				.attr("y1", yScale(l.y1))
				.attr("y2", yScale(l.y2));
			});*/
	var nvLine = svg.append("line")  //normalVector
		.attr("x1", xScale(nV.x1) + padding)
		.attr("x2", xScale(nV.x2) + padding)
		.attr("y1", yScale(nV.y1))
		.attr("y2", yScale(nV.y2))
		.attr("stroke", "gray")
		.attr("stroke-width", 2);
		//.call(drag);
	var svgDrag = d3.behavior.drag()
		.on("dragstart", dragstarted)
		.on("drag", dragged);
		//.on("dragend", dragended);
	function dragstarted() {
		var point = d3.mouse(this);
		nV.x1 = xReturnScale(point[0] - padding);
		nV.y1 = yReturnScale(point[1]);
	}
	function dragged() {
		var newDirection = {x: xReturnScale(d3.event.x - padding) - nV.x1, y: yReturnScale(d3.event.y) - nV.y1};
		nV.x2 = nV.x1 + newDirection.x;
		nV.y2 = nV.y1 + newDirection.y;
		nvLine
			.attr("x2", xScale(nV.x2) + padding)
			.attr("y2", yScale(nV.y2))
			.attr("x1", xScale(nV.x1) + padding)
			.attr("y1", yScale(nV.y1));
		lr.coeff = [nV.x2 - nV.x1, nV.y2 - nV.y1];
		lr.bias = returnBias(nV.x1, nV.y1, lr.coeff[0], lr.coeff[1]);
		grid
			.attr("stroke", function() {
				return colorScale(lr.probability([xReturnScale(this.getAttribute("x1") - padding), yReturnScale(this.getAttribute("y1"))]));
			});
		l = lr.decisionLine();
		decLine
			.attr("x1", xScale(l.x1) + padding)
			.attr("x2", xScale(l.x2) + padding)
			.attr("y1", yScale(l.y1))
			.attr("y2", yScale(l.y2));
		data3D.transition().ease(ease).duration(0)
        .attr("translation", function(d, i) {
			if (labels[i]) return xSc3D(d[0]) + " " + ySc3D(lr.loglossPenalties(d)[0]) + " " + zSc3D(d[1]);
			return xSc3D(d[0]) + " " + ySc3D(lr.loglossPenalties(d)[1]) + " " + zSc3D(d[1]);
		});
	}
	svg.call(svgDrag);
}