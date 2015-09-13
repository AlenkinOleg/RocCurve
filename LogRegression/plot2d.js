function plot2d(div) {
	function createLabel(text){
		var canvas = document.createElement('canvas');
		var size = 256;
		canvas.width = size;
		canvas.height = size;
		var context = canvas.getContext('2d');
		context.fillStyle = '#ff0000';
		context.textAlign = 'center';
		context.font = '24px Arial';
		context.fillText(text, size / 2, size / 2);
		var amap = new THREE.Texture(canvas);
		amap.needsUpdate = true;
		var mat = new THREE.SpriteMaterial({
			map: amap,
			transparent: false,
				useScreenCoordinates: false,
				color: "black"
		});

		var sp = new THREE.Sprite(mat);
		sp.scale.set( 10, 10, 1 );
		return sp;    
	}
	var sphereGeometry = new THREE.SphereGeometry(0.1, 20, 20);
	var sphereMaterial = new THREE.MeshBasicMaterial({color: "black", wireframe: false});
	var svg = div.append("svg")
		.attr("width", w + padding)
   	 	.attr("height", h + padding);
	var xScale = d3.scale.linear()
	    .domain([minValue, maxValue])
	    .range([0, w]);
	var yScale = d3.scale.linear()
	    .domain([minValue, maxValue])
	    .range([h, 0]);
	var xReturnScale = d3.scale.linear()
	    .domain([0, w])
	    .range([minValue, maxValue]);
	var yReturnScale = d3.scale.linear()
	    .domain([h, 0])
	    .range([minValue, maxValue]);
	var xAxis = d3.svg.axis()
		.scale(xScale)
		.orient("bottom")
		.ticks(5);
	var yAxis = d3.svg.axis()
		.scale(yScale)
		.orient("left")
		.ticks(5);
	var colorScale = d3.scale.linear()
		.domain([-1, 1])
		.interpolate(d3.interpolateHcl)
		.range(["red", "blue"]);
	var numOfLines = 50;
	var strokeWidthOfLine = 1.6 * w / numOfLines;
	var arr = [];
	for (var i = 0; i < 2 * numOfLines; i++) {
		arr[i] = - numOfLines + i;
	}
	var l = lr.decisionLine();
	var nV = lr.normalVector();
	var ort = {x: (xScale(nV.x2) - xScale(nV.x1)) / Math.sqrt(Math.pow(xScale(nV.x2) - xScale(nV.x1), 2) + Math.pow(yScale(nV.y2) - yScale(nV.y1), 2)) * strokeWidthOfLine, y: (yScale(nV.y2) - yScale(nV.y1)) / Math.sqrt(Math.pow(xScale(nV.x2) - xScale(nV.x1), 2) + Math.pow(yScale(nV.y2) - yScale(nV.y1), 2)) * strokeWidthOfLine};
	var grid = svg.selectAll("line").data(arr).enter().append("line")
		.attr("x1", function(d, i) {
			return xScale(l.x1) + d * ort.x + padding;
		})
		.attr("x2", function(d) {
		
			return xScale(l.x2) + d * ort.x + padding;
		})
		.attr("y1", function(d) {
			return yScale(l.y1) + d * ort.y;
		})
		.attr("y2", function(d) {
			return yScale(l.y2) + d * ort.y;
		})
		.attr("stroke-width", strokeWidthOfLine)
		.attr("stroke", function(d) {
			return colorScale(lr.probability([xReturnScale(this.getAttribute("x1") - padding), yReturnScale(this.getAttribute("y1"))]));
		});
	var frequence = 50;
	var arrRect = new Array(10000);
	var size = w / frequence;
	svg.selectAll("rect").data(arrRect).enter().append("rect")
		.attr("x", function(d, i) {return (i % frequence + 0.5) * size + padding - 3})
		.attr("y", function(d, i) {return (Math.floor(i / frequence) + 0.5) * size - 3})
		.attr("width", size - 1)
		.attr("height", size - 1)
		.style("fill", "white");
	var decLine = svg.append("line")  //decLine
		.attr("x1", xScale(l.x1) + padding)
		.attr("x2", xScale(l.x2) + padding)
		.attr("y1", yScale(l.y1))
		.attr("y2", yScale(l.y2))
		.attr("stroke", "green")
		.attr("stroke-width", 2);
	svg.append("line").attr("x1", padding / 2).attr("y1", 0).attr("x2", padding / 2).attr("y2", h + padding).attr("stroke", "white").attr("stroke-width", padding);
	svg.append("line").attr("x1", 0).attr("y1", h + padding / 2).attr("x2", w + padding).attr("y2", h + padding / 2).attr("stroke", "white").attr("stroke-width", padding);
	svg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(" + padding + "," + h + ")")
		.call(xAxis);
	svg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(" + padding + ",0)")
		.call(yAxis);
	svg.selectAll("circle").data(dataset).enter().append("circle")
		.attr("cx", function(d) {return xScale(d[0]) + padding;})
   		.attr("cy", function(d) {return yScale(d[1]);})
   		.attr("fill", function(d, i) {
   			if (labels[i]) return "red";
   				return "blue";
   		})
   		.attr("r", 3);
	var nvLine = svg.append("line")  //normalVector
		.attr("x1", xScale(nV.x1) + padding)
		.attr("x2", xScale(nV.x2) + padding)
		.attr("y1", yScale(nV.y1))
		.attr("y2", yScale(nV.y2))
		.attr("stroke", "green")
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
		if (newDirection.x == 0 && newDirection.y == 0) {
			return;
		}
		else {
			l = lr.decisionLine();
			lr.coeff = [nV.x2 - nV.x1, nV.y2 - nV.y1];
			lr.bias = returnBias(nV.x1, nV.y1, lr.coeff[0], lr.coeff[1]);
			ort = {x: (xScale(nV.x2) - xScale(nV.x1)) / Math.sqrt(Math.pow(xScale(nV.x2) - xScale(nV.x1), 2) + Math.pow(yScale(nV.y2) - yScale(nV.y1), 2)) * strokeWidthOfLine, y: (yScale(nV.y2) - yScale(nV.y1)) / Math.sqrt(Math.pow(xScale(nV.x2) - xScale(nV.x1), 2) + Math.pow(yScale(nV.y2) - yScale(nV.y1), 2)) * strokeWidthOfLine};
			grid
				.attr("x1", function(d) {
					return xScale(l.x1) + d * ort.x + padding;
				})
				.attr("x2", function(d) {
					return xScale(l.x2) + d * ort.x + padding;
				})
				.attr("y1", function(d) {
					return yScale(l.y1) + d * ort.y;
				})
				.attr("y2", function(d) {
					return yScale(l.y2) + d * ort.y;
				})
				.attr("stroke", function(d) {
					return colorScale(lr.probability([xReturnScale(xScale(nV.x1) + d * ort.x), yReturnScale(yScale(nV.y1) + d * ort.y)]))
				});
			nvLine
				.attr("x2", xScale(nV.x2) + padding)
				.attr("y2", yScale(nV.y2))
				.attr("x1", xScale(nV.x1) + padding)
				.attr("y1", yScale(nV.y1));
			decLine
				.attr("x1", xScale(l.x1) + padding)
				.attr("x2", xScale(l.x2) + padding)
				.attr("y1", yScale(l.y1))
				.attr("y2", yScale(l.y2));
			scaleZReturn = d3.scale.linear()
				.domain([0, 20])
				.range([0, maxTickZ()]);
			scaleZ = d3.scale.linear()
				.domain([0, maxTickZ()])
				.range([0, 20]);
			ticksValZ = scaleZ.ticks(numTicksZ);
			for (var i = 0; i < ticksZ.length; i++){
				scene.remove(ticksZ[i]);
				scene.remove(tickLabelZ[i]);
			}
			for (var i = 0; i < ticksValZ.length; i++){
				ticksZ[i] = new THREE.Mesh(sphereGeometry, sphereMaterial);
				ticksZ[i].position.set(0, scaleZ(ticksValZ[i]), 0);
				scene.add(ticksZ[i]);
				tickLabelZ[i] = createLabel(ticksValZ[i]);
				tickLabelZ[i].position.set(-0.25, scaleZ(ticksValZ[i]), -0.25);
				scene.add(tickLabelZ[i]);
			};
			for (var i = 0; i < nSamples; i++){
				if (labels[i]) spheres[i].translateY(- spheres[i].position.y + scaleZ(lr.loglossPenalties(dataset[i])[0]))
				else spheres[i].translateY(- spheres[i].position.y + scaleZ(lr.loglossPenalties(dataset[i])[1]));
			};
			surfaceBlue.geometry = new THREE.ParametricGeometry(surfaceFunctionBlue, 16, 16);
			surfaceRed.geometry = new THREE.ParametricGeometry(surfaceFunctionRed, 16, 16);
			renderer.render(scene, camera);
		}
	}
	svg.call(svgDrag);
}