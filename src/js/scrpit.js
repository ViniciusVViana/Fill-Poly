// obter elemento canvas e contexto
const canvas = document.getElementById("tela");
const ctx = canvas.getContext("2d");
const drawButton = document.getElementById("desenharBtn");
const polyListView = document.getElementById("listaPoligonos");

// DEFINE A RESOLUÇÃO EM PIXEL DO CANVAS PARA O TAMANHO DEFINIDO NO CSS
canvas.width = canvas.clientWidth * window.devicePixelRatio;
canvas.height = canvas.clientHeight * window.devicePixelRatio;

// VARIAVEIS IMPORTANTES
let poly = [];
let polyList = [];
let draw = true;

// PINTA O PONTO
function drawPoint(x, y, color = 'black', radius = 1) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fill();
}

function drawLine(x1, y1, x2, y2, color = 'black', width = 1) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

drawButton.addEventListener("click", function() {
    if (draw) {
        draw = false;
        drawButton.textContent = "Parar";
        canvas.style.pointerEvents = "auto"; // desabilita eventos de clique
    }else{
        draw = true;
        drawButton.textContent = "Desenhar";
        canvas.style.pointerEvents = "none"; // habilita eventos de clique
        drawLine(poly[poly.length - 1].x, poly[poly.length - 1].y, poly[0].x, poly[0].y);
        polyList.push([...poly]); // adiciona o polígono atual à lista
        poly = []
    }
})

// Listener no elemento canvas (não no contexto)
canvas.addEventListener("click", function(e) {
    const rect = canvas.getBoundingClientRect();
    // corrige para casos onde canvas é redimensionado via CSS (scaling)
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    console.log('Ponto desenhado em:', x, y);
    drawPoint(x, y);
    poly.push({ x, y });

    if (poly.length > 1) {
        drawLine(poly[poly.length - 2].x, poly[poly.length - 2].y, x, y);
    }
});

// debug opcional
// console.log('canvas size', canvas.width, canvas.height);