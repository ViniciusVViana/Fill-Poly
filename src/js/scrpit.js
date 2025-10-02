const canvas = document.getElementById("tela");
const ctx = canvas.getContext("2d");
const drawButton = document.getElementById("desenharBtn");
const polyListView = document.getElementById("listaPoligonos");
const preencherPoligono = document.getElementById("preencherPoligono");
const limparTela = document.getElementById("clearButton");
const excluirPoligono = document.getElementById("deletarPoligono");

// DEFINE A RESOLUÇÃO EM PIXEL DO CANVAS PARA O TAMANHO DEFINIDO NO CSS
canvas.width = canvas.clientWidth * window.devicePixelRatio;
canvas.height = canvas.clientHeight * window.devicePixelRatio;

// VARIAVEIS IMPORTANTES
let poly = [];
let polyList = [];
let draw = true;
let poligonoSelecionado = null; // Guarda o ÍNDICE do polígono selecionado

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

// FUNÇÃO PARA REDESENHAR POLÍGONOS
function redrawAll() {
    // Limpa completamente o canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Itera sobre cada polígono na lista principal
    polyList.forEach(poligonoObj => {
        const vertices = poligonoObj.vertices;

        // Desenha as arestas e os vértices do polígono
        for (let i = 0; i < vertices.length; i++) {
            const currentPoint = vertices[i];
            const nextPoint = vertices[(i + 1) % vertices.length];
            
            // Desenha o vértice com a sua cor correta
            drawPoint(currentPoint.x, currentPoint.y, rgbToCss(currentPoint.cor), 3);

            // Desenha a aresta 
            drawLine(currentPoint.x, currentPoint.y, nextPoint.x, nextPoint.y);
        }

        // Se o polígono já estava preenchido, preenche de novo 
        if (poligonoObj.isFilled) {
            fillPoly(vertices);
        }
    });
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
            redrawAll();

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

    // Cada vértice recebe uma string em html
    const verticesHTML = poligono.vertices.map((vertice, index) => {
        const x = Math.round(vertice.x);
        const y = Math.round(vertice.y);

        // Pega a cor atual do vértice e a converte para CSS
        const corAtual = rgbToCss(vertice.cor);

        return `
            <li>
                <span 
                    class="color-indicator" 
                    style="background-color: ${rgbToCss(vertice.cor)};"
                    data-poly-index="${numero - 1}" 
                    data-vertex-index="${index}"
                    title="Clique para aplicar a cor selecionada a este vértice"
                ></span>
                Vértice ${index + 1}: (${x}, ${y})
            </li>
        `;}).join(''); // trasnforma o array de strings em uma string 

    // Monta a estrutura HTML interna do item da lista
    listItem.innerHTML = `
        <div 
            class="polygon-header"
            data-poly-select-index="${numero - 1}"
            title="Clique para selecionar este polígono"
        >
            <strong>Polígono ${numero}</strong>
        </div>
        <ul class="vertex-list">
            ${verticesHTML}
        </ul>
    `;
    
    // Adiciona o item completo à lista na página
    polyListView.appendChild(listItem);
}

polyListView.addEventListener('click', function(event) {
    
    // PASSO 1: Descobrir EXATAMENTE qual elemento HTML foi clicado.
    const target = event.target;

    // PASSO 2: Foi uma das nossas "bolinhas de cor"? 
    // (Se não for, não fazemos nada).
    if (target && target.classList.contains('color-indicator')) {
        
        // PASSO 3: Se foi uma bolinha, QUAL delas? 
        // Lemos os "crachás" (data-attributes) para obter os índices.
        const polyIndex = parseInt(target.dataset.polyIndex, 10);
        const vertexIndex = parseInt(target.dataset.vertexIndex, 10);

        // PASSO 4: Qual é a NOVA cor? 
        // Olhamos no seletor de cor principal e a preparamos.
        const novaCorHex = document.getElementById('inputCorVert').value;
        const novaCorRgb = hexToRgb(novaCorHex);

        // PASSO 5: Os dados são válidos? (Medida de segurança).
        if (!isNaN(polyIndex) && !isNaN(vertexIndex) && polyList[polyIndex]) {
            
            // PASSO 6: Agora, a ação principal: ATUALIZAR o dado mestre.
            polyList[polyIndex].vertices[vertexIndex].cor = novaCorRgb;

            // PASSO 7: Dar um feedback visual para o usuário.
            // (Mudamos a cor da bolinha na lista e redesenhamos o canvas).
            target.style.backgroundColor = novaCorHex;
            redrawAll();
        }
    } // checa se um clique foi em um cabeçalho de poligono 
    else if (target && target.closest('.polygon-header')) {
        const header = target.closest('.polygon-header');
        const polyIndex = parseInt(header.dataset.polySelectIndex, 10);

        // Remove a seleção anterior (se houver)
        const allHeaders = document.querySelectorAll('.polygon-header');
        allHeaders.forEach(h => h.classList.remove('selected'));

        // Adiciona a classe 'selected' ao cabeçalho clicado
        header.classList.add('selected');

        // ATUALIZA O ESTADO GLOBAL
        poligonoSelecionado = polyIndex;

        console.log(`Polígono ${poligonoSelecionado + 1} selecionado.`);
    }
});

excluirPoligono.addEventListener('click', function() {
    // 1. Verifica se um polígono está realmente selecionado
    if (poligonoSelecionado === null) {
        alert("Nenhum polígono selecionado. Clique no nome de um polígono na lista para selecioná-lo.");
        return;
    }

    // 2. Remove o polígono do array de dados usando seu índice.
    // array.splice(índice, quantidade) remove elementos do array.
    polyList.splice(poligonoSelecionado, 1);
    
    // 3. Reseta a seleção, pois o polígono não existe mais.
    poligonoSelecionado = null;

    // 4. ATUALIZA TODA A UI:
    // Limpa a lista HTML antiga
    polyListView.innerHTML = '';
    // Recria a lista HTML com os dados atualizados
    // (os índices serão reajustados automaticamente)
    polyList.forEach((poly, index) => {
        addPolyToListView(poly, index + 1);
    });

    // Redesenha o canvas com os polígonos restantes.
    redrawAll();

    console.log("Polígono excluído com sucesso.");
});

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
    const numScanlines = yMax - yMin;
 
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
        
        // MUDANÇA: Calcular o incremento de cor por scanline (dCor/dy)
        const dCor_dy = {
            r: (inferior.cor.r - superior.cor.r) / dy,
            g: (inferior.cor.g - superior.cor.g) / dy,
            b: (inferior.cor.b - superior.cor.b) / dy
        };
        
        // Calcula interseções para cada scanline
        let x = superior.x; // x do menor y
        let y = Math.floor(superior.y);
        const yfim = Math.floor(inferior.y);
        
        // MUDANÇA: Inicializar a cor atual com a cor do vértice superior.
        // É preciso ajustar para o primeiro pixel da scanline, não para o vértice em si.
        const yOffset = y - superior.y;
        let corAtual = {
             r: superior.cor.r + dCor_dy.r * yOffset,
             g: superior.cor.g + dCor_dy.g * yOffset,
             b: superior.cor.b + dCor_dy.b * yOffset
        };
        
        // Para cada scanline entre y e yfim
        while (y < yfim) {
            // Calcula o índice da scanline
            const indScanline = y - yMin;
  
            // Armazena a interseção se estiver dentro dos limites
            if (indScanline >= 0 && indScanline < numScanlines) {
                
                intersecoes[indScanline].push({x: x, cor: {...corAtual} });
            }
            
            // Incrementa a taxa para x para a próxima scanline
            x += Tx;
            // Incrementa y para a próxima scanline
            y++;
            
            // MUDANÇA: Incrementamos a cor para a próxima scanline
            corAtual.r += dCor_dy.r;
            corAtual.g += dCor_dy.g;
            corAtual.b += dCor_dy.b;
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
            if(larguraSegmento <= 0){continue}
            // MUDANÇA: Calcular o incremento de cor por pixel (dCor/dx)
            const dCor_dx = {
                r: (xEnd.cor.r - xStart.cor.r) / larguraSegmento,
                g: (xEnd.cor.g - xStart.cor.g) / larguraSegmento,
                b: (xEnd.cor.b - xStart.cor.b) / larguraSegmento
            };
            
            const xOffset = xInicio - xStart.x;
            let corPixel = {
                r: xStart.cor.r + dCor_dx.r * xOffset,
                g: xStart.cor.g + dCor_dx.g * xOffset,
                b: xStart.cor.b + dCor_dx.b * xOffset
            };
          

            // pinta pixel a pixel
            for (let x = xInicio; x < xFim; x++) {
                
                corPreenchimento = rgbToCss(corPixel);
                drawLine(x, scanline, x + 1, scanline, corPreenchimento);
                
                // MUDANÇA: Incrementar a cor para o próximo pixel
                corPixel.r += dCor_dx.r;
                corPixel.g += dCor_dx.g;
                corPixel.b += dCor_dx.b;
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