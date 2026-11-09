// Baseado em "Código java script 23 07.txt", com correções marcadas como CORREÇÃO.

//variáveis da bolinha
let xBolinha = 300;
let yBolinha = 200;
let diametro = 16;
let raio = diametro / 2;

//velocidade da bolinha
let velocidadeXBolinha = 6;
let velocidadeYBolinha = 6;

//variáveis da raquete
let xRaquete = 5;
let yRaquete = 150;
let raqueteComprimento = 10;
let raqueteAltura = 90;

//variáveis do oponente
let xRaqueteOponente = 585;
let yRaqueteOponente = 150;
let velocidadeYOponente;

let colidiu = false;

// "erro" do oponente: ele mira um ponto um pouco deslocado do centro da
// bolinha e tem velocidade máxima, então às vezes não alcança
let velocidadeMaximaOponente = 5;
let erroDoOponente = 0;

//sons do jogo (Audio do HTML funciona abrindo o index.html direto, sem servidor)
let trilha = new Audio("trilha.mp3");
let somRaquetada = new Audio("colidiu.mp3");
let somPonto = new Audio("pontos.wav");
trilha.loop = true;
trilha.volume = 0.4;

// o navegador só deixa tocar som depois que o jogador interage com a página
let jogoComecou = false;

function tocar(som) {
  som.currentTime = 0;
  som.play().catch(() => {});
}

//placar do jogo
// CORREÇÃO: os placares começavam como undefined (aparecia "NaN" ao somar)
let meusPontos = 0;
let pontosDoOponente = 0;

function setup() {
  createCanvas(600, 400);
}

function comecarJogo() {
  if (!jogoComecou) {
    jogoComecou = true;
    trilha.play().catch(() => {});
  }
}

function keyPressed() {
  comecarJogo();
}

function mousePressed() {
  comecarJogo();
}

function telaInicial() {
  background(51);
  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(28);
  text("PONG", width / 2, height / 2 - 40);
  textSize(16);
  text("Use as setas ↑ e ↓ para mover a raquete", width / 2, height / 2 + 5);
  text("Pressione qualquer tecla ou clique para começar", width / 2, height / 2 + 35);
}

function draw() {
  if (!jogoComecou) {
    telaInicial();
    return;
  }
  background(51);
  mostraBolinha();
  movimentaBolinha();
  verificaColisaoBorda();
  mostraRaquete(xRaquete, yRaquete);
  movimentaMinhaRaquete();
  mostraRaquete(xRaqueteOponente, yRaqueteOponente);
  movimentaRaqueteOponente();
  verificaColisaoRaquete(xRaquete, yRaquete);
  verificaColisaoRaquete(xRaqueteOponente, yRaqueteOponente);
  incluiPlacar();
  // CORREÇÃO: faltavam os parênteses, então a função nunca era chamada
  marcarPontos();
}

function mostraBolinha() {
  circle(xBolinha, yBolinha, diametro);
}

function movimentaBolinha() {
  xBolinha += velocidadeXBolinha;
  yBolinha += velocidadeYBolinha;
}

function verificaColisaoBorda() {
  // (bordas esquerda/direita agora são tratadas em marcarPontos)
  if (yBolinha + raio > height || yBolinha - raio < 0) {
    velocidadeYBolinha *= -1;
  }
}

function mostraRaquete(x, y) {
  rect(x, y, raqueteComprimento, raqueteAltura);
}

function movimentaMinhaRaquete() {
  if (keyIsDown(UP_ARROW)) {
    yRaquete -= 10;
  }
  if (keyIsDown(DOWN_ARROW)) {
    yRaquete += 10;
  }
  // impede a raquete de sair da tela
  yRaquete = constrain(yRaquete, 0, height - raqueteAltura);
}

function movimentaRaqueteOponente() {
  // CORREÇÃO: antes o oponente "teleportava" para a bolinha e nunca errava.
  // Agora ele mira o centro da raquete na bolinha (+ um erro aleatório)
  // e anda no máximo "velocidadeMaximaOponente" pixels por frame.
  let alvo = yBolinha - raqueteAltura / 2 + erroDoOponente;
  velocidadeYOponente = constrain(alvo - yRaqueteOponente, -velocidadeMaximaOponente, velocidadeMaximaOponente);
  yRaqueteOponente += velocidadeYOponente;
  yRaqueteOponente = constrain(yRaqueteOponente, 0, height - raqueteAltura);
}

function sorteiaErroDoOponente() {
  erroDoOponente = random(-50, 50);
}

// CORREÇÃO: havia duas funções com o mesmo nome "verificaColisaoRaquete";
// a primeira era sobrescrita pela segunda, então foi removida.
function verificaColisaoRaquete(x, y) {
  // CORREÇÃO: o último parâmetro de collideRectCircle é o DIÂMETRO, não o raio
  colidiu = collideRectCircle(x, y, raqueteComprimento, raqueteAltura, xBolinha, yBolinha, diametro);
  // CORREÇÃO: só inverte se a bolinha estiver indo em direção à raquete,
  // senão ela "gruda" e treme dentro da raquete
  let indoParaEsquerda = velocidadeXBolinha < 0;
  let raqueteDaEsquerda = x < width / 2;
  if (colidiu && indoParaEsquerda === raqueteDaEsquerda) {
    velocidadeXBolinha *= -1;
    tocar(somRaquetada);
    sorteiaErroDoOponente();
  }
}

function incluiPlacar() {
  stroke(255);
  textAlign(CENTER);
  textSize(16);
  fill(color(255, 140, 0));
  rect(150, 10, 40, 20);
  fill(255);
  text(meusPontos, 170, 26);
  fill(color(255, 140, 0));
  rect(450, 10, 40, 20);
  fill(255);
  text(pontosDoOponente, 470, 26);
}

function marcarPontos() {
  // CORREÇÃO: "PontosDoOponente" estava com P maiúsculo (variável inexistente),
  // e "xBolinha < -10" nunca acontecia porque a bolinha quica na borda antes.
  // Agora o ponto é contado no exato frame em que a bolinha toca a parede
  // (a inversão de direção fica aqui também, para contar só 1 vez por batida).
  if (xBolinha + raio > width && velocidadeXBolinha > 0) {
    meusPontos += 1;
    tocar(somPonto);
    velocidadeXBolinha *= -1;
    sorteiaErroDoOponente();
  }
  if (xBolinha - raio < 0 && velocidadeXBolinha < 0) {
    pontosDoOponente += 1;
    tocar(somPonto);
    velocidadeXBolinha *= -1;
    sorteiaErroDoOponente();
  }
}
