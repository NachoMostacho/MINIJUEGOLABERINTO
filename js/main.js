// # = muro, . = camino, S = inicio, G = salida.
const niveles = [
  [
    '#######',
    '#S#...#',
    '#.###.#',
    '#.#...#',
    '#.#.#.#',
    '#...#G#',
    '#######'
  ],
  [
    '#########',
    '#S....#.#',
    '#####.#.#',
    '#.#...#.#',
    '#.#.###.#',
    '#...#...#',
    '#.###.#.#',
    '#.....#G#',
    '#########'
  ],
  [
    '###########',
    '#S#...#...#',
    '#.#.#.#.###',
    '#...#.#...#',
    '#####.#.#.#',
    '#.....#.#.#',
    '#.#######.#',
    '#...#.....#',
    '###.#.###.#',
    '#.....#..G#',
    '###########'
  ],
  [
    '#############',
    '#S#...#.....#',
    '#.#.###.#.#.#',
    '#.#.....#.#.#',
    '#.#######.#.#',
    '#...#.....#.#',
    '###.#.#####.#',
    '#.#...#.#...#',
    '#.#####.#.###',
    '#...#.....#.#',
    '#.#.#.#####.#',
    '#.#........G#',
    '#############'
  ],
  [
    '###############',
    '#S#.#.........#',
    '#.#.#.###.###.#',
    '#.#.....#.#...#',
    '#.#######.#.###',
    '#...#.....#.#.#',
    '###.#.#####.#.#',
    '#.#...#.....#.#',
    '#.#####.#####.#',
    '#...#...#.....#',
    '#.###.###.###.#',
    '#.#...#...#...#',
    '#.#.#####.#.###',
    '#.........#..G#',
    '###############'
  ]
];

const tablero = document.getElementById('laberinto');
const textoNivel = document.getElementById('nivel');
const textoMovimientos = document.getElementById('movimientos');
const progreso = document.getElementById('progreso');
const mensaje = document.getElementById('mensaje');
const reiniciar = document.getElementById('reiniciar');
const siguiente = document.getElementById('siguiente');
const controles = document.querySelectorAll('[data-dx]');

let nivelActual = 0;
let jugador = { x: 1, y: 1 };
let movimientos = 0;
let completado = false;

// Carga un nivel y devuelve al jugador a la casilla inicial.
function cargarNivel() {
  const mapa = niveles[nivelActual];
  mapa.forEach((fila, y) => {
    const x = fila.indexOf('S');
    if (x !== -1) jugador = { x, y };
  });
  movimientos = 0;
  completado = false;
  textoNivel.textContent = `${nivelActual + 1} / ${niveles.length}`;
  textoMovimientos.textContent = movimientos;
  mensaje.textContent = '¡Encuentra la salida!';
  mensaje.classList.remove('exito');
  siguiente.hidden = true;
  reiniciar.textContent = 'Reiniciar nivel';
  controles.forEach(boton => boton.disabled = false);
  actualizarProgreso();
  dibujarLaberinto();
}

// Dibuja el mapa con una cuadrícula de divs.
function dibujarLaberinto() {
  const mapa = niveles[nivelActual];
  tablero.style.gridTemplateColumns = `repeat(${mapa[0].length}, 1fr)`;
  tablero.style.gridTemplateRows = `repeat(${mapa.length}, 1fr)`;
  tablero.replaceChildren();
  const celdas = document.createDocumentFragment();
  mapa.forEach((fila, y) => {
    [...fila].forEach((tipo, x) => {
      const celda = document.createElement('div');
      celda.className = 'celda';
      if (tipo === '#') celda.classList.add('muro');
      if (tipo === 'G') celda.classList.add('meta');
      if (x === jugador.x && y === jugador.y) celda.classList.add('jugador');
      celdas.appendChild(celda);
    });
  });
  tablero.appendChild(celdas);
  tablero.setAttribute('aria-label', `Laberinto ${nivelActual + 1}. Jugador en fila ${jugador.y + 1}, columna ${jugador.x + 1}.`);
}

// Actualiza los cinco indicadores de progreso.
function actualizarProgreso() {
  progreso.replaceChildren();
  const totalCompletados = nivelActual + (completado ? 1 : 0);
  niveles.forEach((_, i) => {
    const paso = document.createElement('span');
    paso.className = 'paso';
    if (i < totalCompletados) paso.classList.add('completo');
    else if (i === nivelActual) paso.classList.add('actual');
    progreso.appendChild(paso);
  });
  progreso.setAttribute('aria-label', `${totalCompletados} de ${niveles.length} niveles completados`);
}

// Mueve al jugador únicamente si la casilla es transitable.
function mover(dx, dy) {
  if (completado) return;
  const x = jugador.x + dx;
  const y = jugador.y + dy;
  const destino = niveles[nivelActual][y]?.[x];
  if (!destino || destino === '#') return;

  jugador = { x, y };
  movimientos++;
  textoMovimientos.textContent = movimientos;
  dibujarLaberinto();
  if (destino === 'G') ganarNivel();
}

// Al llegar a la salida, habilita el siguiente nivel o la opción de volver a jugar.
function ganarNivel() {
  completado = true;
  actualizarProgreso();
  controles.forEach(boton => boton.disabled = true);
  mensaje.classList.add('exito');
  const ultimo = nivelActual === niveles.length - 1;
  mensaje.textContent = ultimo ? '¡Ganaste! Completaste los 5 niveles.' : '¡Nivel superado!';
  siguiente.textContent = ultimo ? 'Volver a jugar' : 'Siguiente nivel';
  siguiente.hidden = false;
  siguiente.focus();
}

// Controles de teclado: flechas y WASD.
const teclas = {
  ArrowUp: [0, -1], w: [0, -1],
  ArrowDown: [0, 1], s: [0, 1],
  ArrowLeft: [-1, 0], a: [-1, 0],
  ArrowRight: [1, 0], d: [1, 0]
};
document.addEventListener('keydown', evento => {
  if (evento.ctrlKey || evento.altKey || evento.metaKey) return;
  const direccion = teclas[evento.key] || teclas[evento.key.toLowerCase()];
  if (Array.isArray(direccion)) {
    evento.preventDefault();
    mover(...direccion);
  }
});

// Botones para dispositivos táctiles y ratón.
controles.forEach(boton => {
  boton.addEventListener('click', () => mover(Number(boton.dataset.dx), Number(boton.dataset.dy)));
});
reiniciar.addEventListener('click', cargarNivel);
siguiente.addEventListener('click', () => {
  if (!completado) return;
  nivelActual = (nivelActual + 1) % niveles.length;
  cargarNivel();
  reiniciar.focus();
});

cargarNivel();
