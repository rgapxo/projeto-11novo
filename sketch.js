// Variáveis do jogo
var path, boy, leftBoundary, rightBoundary;
var pathImg, boyImg;
var coinImg, bombImg, drinkImg, powerImg;

// Grupos para os itens
var coinGroup, bombGroup, drinkGroup, powerGroup;

// Variáveis de estado e pontuação
var score = 0;
var gameState = "PLAY"; // Pode ser "PLAY" ou "END"
var boySpeed = 12;       // Velocidade padrão do jogo

function preload() {
  // Carregando as imagens originais
  pathImg = loadImage("path.png");
  boyImg = loadAnimation("Runner-1.png", "Runner-2.png");
  
  // Carregando as novas imagens que você mencionou
  coinImg = loadImage("coin.png");
  bombImg = loadImage("bomb.png");
  drinkImg = loadImage("energyDrink.png");
  powerImg = loadImage("power.png");
}

function setup() {
  createCanvas(400, 400);

  // Inicializando os Grupos
  coinGroup = new Group();
  bombGroup = new Group();
  drinkGroup = new Group();
  powerGroup = new Group();

  // Movendo o fundo (Estrada)
  path = createSprite(200, 200);
  path.addImage(pathImg);
  path.scale = 1.2;

  // Criando o menino corredor
  boy = createSprite(180, 340, 30, 30);
  boy.scale = 0.08;
  boy.addAnimation("JakeRunning", boyImg);

  // Criando a barreira esquerda invisível
  leftBoundary = createSprite(0, 0, 100, 800);
  leftBoundary.visible = false;

  // Criando a barreira direita invisível
  rightBoundary = createSprite(410, 0, 100, 800);
  rightBoundary.visible = false;
}

function draw() {
  background(0);

  if (gameState === "PLAY") {
    // 1. Movimento de fundo baseado na velocidade atual
    path.velocityY = boySpeed;

    // 2. Movimento do menino segue o mouse (limitado pelas barreiras)
    boy.x = World.mouseX;
    boy.collide(leftBoundary);
    boy.collide(rightBoundary);

    // 3. Reinício infinito da estrada
    if (path.y > 350) {
      path.y = height / 2;
    }

    // 4. Gerador de itens aleatórios (baseado em tempo/frames)
    if (frameCount % 30 === 0) {
      spawnItems();
    }

    // 5. Lógica de colisões com os itens
    // Se pegar moeda: ganha pontos
    boy.isTouching(coinGroup, function(player, item) {
      item.destroy();
      score += 10;
    });

    // Se pegar energético: aumenta velocidade do jogo temporariamente
    boy.isTouching(drinkGroup, function(player, item) {
      item.destroy();
      boySpeed = 8; 
      // Volta à velocidade normal após 3 segundos (180 frames)
      setTimeout(function() { boySpeed = 20; }, 5000); 
    });

    // Se pegar o poder: ganha muitos pontos bônus de uma vez
    boy.isTouching(powerGroup, function(player, item) {
      item.destroy();
      score += 50;
    });

    // Se bater na bomba: Fim de Jogo!
    if (boy.isTouching(bombGroup)) {
      gameState = "END";
    }

  } else if (gameState === "END") {
    // Parar todos os movimentos quando o jogo terminar
    path.velocityY = 0;
    boy.velocityY = 0;
    
    coinGroup.setVelocityYEach(0);
    bombGroup.setVelocityYEach(0);
    drinkGroup.setVelocityYEach(0);
    powerGroup.setVelocityYEach(0);
    
    // Define tempo de vida como -1 para que não sumam, apenas congelem
    coinGroup.setLifetimeEach(-1);
    bombGroup.setLifetimeEach(-1);
    drinkGroup.setLifetimeEach(-1);
    powerGroup.setLifetimeEach(-1);
  }

  // Desenha todos os Sprites na tela
  drawSprites();

  // Exibe a pontuação na tela
  fill("white");
  textSize(20);
  text("Pontos: " + score, 60, 30);

  // Exibe mensagem de Game Over se o jogador perder
  if (gameState === "END") {
    fill("red");
    textSize(40);
    textAlign(CENTER);
    text("GAME OVER", 200, 200);
    fill("white");
    textSize(15);
    text("Recarregue a página para jogar de novo", 200, 240);
  }
}

// Função para gerar os itens de forma aleatória na pista
function spawnItems() {
  // Escolhe uma posição X aleatória dentro dos limites das barreiras
  var randomX = random(70, 330);
  var item = createSprite(randomX, -10, 20, 20);
  item.velocityY = boySpeed; // Desce na mesma velocidade da pista
  item.lifetime = 150;       // Evita sobrecarregar a memória do jogo
  
  // Sorteia qual item vai aparecer (Número entre 0 e 100)
  var r = random(0, 100);
  
  if (r < 50) {
    // 50% de chance de ser uma Moeda
    item.addImage(coinImg);
    item.scale = 0.05;
    coinGroup.add(item);
  } else if (r < 80) {
    // 30% de chance de ser uma Bomba
    item.addImage(bombImg);
    item.scale = 0.07;
    bombGroup.add(item);
  } else if (r < 90) {
    // 10% de chance de ser um Energético
    item.addImage(drinkImg);
    item.scale = 0.05;
    drinkGroup.add(item);
  } else {
    // 10% de chance de ser o Poder Especial
    item.addImage(powerImg);
    item.scale = 0.06;
    powerGroup.add(item);
  }
}