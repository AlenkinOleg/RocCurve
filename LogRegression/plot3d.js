function scatterPlot3d(div, width, height) {
			scaleReturn = d3.scale.linear()
				.domain(axisRange)
				.range([-4, 4]);
			scale = d3.scale.linear()
				.domain([-4, 4])
				.range(axisRange);

			init();
			render();
			
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
			
			function initializeAxes(axisRange, numTicks) {
				var ticksVal = scale.ticks(numTicks);
				var ticksX = new Array();
				var tickMaterial = new THREE.LineBasicMaterial({
					color: "black"
				});
				var sphereGeometry = new THREE.SphereGeometry(0.1, 20, 20);
				var sphereMaterial = new THREE.MeshBasicMaterial({color: "black", wireframe: false});
				for (var i = 0; i < ticksVal.length; i++) {
					ticksX[i] = new THREE.Mesh(sphereGeometry,sphereMaterial);
					ticksX[i].position.set(scale(ticksVal[i]), 0, 0);
					scene.add(ticksX[i]);
					var tickLabel = createLabel(ticksVal[i]);
					tickLabel.position.set(scale(ticksVal[i]), 0.5, -0.5);
					scene.add(tickLabel);
				};
				var ticksY = new Array();
				for (var i = 0; i < ticksVal.length; i++) {
					ticksY[i] = new THREE.Mesh(sphereGeometry,sphereMaterial);
					ticksY[i].position.set(0, 0, scale(ticksVal[i]));
					scene.add(ticksY[i]);
					var tickLabel = createLabel(ticksVal[i]);
					tickLabel.position.set(-0.5, 0.5, scale(ticksVal[i]));
					scene.add(tickLabel);
				};
				
				var axisMaterial = new THREE.LineBasicMaterial({
					color: "black"
				});
				var xGeometry = new THREE.Geometry();
				xGeometry.vertices.push(
					new THREE.Vector3(20, 0, 0),
					new THREE.Vector3(0, 0, 0)
				);
				var zGeometry = new THREE.Geometry();
				zGeometry.vertices.push(
					new THREE.Vector3(0, 20, 0),
					new THREE.Vector3(0, 0, 0)
				);
				var yGeometry = new THREE.Geometry();
				yGeometry.vertices.push(
					new THREE.Vector3(0, 0, 20),
					new THREE.Vector3(0, 0, 0)
				);
				var xAxis = new THREE.Line(xGeometry, axisMaterial);
				var yAxis = new THREE.Line(yGeometry, axisMaterial);
				var zAxis = new THREE.Line(zGeometry, axisMaterial);
				scene.add(xAxis);
				scene.add(zAxis);
				scene.add(yAxis);
				//add Grid
				for (var i = 1; i < ticksVal.length; i++){
					var lineMaterial = new THREE.LineBasicMaterial({color: "gray"});
					var lineGeometryX = new THREE.Geometry();
					lineGeometryX.vertices.push(
						new THREE.Vector3(scale(ticksVal[i]), 0, scale(-4)),
						new THREE.Vector3(scale(ticksVal[i]), 0, scale(4))
					);
					var lineX = new THREE.Line(lineGeometryX, lineMaterial);
					scene.add(lineX);
					var lineGeometryY = new THREE.Geometry();
					lineGeometryY.vertices.push(
						new THREE.Vector3(scale(4), 0, scale(ticksVal[i])),
						new THREE.Vector3(scale(-4), 0, scale(ticksVal[i]))
					);
					var lineY = new THREE.Line(lineGeometryY, lineMaterial);
					scene.add(lineY);
				}
				ticksValZ = scaleZ.ticks(numTicksZ);
				for (var i = 0; i < ticksValZ.length; i++) {
					ticksZ[i] = new THREE.Mesh(sphereGeometry,sphereMaterial);
					ticksZ[i].position.set(0, scaleZ(ticksValZ[i]), 0);
					scene.add(ticksZ[i]);
					tickLabelZ[i] = createLabel(ticksValZ[i]);
					tickLabelZ[i].position.set(-0.25, scaleZ(ticksValZ[i]), -0.25);
					scene.add(tickLabelZ[i]);
				};
			}

			function animate() {
				requestAnimationFrame(animate);
				controls.update();
			}

			function init() {

				camera = new THREE.PerspectiveCamera( 60, width / height, 1, 1000 );
				camera.position.z = 30;
				camera.position.y = 30;
				camera.position.x = 30;

				scene = new THREE.Scene();
				scene.fog = new THREE.FogExp2( "white", 0.002 );

				// world
				var geometry = new THREE.PlaneGeometry( 5, 20, 32 );
				var axes = new THREE.AxisHelper( 20 );
				scene.add(axes);

				var surfaceGeometryBlue = new THREE.ParametricGeometry(surfaceFunctionBlue, 16, 16);

				var materialBlue = new THREE.MeshBasicMaterial({
					color: "blue",
					specular: 0x080808,
					side: THREE.DoubleSide,
					transparent: true,
					opacity: 0.2,
					depthTest: false
				});
				
				surfaceBlue = new THREE.Mesh( surfaceGeometryBlue, materialBlue );
				scene.add(surfaceBlue);
				var surfaceGeometryRed = new THREE.ParametricGeometry(surfaceFunctionRed, 16, 16);

				var materialRed = new THREE.MeshBasicMaterial({
					color: "red",
					specular: 0x080808,
					side: THREE.DoubleSide,
					transparent: true,
					opacity: 0.2,
					depthTest: false
				});
				
				surfaceRed = new THREE.Mesh( surfaceGeometryRed, materialRed );
				scene.add(surfaceRed);
				var numTicks = 8;
				initializeAxes(axisRange, numTicks);
				
				var sphereGeometry = new THREE.SphereGeometry(0.3, 20, 20);
				var sphereMaterialRed = new THREE.MeshBasicMaterial({color: "red", wireframe: false});
				var sphereMaterialBlue = new THREE.MeshBasicMaterial({color: "blue", wireframe: false});
				for (var i = 0; i < nSamples; i++){
					if (labels[i]){
						spheres[i] = new THREE.Mesh(sphereGeometry, sphereMaterialRed);
						spheres[i].position.y = scaleZ(lr.loglossPenalties(dataset[i])[0]);
					}
					else {
						spheres[i] = new THREE.Mesh(sphereGeometry, sphereMaterialBlue);
						spheres[i].position.y = scaleZ(lr.loglossPenalties(dataset[i])[1]);
					}
					spheres[i].position.x = scale(dataset[i][0]);
					spheres[i].position.z = scale(dataset[i][1]);
					scene.add(spheres[i]);
				}
				
				// lights

				light = new THREE.DirectionalLight( 0xffffff );
				light.position.set( 1, 1, 1 );
				scene.add( light );

				light = new THREE.DirectionalLight( 0x002288 );
				light.position.set( -1, -1, -1 );
				scene.add( light );

				light = new THREE.AmbientLight( 0x222222 );
				scene.add( light );
				
				// renderer

				renderer = new THREE.WebGLRenderer( { antialias: false } );
				renderer.setClearColor( scene.fog.color );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( width, height );
				
				controls = new THREE.OrbitControls(camera, renderer.domElement);
				controls.damping = 0.4;
				controls.addEventListener( 'change', render );

				div.appendChild(renderer.domElement);
				window.addEventListener('resize', onWindowResize, false);
				animate();
			}

			function onWindowResize() {
				camera.aspect = width / height;
				camera.updateProjectionMatrix();
				renderer.setSize( width, height );
				render();
			}
			function render() {
				renderer.render( scene, camera );
			}
}