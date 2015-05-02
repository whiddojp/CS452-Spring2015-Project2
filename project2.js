
// CANVAS VARIABLES
var gl, program, ctx;

// MATRIX VARIABLES
var mvMatrix, pMatrix;
var pMatrixUniform, mvMatrixUniform, samplerUniform;

// LIGHT VARIABLES
var lightLocationUniform, ambientColorUniform, lightingColorUniform, lightingUniform;
var lighting;

// TEXTURE VARIABLES
var safety, objCube, lava, enemyFace, enemyBody;

// WORLD VARIABLES
var worldVertexPositionBuffer, worldVertexTextureCoordBuffer, worldVertexNormalBuffer; 	// BUFFERS
var vertexPositionCoords, vertexTextureCoords, vertexCount, vertexNormalCoords;		// COORDINATES

// OBJECTIVE VARIABLES
var objectiveVertexPositionBuffer, objectiveTextureCoordBuffer, objectiveIndexBuffer, objectiveNormalBuffer;	// BUFFERS
var objectPositionCoords, objectTextureCoords, cubeIndices, objectiveNormals;									// COORDINATES
var objective_x, objective_z, objective_y, floatAngle, objective_size, objVertexCount;							// WORLD POSITION

// ENEMYHEAD VARIABLES
var enemyVertexPositionBuffer, enemyTextureCoordBuffer, enemyIndexBuffer, enemyVertexNormalBuffer;		// BUFFERS
var headPositionCoords, headTextureCoords, enemyHeadNormals, headIndices;								// HEAD COORDINATES
var enemy_x, enemy_z, enemy_y, enemy_size, headVertexCount;												// WORLD POSITION

// ENEMYBODY VARIABLES
var enemyBodyVertexPositionBuffer, enemyBodyTextureCoordBuffer, enemyBodyNormalBuffer, enemyBodyIndexBuffer;		// BUFFERS
var bodyPositionCoords,	bodyTextureCoords, bodyIndices, bodyNormalCoords;											// BODY COORDINATES

// ATTRIBUTE VARIABLES
var vertexPositionAttribute, textureCoordAttribute, vertexNormalAttribute;

// CHARACTER VARIABLES
var currentlyPressedKeys, turn, turnRate, camAngle, camAngleRate, objTrim, speed, jumpStrength, jump, jumpAngle, boost, pos;
var worldBounds, lavaBounds, jailBounds, point, death, score, highScore, status;

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
	
	initVar();
	initTexture();
	
	vertexPositionAttribute = gl.getAttribLocation(program, "aVertexPosition");
	textureCoordAttribute = gl.getAttribLocation(program, "aTextureCoord");
	vertexNormalAttribute = gl.getAttribLocation(program, "aVertexNormal");
	gl.enableVertexAttribArray(vertexPositionAttribute);
	gl.enableVertexAttribArray(textureCoordAttribute);	
	gl.enableVertexAttribArray(vertexNormalAttribute);   	
	
	pMatrixUniform 			= gl.getUniformLocation( program, "uPMatrix" );
	mvMatrixUniform 		= gl.getUniformLocation( program, "uMVMatrix" );
	nMatrixUniform 			= gl.getUniformLocation( program, "uNMatrix" );
	samplerUniform 			= gl.getUniformLocation( program, "uSampler" );
	lightingUniform 		= gl.getUniformLocation( program, "lightChoice" );
	ambientColorUniform 	= gl.getUniformLocation( program, "ambientColor" );
	lightLocationUniform 	= gl.getUniformLocation( program, "focusDirection" );
	lightingColorUniform 	= gl.getUniformLocation( program, "lightColor" );
	
	// WORLD POSITION BUFFER
	worldVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, worldVertexPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionCoords), gl.STATIC_DRAW);
		worldVertexPositionBuffer.itemSize = 3;
		worldVertexPositionBuffer.numItems = vertexCount;			
	gl.vertexAttribPointer( vertexPositionAttribute, worldVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
	// WORLD NORMAL BUFFER
	worldVertexNormalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, worldVertexNormalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormalCoords), gl.STATIC_DRAW);
		worldVertexNormalBuffer.itemSize = 3;
		worldVertexNormalBuffer.numItems = vertexCount;
	gl.vertexAttribPointer(vertexNormalAttribute, worldVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

	// WORLD TEXTURE BUFFER
	worldVertexTextureCoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, worldVertexTextureCoordBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexTextureCoords), gl.STATIC_DRAW);
		worldVertexTextureCoordBuffer.itemSize = 2;
		worldVertexTextureCoordBuffer.numItems = vertexCount;		
	gl.vertexAttribPointer(textureCoordAttribute, worldVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

	// OBJECTIVE POSITION BUFFER
	objectiveVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, objectiveVertexPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objectPositionCoords), gl.STATIC_DRAW);
		objectiveVertexPositionBuffer.itemSize = 3;
		objectiveVertexPositionBuffer.numItems = objVertexCount;			
	gl.vertexAttribPointer(vertexPositionAttribute, objectiveVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

	// OBJECTIVE TEXTURE BUFFER
	objectiveTextureCoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, objectiveTextureCoordBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objectTextureCoords), gl.STATIC_DRAW);
		objectiveTextureCoordBuffer.itemSize = 2;
		objectiveTextureCoordBuffer.numItems = objVertexCount;		
	gl.vertexAttribPointer(textureCoordAttribute, objectiveTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
	// OBJECTIVE NORMAL BUFFER
	objectiveNormalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, objectiveNormalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objectiveNormals), gl.STATIC_DRAW);
		objectiveNormalBuffer.itemSize = 3;
		objectiveNormalBuffer.numItems = objVertexCount;
	gl.vertexAttribPointer(vertexNormalAttribute, objectiveNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

	// OBJECTIVE INDICES BUFFER        
	objectiveIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, objectiveIndexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);
		objectiveIndexBuffer.itemSize = 1;
		objectiveIndexBuffer.numItems = 36;	
		
	// ENEMYHEAD POSITION BUFFER
	enemyVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, enemyVertexPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(headPositionCoords), gl.STATIC_DRAW);
		enemyVertexPositionBuffer.itemSize = 3;
		enemyVertexPositionBuffer.numItems = headVertexCount;			
	gl.vertexAttribPointer(vertexPositionAttribute, enemyVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
	// ENEMYHEAD NORMAL BUFFER
	enemyVertexNormalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, enemyVertexNormalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(enemyHeadNormals), gl.STATIC_DRAW);
		enemyVertexNormalBuffer.itemSize = 3;
		enemyVertexNormalBuffer.numItems = headVertexCount;
	gl.vertexAttribPointer(vertexNormalAttribute, enemyVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

	// ENEMYHEAD TEXTURE BUFFER
	enemyTextureCoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, enemyTextureCoordBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(headTextureCoords), gl.STATIC_DRAW);
		enemyTextureCoordBuffer.itemSize = 2;
		enemyTextureCoordBuffer.numItems = headVertexCount;		
	gl.vertexAttribPointer(textureCoordAttribute, enemyTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

	// ENEMYHEAD INDICES BUFFER        
	enemyIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, enemyIndexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(headIndices), gl.STATIC_DRAW);
		enemyIndexBuffer.itemSize = 1;
		enemyIndexBuffer.numItems = 36;	
		
	// ENEMYBODY POSITION BUFFER
	enemyBodyVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, enemyBodyVertexPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bodyPositionCoords), gl.STATIC_DRAW);
		enemyBodyVertexPositionBuffer.itemSize = 3;
		enemyBodyVertexPositionBuffer.numItems = bodyPositionCoords.length/3;			
	gl.vertexAttribPointer(vertexPositionAttribute, enemyBodyVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
	// ENEMYBODY NORMAL BUFFER
	enemyBodyNormalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, enemyBodyNormalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bodyNormalCoords), gl.STATIC_DRAW);
		enemyBodyNormalBuffer.itemSize = 3;
		enemyBodyNormalBuffer.numItems = bodyNormalCoords.length/3;
	gl.vertexAttribPointer(vertexNormalAttribute, enemyBodyNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
	// ENEMYBODY TEXTURE BUFFER
	enemyBodyTextureCoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, enemyBodyTextureCoordBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bodyTextureCoords), gl.STATIC_DRAW);
		enemyBodyTextureCoordBuffer.itemSize = 2;
		enemyBodyTextureCoordBuffer.numItems = bodyTextureCoords.length/2;		
	gl.vertexAttribPointer(textureCoordAttribute, enemyBodyTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
	// ENEMYBODY INDICES BUFFER  
	enemyBodyIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, enemyBodyIndexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(bodyIndices), gl.STREAM_DRAW);
		enemyBodyIndexBuffer.itemSize = 1;
		enemyBodyIndexBuffer.numItems = bodyIndices.length;
		
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
	
	mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
	
	mat4.identity(mvMatrix);
	mat4.rotate(mvMatrix, degToRad(-camAngle), [1, 0, 0]);
	mat4.rotate(mvMatrix, degToRad(-turn), [0, 1, 0]);
	mat4.translate(mvMatrix, [-pos[0], -pos[1], -pos[2]]);	
	setMatrixUniforms(); 
	
	//loadWorld(worldSize, worldHeight, texture, worldTextureSize)	
	// constraint(mode: block, check, set; area: world, lava, jail)
	loadWorld(17, -0.3, lava, 5);
	constraint(20,0);
	
	if (!death) {
		loadWorld(7, 0.0, safety, 7);
		constraint(7,1);
		touchCheck();
		if (point) { changeObjectiveLocation(); }
		if(score==50) { document.getElementById("status").innerHTML = "Status: " + "Well Look at That, You Won!! But I think you should keep going....call it pride."; }		
		loadEnemy(1/6);
		//drawPart(1/5, 1.0,0.4,6.0);
		loadObjective(1/9, objCube, 1);
	} else {	
		deathSequence();
	}
	
	// loadObjective(size, texture, objectiveTextureSize)
}

var lastTime = 0;
function animate() {
	var timeNow = new Date().getTime();
	
	if (lastTime != 0) {
		var elapsed = timeNow - lastTime;
		if (speed != 0) {
			speed = speed * elapsed;
			constraint(0,0);
		}
		if (pos[1]<=worldBounds[1] && pos[1]>=-worldBounds[1]) { pos[1] = Math.sin(jumpAngle)*jumpStrength + 0.4; }
		turn += turnRate * elapsed;
		camAngle += camAngleRate * elapsed; 
		
		floatAngle += elapsed * 0.05; 
		objective_y = Math.sin(degToRad(floatAngle))/4 + 0.4;

		if (jump == 1) { jumpAngle+=(.015*Math.PI); 
		if ((Math.sin(jumpAngle)*jumpStrength)<0.0) { jumpAngle=0; jump=false; } }		
	}
	lastTime = timeNow;
}

function tick() {
	requestAnimFrame(tick);
	handleKeys();
	render();
	enemyMovement();
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
	gl.uniformMatrix4fv(pMatrixUniform, false, pMatrix);
	gl.uniformMatrix4fv(mvMatrixUniform, false, mvMatrix);
	
	gl.uniform1i( lightingUniform, lighting);
	gl.uniform3f( ambientColorUniform, 	0.2, 0.2, 0.2 	);
	gl.uniform3f( lightLocationUniform, 0.0, 1, 1	);
	gl.uniform3f( lightingColorUniform, 0.8, 0.8, 0.8 	);
	
	var nMatrix = mat3.create();
	mat4.toInverseMat3(mvMatrix, nMatrix);
	mat3.transpose(nMatrix);
	gl.uniformMatrix3fv(nMatrixUniform, false, nMatrix);
}

function constraint(mode, area) { // mode: block, check, set; area: world, lava, jail; set(area=boundary)
	
	var tmpX, tmpZ, bool, boundary;
		tmpX = pos[0] - (Math.sin(degToRad(turn)) * speed); 
		tmpZ = pos[2] - (Math.cos(degToRad(turn)) * speed);

		if (area == 0) 		{ boundary = worldBounds; } 
		else if (area == 1)	{ boundary = lavaBounds; } 
	
	if (mode == 0) { // block mode -> create boundary against walking	
		if ( tmpX<=boundary[0] && tmpX>=-boundary[0] ) { pos[0] = tmpX; }
		if ( tmpZ<=boundary[2] && tmpZ>=-boundary[2] ) { pos[2] = tmpZ; }	
		
	} else if (mode == -1) { // check mode -> check if non-blocked boundary has been breached
		bool = false;
		if ( tmpX<=boundary[0] && tmpX>=-boundary[0] ) {  } else bool = true;
		if ( tmpZ<=boundary[2] && tmpZ>=-boundary[2] ) {  } else bool = true;
		return bool;
		
	} else { // set mode -> set values of boundary arrays
		// mode stores value of boundary radius		
		for (var i=0;i<3;i++) boundary[i] = mode;	
	}
}	

var lastTime2 = 0;
var slitherAngle = 0;
var xVel, zVel;

function enemyMovement() { // mode: block, check, set; area: world, lava, jail; set(area=boundary)
	var timeNow = new Date().getTime();
	
	if (lastTime2 != 0) {
		var elapsed = timeNow - lastTime2;

		if (enemy_x >= 13 || enemy_x <= -13) {
			xVel = -xVel; resetVel = true;
		} if (enemy_z >= 16 || enemy_z <= -16) {
			zVel = -zVel; resetVel = true;
		}	
		
		slitherAngle += elapsed * 0.005; 					// slither movement		
		enemy_y = Math.sin(slitherAngle)/10 + 0.05 ;	
		
		enemy_x += xVel * 0.003 * elapsed; 
		enemy_z += zVel	* 0.003 * elapsed; 
	}
	lastTime2 = timeNow;
}


function touchCheck(){
	if( (pos[0])>(objective_x-objective_size-objTrim) && (pos[0])<(objective_x+objective_size+objTrim) && (pos[2])>(objective_z-objective_size-objTrim) && (pos[2])<(objective_z+objective_size+objTrim) ) {
		point = true; 	
	}
	if( (pos[0])>(enemy_x-enemy_size-objTrim) && (pos[0])<(enemy_x+enemy_size+objTrim) && (pos[2])>(enemy_z-enemy_size-objTrim) && (pos[2])<(enemy_z+enemy_size+objTrim) ) {
		death = true; 	
	}
	if (constraint(-1,1)) { death = true; }
}

function reset() {
	if (score>highScore) {
		highScore = score;
		document.getElementById("Hscore").innerHTML = "High Score: " + highScore;
	}
	score = 0;
	objective_x = 0.0;
	objective_z = -6.0;
	objective_y = 0.4;
	pos = [ 0.0, 0.4, 0.0 ];
	document.getElementById("score").innerHTML = "Score: " + score;
	changeStatus();
	death = false;
}

function changeStatus() {
	var i = (Math.floor(Math.random() * 10)+1);
	
	if (i==1) 		{ status = "Status: I'm a fox....not a cat -_-"; }
	else if (i==2) 	{ status = "Status: What? You think you have 9 lives?"; }
	else if (i==3) 	{ status = "Status: You know that red stuff? Stay out of it!"; }
	else if (i==4) 	{ status = "Status: I'm losing hope for your survival..."; }
	else if (i==5) 	{ status = "Status: I think someone else should take over."; }
	else if (i==6) 	{ status = "Status: Dead....just kidding :), no really you're gonna die again"; }
	else if (i==7) 	{ status = "Status: and again. This can't be natural"; }
	else if (i==8) 	{ status = "Status: Touch the red stuff, I dare you!"; }
	else if (i==9) 	{ status = "Status: Still living.....somehow"; }
	else if (i==10) { status = "Status: I ran out of witty sayings, so I printed this"; }
	else { status = "Status: Error 404, Math not found"; }	
	document.getElementById("status").innerHTML = status;
}
	
function loadWorld(worldSize, worldHeight, texture, worldTextureSize) { 
	vertexPositionCoords 	= [ -worldSize, worldHeight, -worldSize,   -worldSize, worldHeight, worldSize,   worldSize, worldHeight, worldSize,   -worldSize, worldHeight, -worldSize,   worldSize, worldHeight, -worldSize,   worldSize, worldHeight, worldSize ];
	vertexTextureCoords 	= [ 0.0, worldTextureSize,   0.0, 0.0,   worldTextureSize, 0.0,   0.0, worldTextureSize,   worldTextureSize, worldTextureSize,   worldTextureSize, 0.0 ];
	vertexNormalCoords 		= normalfunc(vertexPositionCoords);
	
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.uniform1i(samplerUniform, 0); 
	
	gl.bindBuffer(gl.ARRAY_BUFFER, worldVertexPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionCoords), gl.STATIC_DRAW);
		worldVertexPositionBuffer.itemSize = 3;
		worldVertexPositionBuffer.numItems = vertexCount;
	gl.vertexAttribPointer(vertexPositionAttribute, worldVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, worldVertexTextureCoordBuffer);	
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexTextureCoords), gl.STATIC_DRAW);
		worldVertexTextureCoordBuffer.itemSize = 2;
		worldVertexTextureCoordBuffer.numItems = vertexCount;
	gl.vertexAttribPointer(textureCoordAttribute, worldVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, worldVertexNormalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormalCoords), gl.STATIC_DRAW);
		worldVertexNormalBuffer.itemSize = 3;
		worldVertexNormalBuffer.numItems = vertexCount;
	gl.vertexAttribPointer(vertexNormalAttribute, worldVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
}

function loadObjective(size, texture, objectiveTextureSize) {
	objective_size = size;
	objectPositionCoords 	= [ 
		objective_x-objective_size, objective_y-objective_size, objective_z+objective_size,	objective_x+objective_size, objective_y-objective_size, objective_z+objective_size,	objective_x+objective_size, objective_y+objective_size, objective_z+objective_size,	objective_x-objective_size, objective_y+objective_size, objective_z+objective_size,	// Front face
		objective_x-objective_size, objective_y-objective_size, objective_z-objective_size,	objective_x-objective_size, objective_y+objective_size, objective_z-objective_size,	objective_x+objective_size, objective_y+objective_size, objective_z-objective_size,	objective_x+objective_size, objective_y-objective_size, objective_z-objective_size,	// Back face
		objective_x-objective_size, objective_y+objective_size, objective_z-objective_size,	objective_x-objective_size, objective_y+objective_size, objective_z+objective_size,	objective_x+objective_size, objective_y+objective_size, objective_z+objective_size,	objective_x+objective_size, objective_y+objective_size, objective_z-objective_size,	// Top face
		objective_x-objective_size, objective_y-objective_size, objective_z-objective_size,	objective_x+objective_size, objective_y-objective_size, objective_z-objective_size,	objective_x+objective_size, objective_y-objective_size, objective_z+objective_size,	objective_x-objective_size, objective_y-objective_size, objective_z+objective_size,	// Bottom face
		objective_x+objective_size, objective_y-objective_size, objective_z-objective_size,	objective_x+objective_size, objective_y+objective_size, objective_z-objective_size,	objective_x+objective_size, objective_y+objective_size, objective_z+objective_size,	objective_x+objective_size, objective_y-objective_size, objective_z+objective_size,	// Right face
		objective_x-objective_size, objective_y-objective_size, objective_z-objective_size,	objective_x-objective_size, objective_y-objective_size, objective_z+objective_size,	objective_x-objective_size, objective_y+objective_size, objective_z+objective_size,	objective_x-objective_size, objective_y+objective_size, objective_z-objective_size ];	// Left face
	objectTextureCoords 	= [
		0.0, 0.0,	objectiveTextureSize, 0.0,	objectiveTextureSize, objectiveTextureSize,	0.0, objectiveTextureSize,	// Front face
		objectiveTextureSize, 0.0,	objectiveTextureSize, objectiveTextureSize,	0.0, objectiveTextureSize,	0.0, 0.0,	// Back face
		0.0, objectiveTextureSize,	0.0, 0.0,	objectiveTextureSize, 0.0,	objectiveTextureSize, objectiveTextureSize,	// Top face
		objectiveTextureSize, objectiveTextureSize,	0.0, objectiveTextureSize,	0.0, 0.0,	objectiveTextureSize, 0.0,	// Bottom face
		objectiveTextureSize, 0.0,	objectiveTextureSize, objectiveTextureSize,	0.0, objectiveTextureSize,	0.0, 0.0,	// Right face
		0.0, 0.0,	objectiveTextureSize, 0.0,	objectiveTextureSize, objectiveTextureSize,	0.0, objectiveTextureSize, ];// Left face	
	objectiveNormals = [ // Front face
		 0.0,  0.0,  1.0,	0.0,  0.0,  1.0,	0.0,  0.0,  1.0,	0.0,  0.0,  1.0, // Back face
		 0.0,  0.0, -1.0,	0.0,  0.0, -1.0,	0.0,  0.0, -1.0,	 0.0,  0.0, -1.0, // Top face
		 0.0,  1.0,  0.0,	0.0,  1.0,  0.0,	 0.0,  1.0,  0.0,	 0.0,  1.0,  0.0, // Bottom face
		 0.0, -1.0,  0.0,	0.0, -1.0,  0.0,	 0.0, -1.0,  0.0,	0.0, -1.0,  0.0, // Right face
		 1.0,  0.0,  0.0,	1.0,  0.0,  0.0,	1.0,  0.0,  0.0,	 1.0,  0.0,  0.0, // Left face
		-1.0,  0.0,  0.0,	 -1.0,  0.0,  0.0,	-1.0,  0.0,  0.0,	-1.0,  0.0,  0.0 ];				
	cubeIndices 			= [
		0, 1, 2,      0, 2, 3,    // Front face
		4, 5, 6,      4, 6, 7,    // Back face
		8, 9, 10,     8, 10, 11,  // Top face
		12, 13, 14,   12, 14, 15, // Bottom face
		16, 17, 18,   16, 18, 19, // Right face
		20, 21, 22,   20, 22, 23 ]; // Left face     
        
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.uniform1i(samplerUniform, 0); 
	
	// OBJECTIVE POSITION BUFFER
	gl.bindBuffer(gl.ARRAY_BUFFER, objectiveVertexPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objectPositionCoords), gl.STATIC_DRAW);
		objectiveVertexPositionBuffer.itemSize = 3;
		objectiveVertexPositionBuffer.numItems = objVertexCount;			
	gl.vertexAttribPointer(vertexPositionAttribute, objectiveVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
	// OBJECTIVE NORMAL BUFFER
	gl.bindBuffer(gl.ARRAY_BUFFER, objectiveNormalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objectiveNormals), gl.STATIC_DRAW);
		objectiveNormalBuffer.itemSize = 3;
		objectiveNormalBuffer.numItems = 24;
	gl.vertexAttribPointer(vertexNormalAttribute, objectiveNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
	// OBJECTIVE TEXTURE BUFFER
	gl.bindBuffer(gl.ARRAY_BUFFER, objectiveTextureCoordBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(objectTextureCoords), gl.STATIC_DRAW);
		objectiveTextureCoordBuffer.itemSize = 2;
		objectiveTextureCoordBuffer.numItems = objVertexCount;		
	gl.vertexAttribPointer(textureCoordAttribute, objectiveTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

	// OBJECTIVE INDICES BUFFER        
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, objectiveIndexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);
		objectiveIndexBuffer.itemSize = 1;
		objectiveIndexBuffer.numItems = 36;
	
	gl.drawElements(gl.TRIANGLES, objectiveIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}

function changeObjectiveLocation() {	
	if (Math.floor(Math.random()*2) == 1) 	{ objective_x =  Math.floor(Math.random()*8); }
	else 									{ objective_x = -Math.floor(Math.random()*8); }	
	if (Math.floor(Math.random()*2) == 1) 	{ objective_z =  Math.floor(Math.random()*8); }
	else 									{ objective_z = -Math.floor(Math.random()*8); }		
	point = false;
	score++;
	document.getElementById("score").innerHTML = "Score: " + score;
}

function deathSequence() {		
		loadObjective(2, lava, 5);
		loadWorld(2, 0.0, lava, 3);
		constraint(1.9,0);
		pos = [ 0.0, -0.3, 0.0 ]; 
		objective_x = 0.0;
		objective_z = 0.0;
		objective_y = 0.0;
		lighting = false;
		document.getElementById("status").innerHTML = "Status: " + "He's Dead Jim!";	
}

function handleKeys() {
	if (currentlyPressedKeys[33]) { 		camAngleRate = 0.1; 	// Page Up
	} else if (currentlyPressedKeys[34]) { 	camAngleRate = -0.1; 	// Page Down
	} else {								camAngleRate = 0;	}

	if (currentlyPressedKeys[37] || currentlyPressedKeys[65]) { 			turnRate = 0.13;		// Left cursor key or A
		} else if (currentlyPressedKeys[39] || currentlyPressedKeys[68]) { 	turnRate = -0.13;		// Right cursor key or D
		} else {															turnRate = 0; }

	if (currentlyPressedKeys[38] || currentlyPressedKeys[87]) {				speed =  0.0033 + boost;		// Up cursor key or W
		} else if (currentlyPressedKeys[40] || currentlyPressedKeys[83]) {	speed = -0.0033 - boost;  	// Down cursor key
		} else { 															speed = 0; 	}
	if (currentlyPressedKeys[32]) {											jump = true;	}	// space bar 
	if (currentlyPressedKeys[49]) { reset(); }
	if (currentlyPressedKeys[120]) { lighting = true; } 
	if (currentlyPressedKeys[119]) { lighting = false; }
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
	safety = gl.createTexture();
	safety.image = new Image();
	safety.image.onload = function () { handleLoadedTexture(safety) }
	safety.image.src = "FACK.gif";
	
	objCube = gl.createTexture();
	objCube.image = new Image();
	objCube.image.onload = function () { handleLoadedTexture(objCube) }
	objCube.image.src = "purple.gif"; 
	
	lava = gl.createTexture();
	lava.image = new Image();
	lava.image.onload = function () { handleLoadedTexture(lava) }
	lava.image.src = "lava.gif"; 
	
	enemyFace = gl.createTexture();
	enemyFace.image = new Image();
	enemyFace.image.onload = function () { handleLoadedTexture(enemyFace) }
	enemyFace.image.src = "angry.gif"; 
	
	enemyBody = gl.createTexture();
	enemyBody.image = new Image();
	enemyBody.image.onload = function () { handleLoadedTexture(enemyBody) }
	enemyBody.image.src = "snake.gif"; 
}

function initVar() {
	
	// WORLD VARIABLES
	vertexCount 			= 6;	
	vertexPositionCoords 	= [];
	vertexTextureCoords 	= []; 
	vertexNormalCoords 		= [];
	
	// OBJECTIVE VARIABLES
	objVertexCount 			= 24; 
	floatAngle				= 0;
	objectPositionCoords 	= [];
	objectTextureCoords 	= [];
	objectiveNormals		= [];
	cubeIndices 			= [];
	
	// ENEMY VARIABLES
	headVertexCount 		= 24; 
	bodyVertexCount			= 2883;
	headPositionCoords 		= [];
	headTextureCoords 		= [];
	headIndices 			= [];
	enemyHeadNormals		= [];
	enemy_x 				= 0.0;
	enemy_y 				= 0.0;
	enemy_z 				= 6.0;
	xVel 					= 1.5;
	zVel					= -2.3;
	bodyPositionCoords 		= [];
	bodyTextureCoords 		= [];
	bodyIndices 			= [];
	bodyNormalCoords		= [];

	// CAMERA VARIABLES
	mvMatrix 				= mat4.create();
	pMatrix 				= mat4.create();
	lighting 				= true;
	
	// CHARACTER VARIABLES
	currentlyPressedKeys 	= [];
	pos 					= [ 0.0, 0.4, 0.0 ];
	turn 					= 0;
	turnRate 				= 0;    
	camAngle 				= 0;
	camAngleRate	 		= 0;	
	objTrim					= 1/9;
	speed 					= 0;
	jumpStrength 			= 0.7;	
	jump 					= false;
	jumpAngle 				= 0.0;
	boost 					= 0;
	
	// GAME VARIABLES
	worldBounds 			= [];
	lavaBounds				= [];
	jailBounds				= [];
	point					= false;
	death					= false;
	score					= 0;
	highScore				= 0;		
	objective_x 			= 0.0;
	objective_z 			= -6.0;
	objective_y 			= 0.4;
}

function loadEnemy(size) {
	enemyTextureSize = 1;
	enemy_size = size;
	headPositionCoords 	= [ 
		enemy_x-enemy_size, enemy_y-enemy_size, enemy_z+enemy_size,	enemy_x+enemy_size, enemy_y-enemy_size, enemy_z+enemy_size,	enemy_x+enemy_size, enemy_y+enemy_size, enemy_z+enemy_size,	enemy_x-enemy_size, enemy_y+enemy_size, enemy_z+enemy_size,	// Front face
		enemy_x-enemy_size, enemy_y-enemy_size, enemy_z-enemy_size,	enemy_x-enemy_size, enemy_y+enemy_size, enemy_z-enemy_size,	enemy_x+enemy_size, enemy_y+enemy_size, enemy_z-enemy_size,	enemy_x+enemy_size, enemy_y-enemy_size, enemy_z-enemy_size,	// Back face
		enemy_x-enemy_size, enemy_y+enemy_size, enemy_z-enemy_size,	enemy_x-enemy_size, enemy_y+enemy_size, enemy_z+enemy_size,	enemy_x+enemy_size, enemy_y+enemy_size, enemy_z+enemy_size,	enemy_x+enemy_size, enemy_y+enemy_size, enemy_z-enemy_size,	// Top face
		enemy_x-enemy_size, enemy_y-enemy_size, enemy_z-enemy_size,	enemy_x+enemy_size, enemy_y-enemy_size, enemy_z-enemy_size,	enemy_x+enemy_size, enemy_y-enemy_size, enemy_z+enemy_size,	enemy_x-enemy_size, enemy_y-enemy_size, enemy_z+enemy_size,	// Bottom face
		enemy_x+enemy_size, enemy_y-enemy_size, enemy_z-enemy_size,	enemy_x+enemy_size, enemy_y+enemy_size, enemy_z-enemy_size,	enemy_x+enemy_size, enemy_y+enemy_size, enemy_z+enemy_size,	enemy_x+enemy_size, enemy_y-enemy_size, enemy_z+enemy_size,	// Right face
		enemy_x-enemy_size, enemy_y-enemy_size, enemy_z-enemy_size,	enemy_x-enemy_size, enemy_y-enemy_size, enemy_z+enemy_size,	enemy_x-enemy_size, enemy_y+enemy_size, enemy_z+enemy_size,	enemy_x-enemy_size, enemy_y+enemy_size, enemy_z-enemy_size ];	// Left face
	headTextureCoords 	= [
		0.0, 0.0,	enemyTextureSize, 0.0,	enemyTextureSize, enemyTextureSize,	0.0, enemyTextureSize,	// Front face
		enemyTextureSize, 0.0,	enemyTextureSize, enemyTextureSize,	0.0, enemyTextureSize,	0.0, 0.0,	// Back face
		0.0, enemyTextureSize,	0.0, 0.0,	enemyTextureSize, 0.0,	enemyTextureSize, enemyTextureSize,	// Top face
		enemyTextureSize, enemyTextureSize,	0.0, enemyTextureSize,	0.0, 0.0,	enemyTextureSize, 0.0,	// Bottom face
		enemyTextureSize, 0.0,	enemyTextureSize, enemyTextureSize,	0.0, enemyTextureSize,	0.0, 0.0,	// Right face
		0.0, 0.0,	enemyTextureSize, 0.0,	enemyTextureSize, enemyTextureSize,	0.0, enemyTextureSize, ];// Left face	
	enemyHeadNormals = [ // Front face
		 0.0,  0.0,  1.0,	0.0,  0.0,  1.0,	0.0,  0.0,  1.0,	0.0,  0.0,  1.0, // Back face
		 0.0,  0.0, -1.0,	0.0,  0.0, -1.0,	0.0,  0.0, -1.0,	 0.0,  0.0, -1.0, // Top face
		 0.0,  1.0,  0.0,	0.0,  1.0,  0.0,	 0.0,  1.0,  0.0,	 0.0,  1.0,  0.0, // Bottom face
		 0.0, -1.0,  0.0,	0.0, -1.0,  0.0,	 0.0, -1.0,  0.0,	0.0, -1.0,  0.0, // Right face
		 1.0,  0.0,  0.0,	1.0,  0.0,  0.0,	1.0,  0.0,  0.0,	 1.0,  0.0,  0.0, // Left face
		-1.0,  0.0,  0.0,	 -1.0,  0.0,  0.0,	-1.0,  0.0,  0.0,	-1.0,  0.0,  0.0 ];		
	headIndices 			= [
		0, 1, 2,      0, 2, 3,    // Front face
		4, 5, 6,      4, 6, 7,    // Back face
		8, 9, 10,     8, 10, 11,  // Top face
		12, 13, 14,   12, 14, 15, // Bottom face
		16, 17, 18,   16, 18, 19, // Right face
		20, 21, 22,   20, 22, 23 ]; // Left face     
        
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, enemyFace);
	gl.uniform1i(samplerUniform, 0); 
	
	// ENEMY POSITION BUFFER
	gl.bindBuffer(gl.ARRAY_BUFFER, enemyVertexPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(headPositionCoords), gl.STATIC_DRAW);
		enemyVertexPositionBuffer.itemSize = 3;
		enemyVertexPositionBuffer.numItems = headVertexCount;			
	gl.vertexAttribPointer(vertexPositionAttribute, enemyVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
	// ENEMY NORMAL BUFFER
	gl.bindBuffer(gl.ARRAY_BUFFER, enemyVertexNormalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(enemyHeadNormals), gl.STATIC_DRAW);
		enemyVertexNormalBuffer.itemSize = 3;
		enemyVertexNormalBuffer.numItems = headVertexCount;
	gl.vertexAttribPointer(vertexNormalAttribute, enemyVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
	// ENEMY TEXTURE BUFFER
	gl.bindBuffer(gl.ARRAY_BUFFER, enemyTextureCoordBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(headTextureCoords), gl.STATIC_DRAW);
		enemyTextureCoordBuffer.itemSize = 2;
		enemyTextureCoordBuffer.numItems = (headVertexCount/3) * 2;
	gl.vertexAttribPointer(textureCoordAttribute, enemyTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

	// ENEMY INDICES BUFFER        
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, enemyIndexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(headIndices), gl.STATIC_DRAW);
		enemyIndexBuffer.itemSize = 1;
		enemyIndexBuffer.numItems = 36;
	
	gl.drawElements(gl.TRIANGLES, enemyIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}

function drawPart(size, xPos, yPos, zPos) {

		var iterations = 30;
		var r = size;

		bodyPositionCoords = [];
		bodyTextureCoords = [];
		bodyNormalCoords = [];
		bodyIndices = [];

        for (var t=0; t <= iterations; t++) {
            var theta = t * Math.PI / iterations;
            for (var p=0; p <= iterations; p++) {
                var phi = p * 2 * Math.PI / iterations;
                var x = r * Math.cos(phi) * Math.sin(theta);
                var y = r * Math.cos(theta);
                var z = r * Math.sin(phi) * Math.sin(theta);
                var u = 1 - (p / iterations);
                var v = 1 - (t / iterations);
                var one = (t * (iterations + 1)) + p;
                var two = one + iterations + 1;
				
                bodyIndices.push(one);
                bodyIndices.push(two);
                bodyIndices.push(one + 1);
                bodyIndices.push(two);
                bodyIndices.push(two + 1);
                bodyIndices.push(one + 1);
				
				bodyNormalCoords.push(x);
                bodyNormalCoords.push(y);
                bodyNormalCoords.push(z);
                bodyTextureCoords.push(u);
                bodyTextureCoords.push(v);
                bodyPositionCoords.push(xPos + x);
                bodyPositionCoords.push(yPos + y);
                bodyPositionCoords.push(zPos + z);
            }
        }

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, enemyBody);
	gl.uniform1i(samplerUniform, 0); 
	
	// ENEMY POSITION BUFFER
	gl.bindBuffer(gl.ARRAY_BUFFER, enemyBodyVertexPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bodyPositionCoords), gl.STATIC_DRAW);
		enemyBodyVertexPositionBuffer.itemSize = 3;
		enemyBodyVertexPositionBuffer.numItems = (bodyPositionCoords.length/3);			
	gl.vertexAttribPointer(vertexPositionAttribute, enemyBodyVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
	// ENEMY NORMAL BUFFER
	gl.bindBuffer(gl.ARRAY_BUFFER, enemyBodyNormalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bodyNormalCoords), gl.STATIC_DRAW);
		enemyBodyNormalBuffer.itemSize = 3;
		enemyBodyNormalBuffer.numItems = (bodyNormalCoords.length/3);
	gl.vertexAttribPointer(vertexNormalAttribute, enemyBodyNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
	// ENEMY TEXTURE BUFFER
	gl.bindBuffer(gl.ARRAY_BUFFER, enemyBodyTextureCoordBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bodyTextureCoords), gl.STATIC_DRAW);
		enemyBodyTextureCoordBuffer.itemSize = 2;
		enemyBodyTextureCoordBuffer.numItems = (bodyTextureCoords.length/2);		
	gl.vertexAttribPointer(textureCoordAttribute, enemyBodyTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
	// ENEMY INDICES BUFFER  
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, enemyBodyIndexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(bodyIndices), gl.STREAM_DRAW);
		enemyBodyIndexBuffer.itemSize = 1;
		enemyBodyIndexBuffer.numItems = bodyIndices.length;
		alert(bodyNormalCoords.length + " and " + bodyPositionCoords.length +  " and " + bodyIndices.length);
	gl.drawElements(gl.TRIANGLES, enemyBodyIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
} 

function normalfunc(pointsArr) {
	var normalArray = [];
	for (var i = 0; i<pointsArr.length; i+=6)	{
		var t1 = vec3.subtract(pointsArr[i+1], pointsArr[i]);
		var t2 = vec3.subtract(pointsArr[i+2], pointsArr[i+1]);	
		var normal = vec3.normalize(vec3.create( t1[1]*t2[2] - t1[2]*t2[1], t1[2]*t2[0] - t1[0]*t2[2], t1[0]*t2[1] - t1[1]*t2[0] ));
		
		normalArray.push(normal); 
		normalArray.push(normal); 
		normalArray.push(normal);   
		normalArray.push(normal); 
		normalArray.push(normal); 
		normalArray.push(normal); 
	}
	return normalArray;
}

function logAndValidate(functionName, args) {
	logGLCalls(functionName, args);
	validateNoneOfTheArgsAreUndefined (functionName, args);
} 
function validateNoneOfTheArgsAreUndefined(functionName, args) {
	for (var ii = 0; ii < args.length; ++ii) {
		if (args[ii] === undefined) {
			console.error("undefined passed to gl." + functionName + "(" + WebGLDebugUtils.glFunctionArgsToString(functionName, args) + ")");
}	}	} 
function logGLCalls(functionName, args) {   
	console.log("gl." + functionName + "(" + WebGLDebugUtils.glFunctionArgsToString(functionName, args) + ")");   
} 
function throwOnGLError(err, funcName, args) {
	throw WebGLDebugUtils.glEnumToString(err) + " was caused by call to: " + funcName;
};

	
