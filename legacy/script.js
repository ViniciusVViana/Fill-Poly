///// OBJETOS /////

let canvas = document.getElementById('tela');
let ctx = canvas.getContext('2d');
let inputBorda = document.getElementById('inputBorda');
let inputCorPree = document.getElementById('inputPree');
let lista = document.getElementById('listaPoligonos');

///// DECLARAÇÃO DE VARIÁVEIS IMPORTANTES /////

let corA;
let corB = "#FFFF00";
let pintar_borda = false;
let list_poligono = [];
let list_vertices = [];
let list_arestas = [];
let desenhar = true;
let index_poligono;

///// DECLARAÇÕES DAS FUNÇÕES /////

function coefM(x1, y1, x2, y2){
    return (x2 - x1)/(y2 - y1);
}

///// FUNÇÃO QUE CALCULA AS INTERSEÇÕES DE CADA ARESTA /////

function intersec(list_arest){
    let list_intersec = [];
    let list_intersecAux = [];
    let aux = [];
    let xa = list_arest[i][0].x;
    // calcular as interseções de cada aresta de forma incremental
    for(let i = 0; i < list_arest.length; i++){
        // verificar se a aresta é horizontal
        if(list_arest[i][0].y == list_arest[i][1].y){
            // se for, adicionar o ponto de interseção na lista de interseções
            list_intersecAux.push({x: list_arest[i][0].x, y: list_arest[i][0].y});
        }else{
            // se não for, calcular a interseção da aresta com a linha horizontal
            // percorrer a aresta de forma incremental
            for(let j = list_arest[i][0].y; j < list_arest[i][1].y; j++){
                // calcular o ponto de interseção
                xa =  xa + coefM(list_arest[i][0].x, list_arest[i][0].y, list_arest[i][1].x, list_arest[i][1].y);
                // xa = xa + valor de incremento ----- CORREÇÃO DE ERRO
                // adicionar o ponto de interseção na lista de interseções
                list_intersecAux.push({x: xa, y: j});
            }
        }
    }

    // organizar a lista de interseções referente ao eixo Y
    list_intersecAux.sort(function(a, b){
        return a.y - b.y;
    });

    // separar cada valor de y em uma lista, limitando a comparação apenas nas casas decimais
    for(let i = 0; i < list_intersecAux.length; i++){
        if(i == 0){
            aux.push(list_intersecAux[i]);
        }else if(Math.trunc(list_intersecAux[i].y) != Math.trunc(list_intersecAux[i-1].y)){
            list_intersec.push(aux.sort(function(a, b){return a.x - b.x;}));
            aux = [];
            aux.push(list_intersecAux[i]);
        }else{
            aux.push(list_intersecAux[i]);
        }
    }

    return list_intersec;
}

///// DESENHA OS PONTOS /////

function drawPoint(x, y) {
    ctx.strokeStyle = corB;
    ctx.beginPath();
    ctx.arc(x, y, 1, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
}

///// DESENHA AS ARESTAS /////

function drawLine(x1, y1, x2, y2, cor) {
    if(pintar_borda){
        for(let i = 0; i < 3; i++){
            ctx.strokeStyle = cor;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
    }
}

///// FUNÇÃO QUE VERIFICA SE O PONTO SELECIONADO JA EXISTE E ENTAO ADICIONA NA LISTA DE VERTICES /////

function addPoint(x, y, e) {
    if (!pointExists(x, y)) {
        list_vertices.push({ x: x, y: y });
        drawPoint(x, y);
    } else {
        /* console.log(`Ponto em (${x}, ${y}) já existe e não será adicionado novamente.`); */
        e.stopPropagation();
        e.preventDefault();
    }
}

function pointExists(x, y) {
    // Ignora o primeiro elemento do array ao usar some
    return list_vertices.slice(1).some(vertex => Math.abs(vertex.x - x) < 2 && Math.abs(vertex.y - y) < 2);
}

///// FUNÇÃO QUE CALCULA O NUMERO DE SCANLINES DE CADA POLIGINO /////

function calcNs(list_vert){
    let Maxy = 0, MinY = 1000;
    for(let i = 0; i < list_vert.length; i++){
        if(list_vert[i].y > Maxy){
            Maxy = list_vert[i].y;
        }
        if(list_vert[i].y < MinY){
            MinY = list_vert[i].y;
        }
    }
    return Maxy - MinY;
}

///// CRIAR OS ELEMENTOS DA LISTA DE POLIGONOS /////

function createElement(valor = list_poligono.length-1){
    let li = document.createElement('li');
    li.className = 'list-group-item';
    li.textContent = `Poligono ${valor+1}`;
    li.value = valor;
    li.addEventListener('click', function(){
        index_poligono = li.value
        /* console.log(index_poligono); */
    });
    lista.appendChild(li);
}

///// EVENTLISTENER DO NOSSO CANVAS /////

canvas.addEventListener('click', function(e) {
    let rect = canvas.getBoundingClientRect();
    
    let esc_x = canvas.width / rect.width;
    let esc_y = canvas.height / rect.height;

    let x = (e.clientX - rect.left) * esc_x;
    let y = (e.clientY - rect.top) * esc_y;
    
    // verificando se o vertice nao existe na lista de vertices

    addPoint(x, y);
    
    /* console.log(list_vertices); */

    // a cada dois pontos selecionados, adiciona as coordenadas dos pontos na lista de arestas
    if (list_vertices.length > 1) {
        list_arestas.push([list_vertices[list_vertices.length - 2], list_vertices[list_vertices.length - 1]]);
        // garantir que o ponto inicial de cada aresta esta mais proximo possivel da origem, tanto no eixo x quanto no eixo y
        if(list_arestas[list_arestas.length - 1][0].x > list_arestas[list_arestas.length - 1][1].x && list_arestas[list_arestas.length - 1][0].y > list_arestas[list_arestas.length - 1][1].y){
            aux = list_arestas[list_arestas.length - 1][0];
            list_arestas[list_arestas.length - 1][0] = list_arestas[list_arestas.length - 1][1];
            list_arestas[list_arestas.length - 1][1] = aux;    
        }else if(list_arestas[list_arestas.length - 1][0].y > list_arestas[list_arestas.length - 1][1].y && list_arestas[list_arestas.length - 1][0].x < list_arestas[list_arestas.length - 1][1].x){
                aux = list_arestas[list_arestas.length - 1][0];
                list_arestas[list_arestas.length - 1][0] = list_arestas[list_arestas.length - 1][1];
                list_arestas[list_arestas.length - 1][1] = aux;
        }
        
    }

    /* console.log(list_arestas); */

    // se o poligono for fechado, desenha a ultima aresta
    if(list_vertices.length > 2 && ((Math.abs(list_vertices[0].x - x)) < 3 && (Math.abs(list_vertices[0].y - y)) < 3)){
        drawLine(list_vertices[list_vertices.length - 2].x, list_vertices[list_vertices.length - 2].y, list_vertices[0].x, list_vertices[0].y, corB);
        list_vertices.pop();////////////////////////
        //ns = calcNs(list_vertices);
        list_poligono.push({poligono: list_arestas, ns: calcNs(list_vertices), LI: intersec(list_arestas), corBorda: corB, corPreenchimento: corA});
        createElement();
        list_vertices = [];
        list_arestas = [];
        console.log(list_poligono);
        altDraw();
    }else if(list_vertices.length > 1){
        drawLine(list_vertices[list_vertices.length - 2].x, list_vertices[list_vertices.length - 2].y, x, y);
    }

});
///// FUNÇÃO DE LIMPAR A TELA /////

function limpaTela() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    list_vertices = [];
    list_poligono = [];
    list_arestas = [];
    lista.querySelectorAll('*').forEach(n => n.remove());
    /* console.log(list_poligono); */
    /* console.log(list_vertices); */
    /* console.log(list_arestas); */
}

document.getElementById('clearButton').addEventListener('click', limpaTela);

///// FUNÇÃO DE ATIVAR E DESATIVAR DESENHO /////

document.getElementById('desenharBtn').addEventListener('click', altDraw);

function altDraw(){
    if(desenhar){
        canvas.style.pointerEvents = 'auto';
        desenharBtn.textContent = 'Parar de desenhar';
        desenhar = false;
    }else if(!desenhar){
        canvas.style.pointerEvents = 'none';
        desenharBtn.textContent = 'Desenhar';
        desenhar = true;
    }
}

///// FUNÇÃO QUE RECEBE AS CORES DESEJADAS /////

inputBorda.addEventListener('input', function() {
    if(pintar_borda){
        pintar_borda = false;
    }else{
        pintar_borda = true;
    }
});

inputCorPree.addEventListener('input', function() {
    corA = inputCorPree.value; // Armazena a cor selecionada na letiável 'corA'
    if(list_poligono.length > 0){
        list_poligono[index_poligono].corPreenchimento = corA;
    }
});

///// FUNÇÃO DO BOTAO DE PREENCHER O POLIGONO /////

document.getElementById('preencherPoligono').addEventListener('click', function() {
    if(index_poligono == undefined){
        alert('Selecione um poligono');
    }else{
        pintar_borda = true;
        fillPoly(list_poligono);
        pintar_borda = false;
    }
});

function fillPoly(poligono){
    // preencher o poligono
    for(let i = 0; i < poligono[index_poligono].ns; i++){
        for(let j = 0; j < poligono[index_poligono].LI[i].length; j=j+2){
            if((poligono[index_poligono].LI[i].length % 2) == 0){
                drawLine(poligono[index_poligono].LI[i][j].x, poligono[index_poligono].LI[i][j].y, poligono[index_poligono].LI[i][j+1].x, poligono[index_poligono].LI[i][j+1].y, poligono[index_poligono].corPreenchimento);
            }else{
                if(j == 0){
                    drawLine(poligono[index_poligono].LI[i][j].x, poligono[index_poligono].LI[i][j].y, poligono[index_poligono].LI[i][j].x, poligono[index_poligono].LI[i][j].y, poligono[index_poligono].corPreenchimento);
                }else{
                    drawLine(poligono[index_poligono].LI[i][j].x, poligono[index_poligono].LI[i][j].y, poligono[index_poligono].LI[i][j].x, poligono[index_poligono].LI[i][j].y, poligono[index_poligono].corPreenchimento);
                };
            };
        };
    };
}

///// FUNÇÃO DE REMOVER POLIGONO SELECIONADO /////

// função que remova apenas o poligono selecionado
document.getElementById('deletarPoligono').addEventListener('click', function(){
    if(index_poligono == undefined){
        alert('Selecione um poligono');
    }else{
        list_poligono.splice(index_poligono, 1);
        lista.querySelectorAll('*').forEach(n => n.remove());
        console.log(list_poligono);
        for(let i = 0; i < list_poligono.length; i++){
            createElement(i);
        }
        /* console.log(list_poligono); */
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for(let i = 0; i < list_poligono.length; i++){
            for(let j = 0; j < list_poligono[i].poligono.length; j++){
                drawLine(list_poligono[i].poligono[j][0].x, list_poligono[i].poligono[j][0].y, list_poligono[i].poligono[j][1].x, list_poligono[i].poligono[j][1].y, list_poligono[i].corBorda);
                console.log("pinto");
            }
            for(let j = 0; j < list_poligono[i].ns; j++){
                for(let k = 0; k < list_poligono[i].LI[j].length; k=k+2){
                    if((list_poligono[i].LI[j].length % 2) == 0){
                        drawLine(list_poligono[i].LI[j][k].x, list_poligono[i].LI[j][k].y, list_poligono[i].LI[j][k+1].x, list_poligono[i].LI[j][k+1].y, list_poligono[i].corPreenchimento);
                    }else{
                        if(k == 0){
                            drawLine(list_poligono[i].LI[j][k].x, list_poligono[i].LI[j][k].y, list_poligono[i].LI[j][k+1].x, list_poligono[i].LI[j][k+1].y, list_poligono[i].corPreenchimento);
                        }else{
                            drawLine(list_poligono[i].LI[j][k].x, list_poligono[i].LI[j][k].y, list_poligono[i].LI[j][k].x, list_poligono[i].LI[j][k].y, list_poligono[i].corPreenchimento);
                        };
                    };
                };
            }
        }
        /* console.log("chegou aqui"); */
    }
});