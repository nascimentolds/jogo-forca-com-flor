let palavras = [];

AOS.init({
  duration: 800,
  once: false
});

// Estado do jogo
let palavraSecreta = "";
let dica = "";
let letrasCertas = [];
let erros = 0;

// Seletores globais
const petalas = document.querySelectorAll('.petala');
const maxErros = petalas.length;

const dicaEl = document.getElementById("dica");
const palavraEl = document.getElementById("palavra");
const tecladoEl = document.getElementById("teclado");

const opcao1Jogador = document.getElementById("opcao-1Jogador");
const opcao2Jogadores = document.getElementById("opcao-2Jogadores");
const reiniciar = document.querySelectorAll(".reiniciar");

// Eventos globais
opcao1Jogador?.addEventListener("click", () => {
  window.location = 'jogo.html';
});

opcao2Jogadores?.addEventListener("click", () => {
  window.location = 'jogador.html';
});

reiniciar.forEach(botao => {
  botao.addEventListener("click", () => {
    window.location = 'index.html';
  });
});

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("jogo-container")) {
    fetch('../data/palavras.json')
      .then(res => res.json())
      .then(data => {
        palavras = data;
        iniciarJogo();
      })
      .catch(error => {
        console.error("Erro ao carregar o arquivo JSON:", error);
      });
  }

  const flor = document.querySelector(".flor");
  if (flor) {
    setTimeout(() => {
      flor.classList.add("aparecer");
    }, 100); // leve atraso para forçar o transition
  }

  const botaoJogar = document.querySelector(".opcoes-jogador .btn");
  const palavraInput = document.getElementById("palavra-jogador");
  const dicaInput = document.getElementById("dica-jogador");
  const alerta = document.querySelector(".alerta");

  if (botaoJogar && palavraInput && dicaInput) {
    botaoJogar.addEventListener("click", () => {
      const palavra = palavraInput.value.trim();
      const dica = dicaInput.value.trim();

      if (palavra && dica) {
        sessionStorage.setItem("palavra", palavra);
        sessionStorage.setItem("dica", dica);
        window.location = "jogo.html";
      } else {
        alerta.textContent = "Digite uma palavra e uma dica.";
      }
    });

    [palavraInput, dicaInput].forEach(input => {
      input.addEventListener("keyup", (e) => {
        if (e.key === "Enter") {
          botaoJogar.click();
        }
      });
    });
  }
});

// Funções principais
function iniciarJogo() {
  // Evita erro se os elementos não estiverem presentes
  if (!dicaEl || !palavraEl || !tecladoEl) return;

  erros = 0;
  letrasCertas = [];

  if (sessionStorage.getItem("palavra")) {
    palavraSecreta = sessionStorage.getItem("palavra");
    dica = sessionStorage.getItem("dica");
    sessionStorage.removeItem("palavra");
    sessionStorage.removeItem("dica");
  } else {
    escolherPalavra();
  }

  atualizarDica();
  gerarTeclado();
  atualizarPalavraExibida();
  resetarPetalas();
}

function escolherPalavra() {
  const sorteada = palavras[Math.floor(Math.random() * palavras.length)];
  palavraSecreta = sorteada.palavra;
  dica = sorteada.dica;
}

function atualizarDica() {
  if (dicaEl) {
    dicaEl.textContent = `Dica: ${dica}`;
  }
}

function gerarTeclado() {
  if (!tecladoEl) return;

  tecladoEl.innerHTML = "";

  "abcdefghijklmnopqrstuvwxyz".split("").forEach(letra => {
    const botao = document.createElement("button");
    botao.textContent = letra;
    botao.classList.add("tecla");

    botao.addEventListener("click", () => verificarLetra(letra, botao));
    tecladoEl.appendChild(botao);
  });
}

function verificarLetra(letra, btn) {
  btn.disabled = true;

  const acertou = palavraContemLetra(letra);
  btn.style.color = "white";
  btn.style.backgroundColor = acertou ? "#81C545" : "#EB343E";

  if (acertou) {
    letrasCertas.push(letra);
  } else {
    removerPetala();
    erros++;
  }

  atualizarPalavraExibida();
  verificarFimDeJogo();
}

function palavraContemLetra(letra) {
  const letraNormalizada = removerAcentos(letra.toLowerCase());

  return palavraSecreta
    .toLowerCase()
    .split("")
    .some(l => removerAcentos(l) === letraNormalizada);
}

function atualizarPalavraExibida() {
  if (!palavraEl) return;

  const exibida = palavraSecreta.split("").map(letra => {
    const letraNormalizada = removerAcentos(letra.toLowerCase());
    const acertou = letrasCertas.some(l => removerAcentos(l.toLowerCase()) === letraNormalizada);
    return acertou ? letra : "_";
  }).join(" ");

  palavraEl.textContent = exibida;
}

function verificarFimDeJogo() {
  if (!palavraEl) return;

  const exibida = palavraEl.textContent;

  const vitoria = document.querySelector(".vitoria");
  const derrota = document.querySelector(".derrota");
  const palavraVitoria = document.querySelector(".pal-vitoria");
  const palavraDerrota = document.querySelector(".pal-derrota");

  if (!exibida.includes("_")) {
    setTimeout(() => {
      if (palavraVitoria && vitoria) {
        palavraVitoria.textContent = palavraSecreta;

        // Remove "oculto" e aplica fade/zoom
        vitoria.classList.remove("oculto");

        // Pequeno delay para garantir que a transição ocorra
        setTimeout(() => {
          vitoria.classList.add("ativa");
        }, 10);
      }
    }, 100);
  } else if (erros >= maxErros) {
    setTimeout(() => {
      if (palavraDerrota && derrota) {
        palavraDerrota.textContent = palavraSecreta;
        derrota.classList.remove("oculto");
        setTimeout(() => {
          derrota.classList.add("ativa");
        }, 10);
      }
    }, 100);
  }
}

// Utilitários
function removerPetala() {
  if (erros < petalas.length) {
    petalas[erros].classList.add("removida");
  }
}

function resetarPetalas() {
  petalas.forEach(petala => petala.classList.remove("removida"));
}

function removerAcentos(texto) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
