const apiUsuarios = "https://jsonplaceholder.typicode.com/users";
const apiPosts = "https://jsonplaceholder.typicode.com/posts";


let usuarios = [];
let posts = [];
let novoIdPost = 1;

const formPost      = document.getElementById("formPost");
const idPost        = document.getElementById("idPost");
const tituloPost    = document.getElementById("tituloPost");
const textoPost     = document.getElementById("textoPost");
const autorPost     = document.getElementById("autorPost");
const btnPost       = document.getElementById("btnPost");
const cancelarPost  = document.getElementById("cancelarPost");
const listaPosts    = document.getElementById("listaPosts");
const listaUsuarios = document.getElementById("listaUsuarios");
const totalUsuarios = document.getElementById("totalUsuarios");
const totalPosts    = document.getElementById("totalPosts");
const mensagem      = document.getElementById("mensagem");

formPost.addEventListener("submit", salvarPost);
cancelarPost.addEventListener("click", limparPost);

carregarDados();

async function carregarDados() {
  mostrarAviso("Carregando...");
  try {
    const [resU, resP] = await Promise.all([fetch(apiUsuarios), fetch(apiPosts)]);
    if (!resU.ok || !resP.ok) throw new Error("Falha ao consultar a API");

    const dadosU = await resU.json();
    const dadosP = await resP.json();

    usuarios = dadosU.map(function(u) {
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        city: u.address?.city || "Sem cidade"
      };
    });

    posts = dadosP.slice(0, 10).map(function(p) {
      return {
        id: p.id,
        userId: p.userId,
        title: primeiraLetraMaiuscula(p.title),
        body: primeiraLetraMaiuscula(p.body)
      };
    });

    prepararIdPost();
    atualizarTela();
    mostrarAviso("Atualizado.");
  } catch {
    mostrarAviso("Não foi possível carregar os dados. Tente recarregar a página.", true);
  }
}

function atualizarTela() {
  mostrarUsuarios();
  mostrarAutores();
  mostrarPosts();
  totalUsuarios.textContent = usuarios.length;
  totalPosts.textContent = posts.length;
}

function mostrarUsuarios() {
  listaUsuarios.textContent = "";
  if (usuarios.length === 0) {
    listaUsuarios.appendChild(criarVazio("Sem autores."));
    return;
  }
  usuarios.forEach(function(u) {
    const card = criarCard(u.name, "card", imagemUsuario(u.id), "Foto de " + u.name);
    card.append(criarElemento("p", "info", u.city), criarElemento("p", "", u.email));
    listaUsuarios.appendChild(card);
  });
}

function mostrarAutores() {
  autorPost.textContent = "";
  if (usuarios.length === 0) {
    const opt = criarElemento("option", "", "Sem autores");
    opt.value = "";
    autorPost.appendChild(opt);
    autorPost.disabled = true;
    btnPost.disabled = true;
    return;
  }
  usuarios.forEach(function(u) {
    const opt = criarElemento("option", "", u.name);
    opt.value = u.id;
    autorPost.appendChild(opt);
  });
  autorPost.disabled = false;
  btnPost.disabled = false;
}

function mostrarPosts() {
  listaPosts.textContent = "";
  if (posts.length === 0) {
    listaPosts.appendChild(criarVazio("Sem posts."));
    return;
  }
  posts.forEach(function(post) {
    const autor = pegarUsuario(post.userId);
    const nomeAutor = autor ? autor.name : "Autor";
    const card = criarCard(post.title, "card", imagemPost(post.id), "Imagem do post " + post.id);
    const acoes = criarElemento("div", "acoes-card");
    acoes.append(
      criarBotao("Editar",  "botao-editar",  function() { editarPost(post.id); }),
      criarBotao("Remover", "botao-remover", function() { removerPost(post.id); })
    );
    card.append(criarElemento("p", "info", nomeAutor), criarElemento("p", "", post.body), acoes);
    listaPosts.appendChild(card);
  });
}

function salvarPost(evento) {
  evento.preventDefault();
  const dados = {
    title:  tituloPost.value.trim(),
    body:   textoPost.value.trim(),
    userId: Number(autorPost.value)
  };
  if (!dados.title || !dados.body || !dados.userId) {
    mostrarAviso("Preencha os campos.", true);
    return;
  }
  if (idPost.value === "") {
    posts.unshift({ id: novoIdPost++, ...dados });
    mostrarAviso("Post adicionado.");
  } else {
    const post = pegarPost(idPost.value);
    if (!post) { mostrarAviso("Post não encontrado.", true); return; }
    post.title  = dados.title;
    post.body   = dados.body;
    post.userId = dados.userId;
    mostrarAviso("Post salvo.");
  }
  limparPost();
  atualizarTela();
}

function editarPost(id) {
  const post = pegarPost(id);
  if (!post) { mostrarAviso("Post não encontrado.", true); return; }
  idPost.value       = post.id;
  tituloPost.value   = post.title;
  textoPost.value    = post.body;
  autorPost.value    = post.userId;
  btnPost.textContent = "Salvar";
  cancelarPost.hidden = false;
  tituloPost.focus();
}

function removerPost(id) {
  if (!confirm("Remover este post?")) return;
  posts = posts.filter(function(p) { return p.id !== Number(id); });
  limparPost();
  atualizarTela();
  mostrarAviso("Post removido.");
}

function limparPost() {
  formPost.reset();
  idPost.value = "";
  btnPost.textContent = "Adicionar";
  cancelarPost.hidden = true;
}

function pegarUsuario(id) {
  return usuarios.find(function(u) { return u.id === Number(id); });
}

function pegarPost(id) {
  return posts.find(function(p) { return p.id === Number(id); });
}

function criarCard(titulo, classe, imagemSrc, imagemAlt) {
  const card = criarElemento("article", classe || "card");
  if (imagemSrc) {
    card.appendChild(criarImagem(imagemSrc, imagemAlt || ""));
  }
  card.appendChild(criarElemento("h3", "", titulo));
  return card;
}

function criarBotao(texto, classe, acao) {
  const botao = criarElemento("button", classe);
  botao.type = "button";
  botao.textContent = texto;
  botao.addEventListener("click", acao);
  return botao;
}

function criarElemento(tag, classe, texto) {
  const el = document.createElement(tag);
  if (classe) el.className = classe;
  if (texto)  el.textContent = texto;
  return el;
}

function criarVazio(texto) {
  return criarElemento("p", "vazio", texto);
}

function criarImagem(src, alt) {
  const img = document.createElement("img");
  img.src = src;
  img.alt = alt;
  img.loading = "lazy";
  return img;
}

function imagemPost(id) {
  return "https://picsum.photos/seed/mural-post-" + id + "/900/620";
}

function imagemUsuario(id) {
  return "https://picsum.photos/seed/mural-user-" + id + "/120/120";
}

function prepararIdPost() {
  if (posts.length === 0) {
    novoIdPost = 1;
  } else {
    novoIdPost = Math.max(...posts.map(function(p) { return p.id; })) + 1;
  }
}

function mostrarAviso(texto, erro) {
  mensagem.textContent = texto;
  mensagem.classList.toggle("erro", Boolean(erro));
}

function primeiraLetraMaiuscula(texto) {
  if (!texto) return "";
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}