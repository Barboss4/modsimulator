// Variáveis principais de controle do jogo
let score = 0;                 // Pontuação do jogador
let life = 100;                // Vida do streamer
let gameInterval;             // Intervalo principal (não usado no novo sistema, mas pode estar em uso antigo)
let speed = 3000;             // Velocidade de geração de mensagens
let paused = false;           // Estado de pausa do jogo
let dynamicSpawner;           // Intervalo usado para spawn de múltiplas mensagens

// Controla a geração contínua de mensagens com espaçamento entre elas
function startDynamicSpawn() {
  dynamicSpawner = setInterval(() => {
    if (!paused) {
      const spawnCount = Math.min(1 + Math.floor(score / 50), 8); // Aumenta o número de mensagens com o score
      for (let i = 0; i < spawnCount; i++) {
        setTimeout(() => {
          if (!paused) {
            spawnMessage(); // Gera mensagens com 500ms de intervalo entre cada uma
          }
        }, i * 500);
      }
    }
  }, speed);
}

// Esconde todas as seções da interface (menu, jogo, modal)
function hideAllScreens() {
  document.getElementById('menu').classList.add('hidden');
  document.getElementById('game').classList.add('hidden');
  document.getElementById('modal').classList.add('hidden');
  const backBtn = document.getElementById('back-to-menu');
  if (backBtn) backBtn.classList.add('hidden');
}

// Inicia/reinicia o jogo
function startGame() {
  score = 0;
  life = 100;
  speed = 3000;
  paused = false;

  updateScore();
  updateLife();

  hideAllScreens();
  document.getElementById('game').classList.remove('hidden');
  document.getElementById('back-to-menu').classList.remove('hidden');

  startDynamicSpawn();
  decreaseLifeOverTime();
}

// Mostra a história no modal
function showStory() {
    hideAllScreens();
    document.getElementById('modal-content').innerHTML = `
      <p>O Brasil virou a Venezuela.</p>
      <p>Bolsonaro é o moderador de um canal Memezada no YouTube.</p>
      <p>Seu trabalho é proteger o streamer de mensagens tóxicas do Lula e dos comunistas e manter o chat limpo!</p>
      <p>Será que Bolsonaro vai conseguir?</p>
    `;
    document.getElementById('modal').classList.remove('hidden');
  }

// Mostra os créditos no modal
function showCredits() {
    hideAllScreens();
    document.getElementById('modal-content').innerHTML = `
      <p>Criado por RGB, Black&amp;White e mais uns outros 20 inscritos banidos mas que são a mesma pessoa.</p>
      <p>Ban no Desempregado.</p>
    `;
    document.getElementById('modal').classList.remove('hidden');
  }
  

// Fecha modal e volta ao menu
function closeModal() {
  hideAllScreens();
  document.getElementById('menu').classList.remove('hidden');
}

function playRandomPassSound() {
  const audio = document.getElementById("pass-sound");
  const sounds = [
    "sounds/pass_bad1.mp3",
    "sounds/pass_bad2.mp3"
  ];
  const randomIndex = Math.floor(Math.random() * sounds.length);
  audio.src = sounds[randomIndex];
  audio.play();
}

function stopAllSounds() {
  const audios = document.querySelectorAll('audio');
  audios.forEach(audio => {
    audio.pause();
    audio.currentTime = 0;
  });
}

// Cria uma nova mensagem no chat
function spawnMessage() {
  if (paused) return;

  const chat = document.getElementById('chat');
  const tipo = ['boas', 'ruins', 'neutras'][Math.floor(Math.random() * 3)];
  const msg = mensagens[tipo][Math.floor(Math.random() * mensagens[tipo].length)];

  const div = document.createElement('div');
  div.className = 'chat-message';
  div.innerText = msg;
  div.dataset.tipo = tipo;

  // Ao clicar na mensagem
  div.addEventListener('click', () => {
    if (tipo === 'ruins') {
      score += 10;
      life = Math.min(100, life + 5); // ganha vida ao clicar corretamente
      updateLife();
      playSound('success-sound');
      adjustSpeed();
    } else {
      life -= 10;
      updateLife();
      playSound('fail-sound');
    }
    div.remove();
    updateScore();
  });

  chat.appendChild(div);

  // Remove após 6 segundos (se não for clicada)
  setTimeout(() => {
    if (chat.contains(div)) {
      if (tipo === 'ruins') {
        life -= 15; // penalidade por deixar passar mensagem ruim
        const leftChat = document.getElementById('left-chat');
        leftChat.innerText = msg;
        leftChat.classList.add('show'); // aparece com fade-in
        updateLife();
        playRandomPassSound();
  
        // Remove a mensagem após 3 segundos com fade-out
        setTimeout(() => {
          leftChat.classList.remove('show'); // fade-out automático
        }, 3000);
      }
      div.remove();
    }
  }, 6000);
}
// Atualiza a pontuação na HUD
function updateScore() {
  document.getElementById('score').innerText = `Pontuação: ${score}`;
}

// Atualiza a barra de vida e checa fim de jogo
function updateLife() {
  life = Math.max(0, Math.min(100, life));
  document.getElementById('life-bar').style.width = life + '%';
  updateStreamerGif();

  if (life <= 0 && !paused) {
    paused = true; // impede que o jogo continue após o fim
    stopAllSounds();
    playSound('Game-over');
    clearInterval(gameInterval);
    clearInterval(dynamicSpawner);
    updateScore();

    document.getElementById('modal-content').innerText = 'Game Over! Sua pontuação: 0';
    hideAllScreens();
    document.getElementById('modal').classList.remove('hidden');
  }
}

// Diminui vida com o tempo (estilo barra de energia em jogos de ritmo)
function decreaseLifeOverTime() {
  setInterval(() => {
    if (!paused) {
      life -= 0.5;
      updateLife();
    }
  }, 1000);
}

// Aumenta a dificuldade do jogo ao reduzir o tempo entre spawns
function adjustSpeed() {
  if (score % 50 === 0 && speed > 100) {
    speed -= 200;
  }
}

// Reproduz som (positivo ou negativo)
function playSound(id) {
  const audio = document.getElementById(id);
  audio.currentTime = 0;
  audio.play();
}

// Alterna entre pause e play
function togglePause() {
  paused = !paused;
  document.getElementById('pause-btn').innerText = paused ? 'Continuar' : 'Pause';
}

// Atualiza o GIF do streamer com base na vida
function updateStreamerGif() {
  const gif = document.getElementById('streamer-gif');
  if (life > 70) {
    gif.src = 'gifs/batatao_full_health.gif';
  } else if (life > 30) {
    gif.src = 'gifs/batatao_medium_health.gif';
  } else {
    gif.src = 'gifs/batatao_low_health.gif';
  }
}

// Retorna para o menu e reseta o estado do jogo
function returnToMenu() {
  clearInterval(gameInterval);
  clearInterval(dynamicSpawner);
  paused = false;
  updateScore();
  updateLife();
  document.getElementById('chat').innerHTML = '';
  document.getElementById('left-chat').innerHTML = '';
  hideAllScreens();
  document.getElementById('menu').classList.remove('hidden');
}
