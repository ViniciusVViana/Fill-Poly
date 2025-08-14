const canvas = document.getElementById("tela");
const ctx = canvas.getContext("2d");
const drawButton = document.getElementById("desenharBtn");
const polyListView = document.getElementById("listaPoligonos");
const preencherPoligono = document.getElementById("preencherPoligono");

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

// PINTA A LINHA
function drawLine(x1, y1, x2, y2, color = 'black', width = 1) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

// BOTAO PARA ATIVAR E DESATIVAR O DESENHO
drawButton.addEventListener("click", function() {
    if (draw) {
        draw = false;
        drawButton.textContent = "Parar";
        canvas.style.pointerEvents = "auto"; // desabilita eventos de clique
    }else{
        draw = true;
        drawButton.textContent = "Desenhar";
        canvas.style.pointerEvents = "none"; // habilita eventos de clique
        drawLine(poly[poly.length - 1].x, poly[poly.length - 1].y, poly[0].x, poly[0].y); // PINTA A ARESTA FINAL DO POLIGONO
        polyList.push([...poly]); // adiciona o polígono atual à lista
        poly = []
    }
})

// LISTENER DO CANVAS
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
    console.log(poly); // teste

    // PINTA AS LINHAS A PARTIR DO SEGUNDO PONTO
    if (poly.length > 1) {
        drawLine(poly[poly.length - 2].x, poly[poly.length - 2].y, x, y);
    }
});

// experimental para testar o fillpoly
preencherPoligono.addEventListener("click", function() {
    
    fillPoly(polyList[0])

});

// Implementação do algoritmo de preenchimento por scanline
function fillPoly(pontos) {
    // Encontra yMin e yMax do polígono
    let yMin = Infinity;
    let yMax = -Infinity;
    
    for (const ponto of pontos) {
        if (ponto.y < yMin) yMin = ponto.y;
        if (ponto.y > yMax) yMax = ponto.y;
    }
    
    // Número de scanlines (linhas horizontais)
    const numScanlines = Math.floor(yMax - yMin) + 1;
 

    
    // Array para armazenar as interseções para cada scanline
    const intersecoes = Array(numScanlines).fill().map(() => []);
    
    // Processa cada aresta do polígono
    const numPontos = pontos.length;
    for (let i = 0; i < numPontos; i++) {
        const p1 = pontos[i];
        const p2 = pontos[(i + 1) % numPontos]; // quando é último ponto em p1, recebe o primeiro no p2
        
        // Ignora arestas horizontais
        if (p1.y === p2.y) continue;
        
        // Determina ponto superior(menor y) e inferior(maior y)
        let superior, inferior;
        if (p1.y < p2.y) {
            superior = p1;
            inferior = p2;
        } else {
            superior = p2;
            inferior = p1;
        }
        
        // Calcula incremento Tx = dx/dy (1/m)
        const dy = inferior.y - superior.y;
        const dx = inferior.x - superior.x;
        const Tx = dx / dy;
        
        // Calcula interseções para cada scanline
        let x = superior.x; // x do menor y
        let y = Math.floor(superior.y);
        const yfim = Math.floor(inferior.y);
        
        // Para cada scanline entre y e yfim
        while (y < yfim) {
            // Calcula o índice da scanline
            const indScanline = y - Math.floor(yMin);
            
            // Armazena a interseção se estiver dentro dos limites
            if (indScanline >= 0 && indScanline < numScanlines) {
                intersecoes[indScanline].push(x);
            }
            
            // Incrementa a taxa para x para a próxima scanline
            x += Tx;
            // Incrementa y para a próxima scanline
            y++;
        }

    }
    
    // cores de preenchimento
    const corPreenchimento = document.getElementById('inputPree').value; // vai virar uma funcao que pinta de acordo com a interpolacao das cores dos vertices
    ctx.fillStyle = corPreenchimento;


    // Ordena as interseções para cada scanline e preenche os segmentos
    for (let i = 0; i < numScanlines; i++) {
        const scanline = Math.floor(yMin) + i;
        const pontosX = intersecoes[i];
        
        // Pula se não tem interseções
        if (pontosX.length === 0) continue;

        // Ordena as interseções em ordem crescente de x
        pontosX.sort((a, b) => a - b);

        pontosX.sort((a, b) => a - b);
        
        // Preenche entre pares de interseções
        for (let j = 0; j < pontosX.length - 1; j += 2) {

           
        const xInicio = Math.ceil(pontosX[j]);
        const xFim = Math.floor(pontosX[j + 1]);

        if (xInicio < xFim) {
            ctx.fillRect(xInicio, scanline, xFim - xInicio, 1); // coord inicial x, coord inicial y, largura, altura
        }
            
            
            
        }
    }
    
}

