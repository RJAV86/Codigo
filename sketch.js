let shapeSelect;
let colorPicker;
let countSlider;
let spreadSlider;
let speedSlider;

let particles = [];
const MAX_PARTICLES = 300;

// Variables para la lluvia digital (Matrix)
let matrixStreams = [];
const FONT_SIZE = 16;
const CHARACTERS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  textFont('monospace');

  // Inicializar columnas de Matrix
  let numColumns = floor(width / FONT_SIZE);
  for (let i = 0; i < numColumns; i++) {
    matrixStreams.push({
      x: i * FONT_SIZE,
      y: random(-height, 0),
      speed: random(2, 6),
      chars: []
    });

    // Generar caracteres iniciales por columna
    let streamLength = floor(random(8, 25));
    for (let j = 0; j < streamLength; j++) {
      let charIndex = floor(random(CHARACTERS.length));
      matrixStreams[i].chars.push(CHARACTERS[charIndex]);
    }
  }

  // Panel de control
  let controlPanel = createDiv();
  controlPanel.position(15, 15);
  controlPanel.style('background', 'rgba(10, 15, 12, 0.9)');
  controlPanel.style('padding', '12px 16px');
  controlPanel.style('border-radius', '8px');
  controlPanel.style('border', '1px solid #00ff66');
  controlPanel.style('color', '#ffffff');
  controlPanel.style('font-family', 'sans-serif');
  controlPanel.style('font-size', '13px');
  controlPanel.style('display', 'flex');
  controlPanel.style('flex-direction', 'column');
  controlPanel.style('gap', '8px');
  controlPanel.style('z-index', '10');

  let shapeLabel = createSpan('Forma:');
  controlPanel.child(shapeLabel);
  shapeSelect = createSelect();
  shapeSelect.option('Círculos', 'circle');
  shapeSelect.option('Cuadrados', 'square');
  shapeSelect.option('Triángulos', 'triangle');
  shapeSelect.option('Estrellas', 'star');
  shapeSelect.option('Líneas cruzadas', 'cross');
  controlPanel.child(shapeSelect);

  let colorLabel = createSpan('Color de figuras:');
  controlPanel.child(colorLabel);
  colorPicker = createColorPicker('#00ff66');
  controlPanel.child(colorPicker);

  let countLabel = createSpan('Cantidad / Elementos:');
  controlPanel.child(countLabel);
  countSlider = createSlider(5, MAX_PARTICLES, 60, 1);
  controlPanel.child(countSlider);

  let spreadLabel = createSpan('Dispersión:');
  controlPanel.child(spreadLabel);
  spreadSlider = createSlider(20, 400, 150, 1);
  controlPanel.child(spreadSlider);

  let speedLabel = createSpan('Velocidad:');
  controlPanel.child(speedLabel);
  speedSlider = createSlider(0.1, 3.0, 1.0, 0.1);
  controlPanel.child(speedSlider);

  // Inicializar partículas orbitales
  for (let i = 0; i < MAX_PARTICLES; i++) {
    particles.push({
      angle: random(360),
      speed: random(0.5, 2.0),
      radiusOffset: random(0.5, 1.5),
      size: random(15, 40),
      rot: random(360),
      rotSpeed: random(-2, 2)
    });
  }
}

function draw() {
  // Fondo semitransparente oscuro para crear el rastro de la Matrix
  background(0, 0, 0, 70);

  // Renderizado del fondo Matrix
  drawMatrixBackground();

  // Renderizado de las geometrías en movimiento
  let currentShape = shapeSelect.value();
  let baseColor = colorPicker.color();
  let count = countSlider.value();
  let spread = spreadSlider.value();
  let speedMult = speedSlider.value();

  stroke(baseColor);
  strokeWeight(1.8);
  noFill();

  push();
  translate(width / 2, height / 2);

  for (let i = 0; i < count; i++) {
    let p = particles[i];

    p.angle += p.speed * speedMult;
    p.rot += p.rotSpeed * speedMult;

    let distFromCenter = spread * p.radiusOffset;
    let x = cos(p.angle) * distFromCenter;
    let y = sin(p.angle) * (distFromCenter * 0.7);

    push();
    translate(x, y);
    rotate(p.rot);
    renderShape(currentShape, p.size);
    pop();

    if (i > 0 && i % 4 === 0) {
      let prev = particles[i - 1];
      let px = cos(prev.angle) * (spread * prev.radiusOffset);
      let py = sin(prev.angle) * (spread * prev.radiusOffset * 0.7);
      stroke(red(baseColor), green(baseColor), blue(baseColor), 60);
      line(x, y, px, py);
      stroke(baseColor);
    }
  }
  pop();
}

function drawMatrixBackground() {
  textSize(FONT_SIZE);
  noStroke();

  for (let i = 0; i < matrixStreams.length; i++) {
    let stream = matrixStreams[i];

    for (let j = 0; j < stream.chars.length; j++) {
      let charY = stream.y - j * FONT_SIZE;

      // El primer carácter de la columna es blanco/brillante, el resto verde degradado
      if (j === 0) {
        fill(180, 255, 200, 240);
      } else {
        let greenFade = map(j, 1, stream.chars.length, 210, 40);
        fill(0, greenFade, 50, greenFade);
      }

      // Mutación aleatoria esporádica de caracteres
      if (frameCount % 4 === 0 && random() < 0.05) {
        let charIndex = floor(random(CHARACTERS.length));
        stream.chars[j] = CHARACTERS[charIndex];
      }

      text(stream.chars[j], stream.x, charY);
    }

    // Desplazamiento vertical hacia abajo
    stream.y += stream.speed;

    // Reinicio al salir de la pantalla
    if (stream.y - stream.chars.length * FONT_SIZE > height) {
      stream.y = 0;
      stream.speed = random(2, 6);
    }
  }
}

function renderShape(shapeType, sz) {
  if (shapeType === 'circle') {
    ellipse(0, 0, sz);
  } else if (shapeType === 'square') {
    rectMode(CENTER);
    rect(0, 0, sz, sz);
  } else if (shapeType === 'triangle') {
    let h = sz * 0.866;
    triangle(0, -h / 2, -sz / 2, h / 2, sz / 2, h / 2);
  } else if (shapeType === 'star') {
    beginShape();
    for (let a = 0; a < 360; a += 72) {
      let sx = cos(a) * (sz / 2);
      let sy = sin(a) * (sz / 2);
      vertex(sx, sy);
      sx = cos(a + 36) * (sz / 4);
      sy = sin(a + 36) * (sz / 4);
      vertex(sx, sy);
    }
    endShape(CLOSE);
  } else if (shapeType === 'cross') {
    line(-sz / 2, 0, sz / 2, 0);
    line(0, -sz / 2, 0, sz / 2);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // Recalcular columnas si cambia la resolución de pantalla
  matrixStreams = [];
  let numColumns = floor(width / FONT_SIZE);
  for (let i = 0; i < numColumns; i++) {
    let streamLength = floor(random(8, 25));
    let chars = [];
    for (let j = 0; j < streamLength; j++) {
      chars.push(CHARACTERS[floor(random(CHARACTERS.length))]);
    }
    matrixStreams.push({
      x: i * FONT_SIZE,
      y: random(-height, 0),
      speed: random(2, 6),
      chars: chars
    });
  }
}