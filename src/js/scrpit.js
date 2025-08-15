const canvas = document.getElementById("tela");
const ctx = canvas.getContext("2d");
const drawButton = document.getElementById("desenharBtn");
const polyListView = document.getElementById("listaPoligonos");
const preencherPoligono = document.getElementById("preencherPoligono");
const limparTela = document.getElementById("clearButton")

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

        // VERIFICA SE O POLÍGONO TEM PELO MENOS 3 VÉRTICES
        if (poly.length < 3) {
            alert("Erro: Um polígono precisa de pelo menos 3 vértices.");
            // Limpa os pontos já desenhados no canvas que não formaram um polígono
            ctx.clearRect(0, 0, canvas.width, canvas.height); 
            poly = []; // limpa o array de vértices atual
            
            // Redesenha os polígonos que já estavam na lista
            polyList.forEach(poligonoObj => {
                const vertices = poligonoObj.vertices;
                // Desenha as arestas
                for (let i = 0; i < vertices.length; i++) {
                    const currentPoint = vertices[i];
                    const nextPoint = vertices[(i + 1) % vertices.length];
                    drawPoint(currentPoint.x, currentPoint.y, corVertHex, 3);
                    drawLine(currentPoint.x, currentPoint.y, nextPoint.x, nextPoint.y);
                }
                
                // Se o polígono já estava preenchido, preenche de novo
                if (poligonoObj.isFilled) {
                    fillPoly(vertices);
                }
            });

            // Reseta o botão para o estado inicial de desenho
            draw = true;
            drawButton.textContent = "Desenhar";
            canvas.style.pointerEvents = "none";
            return; // Interrompe a execução para não salvar o polígono inválido
        }

        draw = true;
        drawButton.textContent = "Desenhar";
        canvas.style.pointerEvents = "none"; // habilita eventos de clique
        drawLine(poly[poly.length - 1].x, poly[poly.length - 1].y, poly[0].x, poly[0].y); // PINTA A ARESTA FINAL DO POLIGONO

        // Cria um objeto para o polígono
        const novoPoligono = {
            vertices: [...poly], // adiciona o polígono atual à lista
            isFilled: false, // seta flag de preenchimento
        };
        polyList.push(novoPoligono); // adiciona o novo objeto à lista
        addPolyToListView(novoPoligono, polyList.length)
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
   

    const corVertHex = document.getElementById('inputCorVert').value; // Pega a cor selecionada no input
    const corVertRgb = hexToRgb(corVertHex); // converte de Hex para RGB para interpolar depois
    
    console.log('Ponto desenhado em:', x, y, 'com a cor', corVertHex);

    drawPoint(x, y, corVertHex, 3); // desenha o ponto com a cor escolhida e raio maior
    poly.push({ x, y, cor: corVertRgb}); // adiciona uma referencia a cor do vertice dentro do atributo vertices
    console.log(poly); // teste

    // PINTA AS LINHAS A PARTIR DO SEGUNDO PONTO
    if (poly.length > 1) {
        drawLine(poly[poly.length - 2].x, poly[poly.length - 2].y, x, y);
    }
});

// PREENCHE OS POLIGONOS
preencherPoligono.addEventListener("click", function() {
    
    for(let i = 0; i < polyList.length; i++){
        const poligonoAtual = polyList[i];

        // Só preenche se o polígono ainda não foi preenchido
        if (!poligonoAtual.isFilled) {
            fillPoly(poligonoAtual.vertices); // Passa apenas os vértices para a função
            poligonoAtual.isFilled = true; // Marca como preenchido
        }
    }
    

});


// LIMPA A TELA
limparTela.addEventListener("click", function() {

    ctx.clearRect(0,0, canvas.width, canvas.height);
    poly = [];
    polyList = [];
    polyListView.innerHTML = ''; // Remove todos os itens da lista
    console.log(poly);
    console.log(polyList);

});

// ADICIONA POLÍGONO NA LISTA DA TELA
function addPolyToListView(poligono, numero) {
    // Cria o elemento de lista 'li' que servirá como container
    const listItem = document.createElement('li');
    listItem.className = 'list-group-item'; 
    listItem.id = `list-item-${numero - 1}`;

    // 2. Cada vértice recebe uma string em html
    const verticesHTML = poligono.vertices.map((vertice, index) => {
        const x = Math.round(vertice.x);
        const y = Math.round(vertice.y);
        return `<li>Vértice ${index + 1}: (${x}, ${y})</li>`;
    }).join(''); // trasnforma o array de strings em uma string 

    // 3. Monta a estrutura HTML interna do item da lista
    listItem.innerHTML = `
        <div class="polygon-header">
            <strong>Polígono ${numero}</strong>
        </div>
        <ul class="vertex-list">
            ${verticesHTML}
        </ul>
    `;
    
    // 4. Adiciona o item completo à lista na página
    polyListView.appendChild(listItem);
}



// ALGORITMO DE FILLPOLY
function fillPoly(pontos) {
    // Encontra yMin e yMax do polígono
    let yMin = Infinity;
    let yMax = -Infinity;
    
    for (const ponto of pontos) {
        if (ponto.y < yMin) yMin = ponto.y;
        if (ponto.y > yMax) yMax = ponto.y;
    }

    // trunca os valores para poder calcular inteiros
    yMin = Math.floor(yMin)
    yMax = Math.floor(yMax)
    
    // Número de scanlines (linhas horizontais)
    const numScanlines = yMax - yMin + 1;
 
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

        console.log(superior.cor); // teste
        console.log(inferior.cor); // teste
        
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
            const indScanline = y - yMin;
  
            // Armazena a interseção se estiver dentro dos limites
            if (indScanline >= 0 && indScanline < numScanlines) {

                // Fator de interpolação vertical (t_vertical)
                const t_vertical = (y - superior.y) / dy;

                // Interpola a cor na aresta para a scanline atual
                const corNaAresta = interpolateColor(superior.cor, inferior.cor, t_vertical);
                
                intersecoes[indScanline].push({x: x, cor: corNaAresta});

            }
            
            // Incrementa a taxa para x para a próxima scanline
            x += Tx;
            // Incrementa y para a próxima scanline
            y++;
        }

    }


    // Ordena as interseções para cada scanline e preenche os segmentos
    for (let i = 0; i < numScanlines; i++) {
        const scanline = yMin + i;
        const pontosX = intersecoes[i];
        
        // Evita interseções erradas
        if (pontosX.length < 2) continue;

        // Ordena as interseções em ordem crescente de x
        pontosX.sort((a, b) => a.x - b.x);

        // Preenche entre pares de interseções
        for (let j = 0; j < pontosX.length - 1; j += 2) {
            // armazena valor bruto para interpolacao
            const xStart = pontosX[j];
            const xEnd = pontosX[j + 1];
           
            // armazena valor truncado para trabalhar com inteiros
            const xInicio = Math.ceil(xStart.x);
            const xFim = Math.floor(xEnd.x);

            larguraSegmento = xEnd.x - xStart.x;
            // if (xInicio < xFim) {

            //     //ctx.fillRect(xInicio, scanline, xFim - xInicio, 1); // coord inicial x, coord inicial y, largura, altura
            //     // pinta a linha
            //     drawLine(xInicio, scanline, xFim, scanline, corPreenchimento);
            // }

            // pinta pixel a pixel
            for (let x = xInicio; x < xFim; x++) {
                // Fator de interpolação horizontal (t_horizontal)
                const t_horizontal = (larguraSegmento === 0) ? 0 : (x - xStart.x) / larguraSegmento;

                // Interpola a cor ao longo da scanline
                const corPixel = interpolateColor(xStart.cor, xEnd.cor, t_horizontal);
                
                corPreenchimento = rgbToCss(corPixel);
                drawLine(x, scanline, x + 1, scanline, corPreenchimento);
                // ctx.fillStyle = rgbToCss(corPixel);
                // ctx.fillRect(x, scanlineY, 1, 1); // Desenha um único pixel
            }
            
            
            
        }
    }
    
}


// Converte uma cor hexadecimal para um objeto RGB.
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// Converte um objeto RGB para uma string de cor CSS.
function rgbToCss(rgb) {
    return `rgb(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)})`;
}

// Interpola linearmente entre duas cores.
function interpolateColor(color1, color2, t) {
    return {
        r: color1.r * (1 - t) + color2.r * t,
        g: color1.g * (1 - t) + color2.g * t,
        b: color1.b * (1 - t) + color2.b * t
    };
}