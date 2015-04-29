var gl;
var program;
var ctx;

var mvMatrix = mat4.create();
var pMatrix = mat4.create();
var currentlyPressedKeys = {};

var worldVertexPositionBuffer = null;
var worldVertexTextureCoordBuffer = null;
var vBuffer;
var meow;

var xPos = 0;
var yPos = 0.4;
var zPos = 0;
var yaw = 0;
var yawRate = 0;    
var pitch = 0;
var pitchRate = 0;	

var speed = 0;
var jumpStrength = .7;	
var jump = 0;
var v = 0.0;

var PI = 3.14159265358979323846264;
var pointsArray = [];
var colorsArray = [];
var index = 0;




window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
	try {
		gl = canvas.getContext("experimental-webgl");
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
	} catch (e) { }
	if (!gl) { alert("Could not initialise WebGL, sorry :-("); }    
	gl = WebGLDebugUtils.makeDebugContext(gl, throwOnGLError, logAndValidate);    
    if ( !gl ) { alert( "WebGL isn't available" ); }
	program = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram( program );	

	program.pMatrixUniform = gl.getUniformLocation(program, "uPMatrix");
	program.mvMatrixUniform = gl.getUniformLocation(program, "uMVMatrix");
	program.samplerUniform = gl.getUniformLocation(program, "uSampler");	
	
	program.vertexPositionAttribute = gl.getAttribLocation(program, "aVertexPosition");
	gl.enableVertexAttribArray(program.vertexPositionAttribute);

	program.textureCoordAttribute = gl.getAttribLocation(program, "aTextureCoord");
	gl.enableVertexAttribArray(program.textureCoordAttribute);
	
	
    program.vPosition = gl.getAttribLocation(program, "aVertexPosition");
    gl.enableVertexAttribArray(program.vPosition);
   
	
	initTexture();
	loadWorld(); 
	drawShape();
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);
	
	document.onkeydown = handleKeyDown;
	document.onkeyup = handleKeyUp;    
	
    tick();
};

function render()
{
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	if (worldVertexTextureCoordBuffer == null || worldVertexPositionBuffer == null) { return; }

	mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

	mat4.identity(mvMatrix);
	mat4.rotate(mvMatrix, degToRad(-pitch), [1, 0, 0]);
	mat4.rotate(mvMatrix, degToRad(-yaw), [0, 1, 0]);
	mat4.translate(mvMatrix, [-xPos, -yPos, -zPos]);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, meow);
	gl.uniform1i(program.samplerUniform, 0); 
	gl.bindBuffer(gl.ARRAY_BUFFER, worldVertexTextureCoordBuffer);
	gl.vertexAttribPointer(program.textureCoordAttribute, worldVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, worldVertexPositionBuffer);
	gl.vertexAttribPointer(program.vertexPositionAttribute, worldVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
	   	
	setMatrixUniforms(); 
	//gl.drawArrays(gl.TRIANGLES, 0, worldVertexPositionBuffer.numItems);
	
		
	gl.enableVertexAttribArray(program.vPosition);	
	gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
	gl.vertexAttribPointer(program.vPosition, 4, gl.FLOAT, false, 0, 0);

	//gl.drawArrays( gl.TRIANGLES, index/2, index/2 ); 	
	gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
	gl.drawArrays( gl.TRIANGLES, 0, 30 );
}

function animate() {
	if (speed != 0) {
		xPos -= Math.sin(degToRad(yaw)) * speed;
		zPos -= Math.cos(degToRad(yaw)) * speed;
	}
	yPos = Math.sin(v)*jumpStrength + 0.4; 
	yaw += yawRate;
	pitch += pitchRate; 

	if (jump == 1) { v+=(.015*Math.PI); 
	if ((Math.sin(v)*jumpStrength)<0.0) { v=0; jump=0; } }		
}

function tick() {
	requestAnimFrame(tick);
	handleKeys();
	render();
	animate();
}

function handleKeyDown(event) {
	currentlyPressedKeys[event.keyCode] = true;    
} function handleKeyUp(event) {
	currentlyPressedKeys[event.keyCode] = false;
} 	

function degToRad(degrees) {
	return degrees * Math.PI / 180;
}

function setMatrixUniforms() {
	gl.uniformMatrix4fv(program.pMatrixUniform, false, pMatrix);
	gl.uniformMatrix4fv(program.mvMatrixUniform, false, mvMatrix);
}

function handleLoadedTexture(texture) {
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

	gl.bindTexture(gl.TEXTURE_2D, null);
}
	
function initTexture() {
	meow = gl.createTexture();
	meow.image = new Image();
	meow.image.onload = function () { handleLoadedTexture(meow) }
	meow.image.src = "FACK.gif";
}
	
function loadWorld() {
	var vertexCount = 6;
	var vertexPositionCoords = [ -7.0, 0.0, -7.0,   -7.0, 0.0, 7.0,   7.0, 0.0, 7.0,   -7.0, 0.0, -7.0,   7.0, 0.0, -7.0,   7.0, 0.0, 7.0 ];
	var vertexTextureCoords = [ 0.0, 6.0,   0.0, 0.0,   6.0, 0.0,   0.0, 6.0,   6.0, 6.0,   6.0, 0.0 ];

	worldVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, worldVertexPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionCoords), gl.STATIC_DRAW);
	worldVertexPositionBuffer.itemSize = 3;
	worldVertexPositionBuffer.numItems = vertexCount;

	worldVertexTextureCoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, worldVertexTextureCoordBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexTextureCoords), gl.STATIC_DRAW);
	worldVertexTextureCoordBuffer.itemSize = 2;
	worldVertexTextureCoordBuffer.numItems = vertexCount;
}

function handleKeys() {
	if (currentlyPressedKeys[33]) {
		// Page Up
		pitchRate = 0.1;
	} else if (currentlyPressedKeys[34]) {
		// Page Down
		pitchRate = -0.1;
	} else {
		pitchRate = 0;
	}

	if (currentlyPressedKeys[37] || currentlyPressedKeys[65]) {
	// Left cursor key or A
			yawRate = 1.3;
		} else if (currentlyPressedKeys[39] || currentlyPressedKeys[68]) {
	// Right cursor key or D
			yawRate = -1.3;
		} else {
			yawRate = 0;
	}

	if (currentlyPressedKeys[38] || currentlyPressedKeys[87]) {
	// Up cursor key or W
			speed = 0.033;
		} else if (currentlyPressedKeys[40] || currentlyPressedKeys[83]) {
	// Down cursor key
			speed = -0.033;  
		} else { speed = 0; }
		if (currentlyPressedKeys[32]) {
		// space bar
			jump = 1.0;
	} 
	if (currentlyPressedKeys[49]) { alert("x: " + xPos + " and y: " + yPos + " and x: " + zPos); }

}

function logAndValidate(functionName, args) {
	logGLCalls(functionName, args);
	validateNoneOfTheArgsAreUndefined (functionName, args);
} 
function validateNoneOfTheArgsAreUndefined(functionName, args) {
	for (var ii = 0; ii < args.length; ++ii) {
		if (args[ii] === undefined) {
			console.error("undefined passed to gl." + functionName + "(" + WebGLDebugUtils.glFunctionArgsToString(functionName, args) + ")");
		}
	}
} 
function logGLCalls(functionName, args) {   
	console.log("gl." + functionName + "(" + WebGLDebugUtils.glFunctionArgsToString(functionName, args) + ")");   
} 
function throwOnGLError(err, funcName, args) {
	throw WebGLDebugUtils.glEnumToString(err) + " was caused by call to: " + funcName;
};

var vBuffer;
var vPosition;
function drawShape() {
	
	var v = 0.0;
	var swit = true;
	var color1;
	

    
	
	for (var two=0.0; two<2; two++)
	{
		for(var t=0.0; t<(2*PI); t+=(0.1*PI)) 
		{	
			for (var p=0.0; p<PI; p+=(0.1*PI)) 
			{	
				if (two == 0.0) { r = 10 * Math.sin(v); }
				else { r = 10; }
				
				pointsArray.push(  (r*Math.cos(t)*Math.sin(p))/600, (r*Math.sin(t)*Math.sin(p))/600, (r*Math.cos(p))/600, 1.0  );
				p+=(0.1*PI);
				pointsArray.push(  (r*Math.cos(t)*Math.sin(p))/600, (r*Math.sin(t)*Math.sin(p))/600, (r*Math.cos(p))/600, 1.0  );
				p-=(0.1*PI);
				t-=(0.1*PI);
				pointsArray.push(  (r*Math.cos(t)*Math.sin(p))/600, (r*Math.sin(t)*Math.sin(p))/600, (r*Math.cos(p))/600, 1.0  );

				index+=3;
				
				pointsArray.push(  (r*Math.cos(t)*Math.sin(p))/600, (r*Math.sin(t)*Math.sin(p))/600, (r*Math.cos(p))/600, 1.0  );
				p-=(0.1*PI);
				pointsArray.push(  (r*Math.cos(t)*Math.sin(p))/600, (r*Math.sin(t)*Math.sin(p))/600, (r*Math.cos(p))/600, 1.0  );
				p+=(0.1*PI);
				t+=(0.1*PI);
				pointsArray.push(  (r*Math.cos(t)*Math.sin(p))/600, (r*Math.sin(t)*Math.sin(p))/600, (r*Math.cos(p))/600, 1.0 );

				index+=3;
				if (v == PI) 	{ swit=false; }
				if (v == 0.0)  	{ swit=true;  }		
				if (swit) 	{ v+=(.5*PI); }
				else 		{ v-=(.5*PI); }	
			}
		}	
	}
	vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(pointsArray), gl.STATIC_DRAW );
} 
