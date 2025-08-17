# Algoritmo de Preenchimento de Polígonos (Fillpoly) com Interpolação de Cores

Este é um projeto de computação gráfica desenvolvido em JavaScript, HTML5 e CSS. A aplicação permite que o usuário desenhe polígonos em um canvas, defina cores para cada um de seus vértices e, em seguida, preencha-os usando o algoritmo Fillpoly Scanline. A cor de preenchimento é calculada através de interpolação linear, resultando em um gradiente suave entre as cores dos vértices.


## ✨ Funcionalidades
- Desenho de Polígonos: Crie polígonos complexos clicando diretamente no canvas para adicionar vértices.

- Seleção de Cor por Vértice: Cada vértice pode ter uma cor única, escolhida através de um seletor de cores.

- Preenchimento com Gradiente: Utiliza o algoritmo Fillpoly Scanline para preencher os polígonos. A cor de cada pixel interno é interpolada com base nas cores dos vértices, criando um efeito "degradê".

- Gerenciamento de Polígonos:

    - Uma lista exibe todos os polígonos desenhados.

    - Selecione polígonos clicando em seus nomes na lista.

    - Exclua polígonos selecionados.

- Edição em Tempo Real: Altere a cor de um vértice a qualquer momento através da lista, e o polígono no canvas será atualizado instantaneamente.

- Interface Intuitiva: Controles simples para desenhar, preencher, limpar a tela e excluir polígonos.

## 🚀 Conceitos Implementados

- Algoritmo de Preenchimento Scanline: O núcleo do projeto. O algoritmo funciona varrendo o polígono horizontalmente (linha por linha) para determinar quais pixels estão dentro dele e devem ser coloridos.

- Interpolação Linear de Cores: Usada em duas etapas para alcançar o sombreamento suave.

    - A cor é interpolada verticalmente ao longo das arestas do polígono para encontrar a cor nos pontos de interseção com cada linha de varredura.

    - A cor é então interpolada horizontalmente ao longo da linha de varredura entre os pares de pontos de interseção.

- Biblioteca gráfica: Utilização da API do Canvas para desenhar pontos, linhas (arestas) e preencher os pixels calculados pelo algoritmo.

- Estrutura de Dados: Os polígonos e seus vértices (com coordenadas x, y e cor rgb) são armazenados em arrays de objetos.

## 🕹️ Como Usar

- Desenhar um Polígono:

    - Clique no botão "Desenhar". O botão mudará para "Parar".

    - Use o seletor "Cor do Vértice" para escolher uma cor.

    - Clique no canvas para adicionar o primeiro vértice com a cor selecionada.

    - Mude a cor (se desejar) e clique em outro lugar para adicionar mais vértices. Um polígono precisa de no mínimo 3 vértices.

    - Quando terminar, clique em "Parar" para fechar e salvar o polígono.

- Preencher o(s) Polígono(s):
 
    - Após desenhar um ou mais polígonos, clique no botão "Preencher Polígono". Todos os polígonos na tela serão preenchidos com o gradiente de cores.

- Gerenciar Polígonos na Lista:

    - Selecionar: Clique no nome de um polígono (ex: "Polígono 1") na lista à direita para selecioná-lo. O item ficará destacado.
     
    - Excluir: Selecione um polígono e clique no botão "Excluir Polígono".
     
- Mudar Cor de um Vértice:
     
    - Escolha uma nova cor no seletor "Cor do Vértice".
     
    - Na lista, encontre o polígono e o vértice que deseja alterar.
    
    - Clique na "bolinha" colorida ao lado do vértice. A cor será aplicada imediatamente no canvas e na lista.

- Limpar Tudo:

    - Clique em "Limpar tela" para remover todos os desenhos, polígonos e zerar a lista.

## 📁 Estrutura dos Arquivos

- index.html: Estrutura principal da página, contendo o canvas e os elementos da interface (botões, seletores de cor, lista).

- style.css: Folha de estilos para organizar e dar uma aparência limpa à interface, utilizando Flexbox e estilizando os estados interativos (hover, selected).

- scrpit.js: O cérebro do projeto. Contém toda a lógica para:

    - Capturar eventos de clique no canvas e na interface.

    - Desenhar pontos e linhas.

    - Armazenar a estrutura de dados dos polígonos.

    - Implementar o algoritmo Fillpoly Scanline.

    - Realizar a interpolação de cores.
 
    - Manipular dinamicamente a lista de polígonos no DOM.


## 🛠️ Como Executar Localmente

Este projeto não requer um servidor web ou dependências. Basta abrir o arquivo index.html em qualquer navegador moderno (Chrome, Firefox, Edge, etc.).
