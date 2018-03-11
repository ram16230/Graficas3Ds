let vertexShaderText = [
  'precision mediump float;',
  '',
  'attribute vec3 vertPosition;',
  'attribute vec2 vertTexCoord;',
  'varying vec2 fragTexCoord;',
  'uniform mat4 mWorld;',
  'uniform mat4 mView;',
  'uniform mat4 mProj;',
  '',
  'void main()',
  '{',
  'fragTexCoord = vertTexCoord;',
  'gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);',
  '}'
].join('\n');

let fragmentShaderText = [
  'precision mediump float;',
  '',
  'varying vec2 fragTexCoord;',
  'uniform sampler2D sampler;',
  '',
  'void main()',
  '{',
  ' gl_FragColor = texture2D(sampler, fragTexCoord);',
  '}'
].join('\n');

function start() {

  console.log("Funcionando");

  let canvas = document.getElementById('canvas');
  let gl = canvas.getContext('webgl');

  if (!gl){
    console.log("Utilizando version experimental!");
    gl = canvas.getContext('experimental-webgl');
  }

  if (!gl){
    console.log("Su navegador no soporta webgl");
  }

  clearCanvas(gl);

  /*
  ** CREAR SHADERS
  */

  let vertexShader = gl.createShader(gl.VERTEX_SHADER);
  let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  //set shader
  gl.shaderSource(vertexShader, vertexShaderText);
  gl.shaderSource(fragmentShader, fragmentShaderText);

  gl.compileShader(vertexShader);
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
    console.error("ERROR", gl.getShaderInfoLog(vertexShader));
    return;
  }

  gl.compileShader(fragmentShader);
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
    console.error("ERROR", gl.getShaderInfoLog(fragmentShader));
    return;
  }

  let program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);  //Link program
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)){
    console.error("ERROR", gl.getProgramInfoLog(program));
    return;
  }

  //Validar programa, solo en test
  gl.validateProgram(program);
  if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)){
    console.error("ERROR", gl.getProgramInfoLog(program));
    return;
  }

  /*
  ** CREAR BUFFER
  */
  let boxVertices =
	[ //X,    Y,     Z         U    V
		// Top
		-1.0,   1.0,  -1.0,      0,   0,
		-1.0,   1.0,   1.0,      0,   1,
		 1.0,   1.0,   1.0,      1,   1,
		 1.0,   1.0,  -1.0,      1,   0,

		// Left
		-1.0,   1.0,   1.0,      0,    0,
		-1.0,  -1.0,   1.0,      1,    0,
		-1.0,  -1.0,  -1.0,      1,    1,
		-1.0,   1.0,  -1.0,      0,    1,

		// Right
		 1.0,   1.0,   1.0,      1,    1,
		 1.0,  -1.0,   1.0,      0,    1,
		 1.0,  -1.0,  -1.0,      0,    0,
		 1.0,   1.0,  -1.0,      1,    0,

		// Front
		 1.0,   1.0,   1.0,      1,    1,
		 1.0,  -1.0,   1.0,      1,    0,
		-1.0,  -1.0,   1.0,      0,    0,
		-1.0,   1.0,   1.0,      0,    1,

		// Back
		 1.0,   1.0,  -1.0,      0,    0,
		 1.0,  -1.0,  -1.0,      0,    1,
		-1.0,  -1.0,  -1.0,      1,    1,
		-1.0,   1.0,  -1.0,      1,    0,

		// Bottom
		-1.0,  -1.0,  -1.0,      1,    1,
		-1.0,  -1.0,   1.0,      1,    0,
		 1.0,  -1.0,   1.0,      0,    0,
		 1.0,  -1.0,  -1.0,      0,    1,
	];

	let boxIndices =
	[
		// Top
		0, 1, 2,
		0, 2, 3,

		// Left
		5, 4, 6,
		6, 4, 7,

		// Right
		8, 9, 10,
		8, 10, 11,

		// Front
		13, 12, 14,
		15, 14, 12,

		// Back
		16, 17, 18,
		16, 18, 19,

		// Bottom
		21, 20, 22,
		22, 20, 23
	];

  let boxVertexBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices),gl.STATIC_DRAW);

  let boxIndexBufferObject = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices),gl.STATIC_DRAW);

  let positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
  let textCoordAtribLocation = gl.getAttribLocation(program, 'vertTexCoord');
  gl.vertexAttribPointer(
    positionAttribLocation,             //Posicion Index
    3,                                  //Dimensiones
    gl.FLOAT,                           //Tipo de elementos
    gl.FALSE,                           //
    5 * Float32Array.BYTES_PER_ELEMENT, //Size de cada vertice
    0                                   //Offset
  );

  gl.vertexAttribPointer(
    textCoordAtribLocation,                //Posicion Index
    2,                                  //Dimensiones
    gl.FLOAT,                           //Tipo de elementos
    gl.FALSE,                           //
    5 * Float32Array.BYTES_PER_ELEMENT, //Size de cada vertice
    3 * Float32Array.BYTES_PER_ELEMENT  //Offset
  );

  gl.enableVertexAttribArray(positionAttribLocation);
  gl.enableVertexAttribArray(textCoordAtribLocation);

  /*
  **CREATE TEXTURE
  */
  let boxTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, boxTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  gl.texImage2D(
    gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
    gl.UNSIGNED_BYTE,
    document.getElementById('crate-img')
  );
  gl.useProgram(program);

  let matWorldUniformLocation =gl.getUniformLocation(program,'mWorld');
  let matViewUniformLocation =gl.getUniformLocation(program,'mView');
  let matProjUniformLocation =gl.getUniformLocation(program,'mProj');

  let worldMatrix = new Float32Array(16);
  let viewMatrix = new Float32Array(16);
  let projMatrix = new Float32Array(16);
  mat4.identity(worldMatrix);
  mat4.lookAt(viewMatrix, [0, 0, -5], [0, 0, 0], [0, 1, 0]);
  mat4.perspective(projMatrix, glMatrix.toRadian(60), canvas.width / canvas.height, 0.1, 1000.0);

  gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
  gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
  gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);
  /*
  **RENDER
  */
  let identityMatix = new Float32Array(16);
  let xRotate = new Float32Array(16);
  let yRotate = new Float32Array(16);

  mat4.identity(identityMatix);
  let theta = 0;
  var loop = function (){
    theta = performance.now() / 1000 / 6 * 2 * Math.PI;
    mat4.rotate(yRotate, identityMatix, theta, [0,1,0]);
    mat4.rotate(xRotate, identityMatix, theta / 4, [1,0,0]);
    mat4.multiply(worldMatrix, yRotate, xRotate);
    //mat4.translate(worldMatrix, identityMatix, );
    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

    clearCanvas(gl);
    
    gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);


};

function clearCanvas(gl) {
  gl.clearColor(0.75,0.85,0.8,1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  //No renderizar lo que no se ve
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.frontFace(gl.CCW);
  gl.cullFace(gl.BACK);
}
