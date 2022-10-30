"use strict";

var canvas;
var gl;

var maxNumTriangles = 500;
var maxNumVertices = 3 * maxNumTriangles;

var index = 0;

var redraw = false;
// 기본 색 지정
var startColor = 8;

// 기본 포인트 크기 지정
var startSize = 1.0;
var pointSize = 3.0;

// 선택할 수 있는 색의 종류
var colors = [
  vec4(1.0, 0.0, 0.0, 1.0), // red
  vec4(1.0, 0.5, 0.0, 1.0), // orange
  vec4(1.0, 1.0, 0.0, 1.0), // yellow
  vec4(0.0, 1.0, 0.0, 1.0), // green
  vec4(0.0, 1.0, 1.0, 1.0), // cyan
  vec4(0.0, 0.0, 1.0, 1.0), // blue
  vec4(0.5, 0.0, 1.0, 1.0), // purple
  vec4(1.0, 1.0, 1.0, 1.0), // white
  vec4(0.0, 0.0, 0.0, 1.0), // black
];

// onload 함수를 통해 그림을 그릴 스케치북을 생성한다.
window.onload = function init() {
  canvas = document.getElementById("gl-canvas");

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }

  // 마우스 버튼을 누를 경우 redraw가 true가 된다.
  canvas.addEventListener("mousedown", function (event) {
    redraw = true;
  });

  // 마우스 버튼을 뗄 경우 redraw가 false가 된다.
  canvas.addEventListener("mouseup", function (event) {
    redraw = false;
  });

  // 마우스 버튼을 움직일 경우 redraw가 true라면 그림이 그려진다.
  canvas.addEventListener("mousemove", function (event) {
    document.getElementById("changeColor").onchange = function (event) {
      startColor = parseInt(event.target.value);
    };
    if (redraw) {
      // 스케치북 버퍼를 할당한다.
      gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);

      // 마우스가 움직일 경우 그려지는 사각형의 점의 좌표
      var t = vec2(
        (2 * event.clientX) / canvas.width - 1,
        (2 * (canvas.height - event.clientY)) / canvas.height - 1
      );

      document.getElementById("changeSize").onchange = function (event) {
        startSize = parseInt(event.target.value);
      };

      gl.bufferSubData(gl.ARRAY_BUFFER, 8 * index, flatten(t));
      gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);

      // 색상 조정하기
      t = vec4(colors[startColor]);

      // 그림의 굵기 및 크기 조정하기
      gl.uniform1f(
        gl.getUniformLocation(program, "vPointSize"),
        pointSize * startSize
      );

      gl.bufferSubData(gl.ARRAY_BUFFER, 16 * index, flatten(t));

      index++;
    }
  });

  gl.viewport(0, 0, canvas.width, canvas.height); // 클리핑 윈도우 생성
  gl.clearColor(0.1, 0.3, 0.5, 1.0); // 배경색

  // initShader를 사용하여 shader를 로드, 컴파일, 링크하여 프로그램 객체를 형성한다.
  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  // GPU에게 사용할 프로그램을 알려준다.
  gl.useProgram(program);

  // 프로그램 내의 변수와 shader의 변수를 연결한다.
  var vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, 8 * maxNumVertices, gl.STATIC_DRAW);

  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  // 응용프로그램에서 색상 보내기
  var cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, 16 * maxNumVertices, gl.STATIC_DRAW);

  var vColor = gl.getAttribLocation(program, "vColor");
  gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);

  render();
};

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.POINTS, 0, index);

  window.requestAnimFrame(render);
}
