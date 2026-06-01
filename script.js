const apiUsuarios = "https://jsonplaceholder.typicode.com/users";
const apiPosts = "https://jsonplaceholder.typicode.com/posts";

const usuariosExemplo = [
  { id: 1, name: "Ana Ribeiro", email: "ana.ribeiro@email.com", city: "São Paulo" },
  { id: 2, name: "Carlos Lima", email: "carlos.lima@email.com", city: "Curitiba" },
  { id: 3, name: "Marina Costa", email: "marina.costa@email.com", city: "Recife" }
];

const postsExemplo = [
  {
    id: 1,
    userId: 1,
    title: "Slides da apresentação",
    body: "Já deixei os slides revisados. Quem for apresentar pode conferir antes da aula."
  },
  {
    id: 2,
    userId: 2,
    title: "Grupo de estudo",
    body: "Vamos revisar JavaScript na quinta, depois do intervalo."
  },
  {
    id: 3,
    userId: 3,
    title: "Entrega do projeto",
    body: "Lembrem de testar o formulário e deixar o repositório organizado."
  }
];

let usuarios = [];
let posts = [];
let novoIdUsuario = 1;
let novoIdPost = 1;

const formUsuario = document.getElementById("formUsuario");
const formPost = document.getElementById("formPost");

const idUsuario = document.getElementById("idUsuario");
const nomeUsuario = document.getElementById("nomeUsuario");
const emailUsuario = document.getElementById("emailUsuario");
const cidadeUsuario = document.getElementById("cidadeUsuario");
const btnUsuario = document.getElementById("btnUsuario");
const cancelarUsuario = document.getElementById("cancelarUsuario");
const listaUsuarios = document.getElementById("listaUsuarios");

const idPost = document.getElementById("idPost");
const tituloPost = document.getElementById("tituloPost");
const textoPost = document.getElementById("textoPost");
const autorPost = document.getElementById("autorPost");
const btnPost = document.getElementById("btnPost");
const cancelarPost = document.getElementById("cancelarPost");
const listaPosts = document.getElementById("listaPosts");

const totalUsuarios = document.getElementById("totalUsuarios");
const totalPosts = document.getElementById("totalPosts");
const mensagem = document.getElementById("mensagem");

formUsuario.addEventListener("submit", salvarUsuario);
formPost.addEventListener("submit", salvarPost);
cancelarUsuario.addEventListener("click", limparUsuario);
cancelarPost.addEventListener("click", limparPost);

carregarDados();

async function carregarDados() {
  mostrarAviso("Carregando...");

  try {
    const [respostaUsuarios, respostaPosts] = await Promise.all([
      fetch(apiUsuarios),
      fetch(apiPosts)
    ]);

    if (!respostaUsuarios.ok || !respostaPosts.ok) {
      throw new Error("Falha ao consultar a API");
    }

    const dadosUsuarios = await respostaUsuarios.json();
    const dadosPosts = await respostaPosts.json();

    usuarios = dadosUsuarios.map(function(usuario) {
      return {
        id: usuario.id,
        name: usuario.name,
        email: usuario.email,
        city: usuario.address && usuario.address.city ? usuario.address.city : "Sem cidade"
      };
    });

    posts = dadosPosts.slice(0, 10).map(function(post) {
      return {
        id: post.id,
        userId: post.userId,
        title: primeiraLetraMaiuscula(post.title),
        body: primeiraLetraMaiuscula(post.body)
      };
    });

    prepararIds();
    atualizarTela();
    mostrarAviso("Atualizado.");
  } catch (erro) {
    usuarios = usuariosExemplo.map(function(usuario) {
      return { ...usuario };
    });

    posts = postsExemplo.map(function(post) {
      return { ...post };
    });

    prepararIds();
    atualizarTela();
    mostrarAviso("API offline. Dados locais.", true);
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

  usuarios.forEach(function(usuario) {
    const card = criarCard(
      usuario.name,
      "card autor-card",
      imagemUsuario(usuario.id),
      "Foto de " + usuario.name
    );

    const info = criarElemento("p", "info", usuario.city);
    const email = criarElemento("p", "", usuario.email);
    const acoes = criarElemento("div", "acoes-card");

    acoes.appendChild(criarBotao("Editar", "botao-editar", function() {
      editarUsuario(usuario.id);
    }));

    acoes.appendChild(criarBotao("Remover", "botao-remover", function() {
      removerUsuario(usuario.id);
    }));

    card.append(info, email, acoes);
    listaUsuarios.appendChild(card);
  });
}

function mostrarAutores() {
  autorPost.textContent = "";

  if (usuarios.length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "Sem autores";
    autorPost.appendChild(option);
    autorPost.disabled = true;
    btnPost.disabled = true;
    return;
  }

  usuarios.forEach(function(usuario) {
    const option = document.createElement("option");
    option.value = usuario.id;
    option.textContent = usuario.name;
    autorPost.appendChild(option);
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

  posts.forEach(function(post, indice) {
    const usuario = pegarUsuario(post.userId);
    const autor = usuario ? usuario.name : "Autor removido";
    const card = criarCard(
      post.title,
      indice === 0 ? "card noticia destaque" : "card noticia",
      imagemPost(post.id),
      "Imagem da postagem " + post.id
    );

    const info = criarElemento("p", "info", autor);
    const texto = criarElemento("p", "", post.body);
    const acoes = criarElemento("div", "acoes-card");

    acoes.appendChild(criarBotao("Editar", "botao-editar", function() {
      editarPost(post.id);
    }));

    acoes.appendChild(criarBotao("Remover", "botao-remover", function() {
      removerPost(post.id);
    }));

    card.append(info, texto, acoes);
    listaPosts.appendChild(card);
  });
}

function salvarUsuario(evento) {
  evento.preventDefault();

  const dadosUsuario = {
    name: nomeUsuario.value.trim(),
    email: emailUsuario.value.trim(),
    city: cidadeUsuario.value.trim()
  };

  if (!dadosUsuario.name || !dadosUsuario.email || !dadosUsuario.city) {
    mostrarAviso("Preencha os campos.", true);
    return;
  }

  if (idUsuario.value === "") {
    usuarios.unshift({
      id: novoIdUsuario,
      ...dadosUsuario
    });

    novoIdUsuario++;
    mostrarAviso("Adicionado.");
  } else {
    const usuario = pegarUsuario(idUsuario.value);

    if (!usuario) {
      mostrarAviso("Autor não encontrado.", true);
      return;
    }

    usuario.name = dadosUsuario.name;
    usuario.email = dadosUsuario.email;
    usuario.city = dadosUsuario.city;
    mostrarAviso("Salvo.");
  }

  limparUsuario();
  atualizarTela();
}

function editarUsuario(id) {
  const usuario = pegarUsuario(id);

  if (!usuario) {
    mostrarAviso("Autor não encontrado.", true);
    return;
  }

  idUsuario.value = usuario.id;
  nomeUsuario.value = usuario.name;
  emailUsuario.value = usuario.email;
  cidadeUsuario.value = usuario.city;
  btnUsuario.textContent = "Salvar";
  cancelarUsuario.hidden = false;
  nomeUsuario.focus();
}

function removerUsuario(id) {
  if (!confirm("Remover este autor?")) {
    return;
  }

  usuarios = usuarios.filter(function(usuario) {
    return usuario.id !== Number(id);
  });

  limparUsuario();
  atualizarTela();
  mostrarAviso("Removido.");
}

function salvarPost(evento) {
  evento.preventDefault();

  const dadosPost = {
    title: tituloPost.value.trim(),
    body: textoPost.value.trim(),
    userId: Number(autorPost.value)
  };

  if (!dadosPost.title || !dadosPost.body || !dadosPost.userId) {
    mostrarAviso("Preencha os campos.", true);
    return;
  }

  if (idPost.value === "") {
    posts.unshift({
      id: novoIdPost,
      ...dadosPost
    });

    novoIdPost++;
    mostrarAviso("Adicionado.");
  } else {
    const post = pegarPost(idPost.value);

    if (!post) {
      mostrarAviso("Post não encontrado.", true);
      return;
    }

    post.title = dadosPost.title;
    post.body = dadosPost.body;
    post.userId = dadosPost.userId;
    mostrarAviso("Salvo.");
  }

  limparPost();
  atualizarTela();
}

function editarPost(id) {
  const post = pegarPost(id);

  if (!post) {
    mostrarAviso("Post não encontrado.", true);
    return;
  }

  idPost.value = post.id;
  tituloPost.value = post.title;
  textoPost.value = post.body;
  autorPost.value = post.userId;
  btnPost.textContent = "Salvar";
  cancelarPost.hidden = false;
  tituloPost.focus();
}

function removerPost(id) {
  if (!confirm("Remover este post?")) {
    return;
  }

  posts = posts.filter(function(post) {
    return post.id !== Number(id);
  });

  limparPost();
  atualizarTela();
  mostrarAviso("Removido.");
}

function limparUsuario() {
  formUsuario.reset();
  idUsuario.value = "";
  btnUsuario.textContent = "Adicionar";
  cancelarUsuario.hidden = true;
}

function limparPost() {
  formPost.reset();
  idPost.value = "";
  btnPost.textContent = "Adicionar";
  cancelarPost.hidden = true;
}

function pegarUsuario(id) {
  return usuarios.find(function(usuario) {
    return usuario.id === Number(id);
  });
}

function pegarPost(id) {
  return posts.find(function(post) {
    return post.id === Number(id);
  });
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
  const botao = document.createElement("button");
  botao.type = "button";
  botao.className = classe;
  botao.textContent = texto;
  botao.addEventListener("click", acao);
  return botao;
}

function criarElemento(tag, classe, texto) {
  const elemento = document.createElement(tag);

  if (classe) {
    elemento.className = classe;
  }

  if (texto) {
    elemento.textContent = texto;
  }

  return elemento;
}

function criarImagem(src, alt) {
  const imagem = document.createElement("img");
  imagem.src = src;
  imagem.alt = alt;
  imagem.loading = "lazy";
  return imagem;
}

function criarVazio(texto) {
  return criarElemento("p", "vazio", texto);
}

function imagemPost(id) {
  return "https://picsum.photos/seed/mural-post-" + id + "/900/620";
}

function imagemUsuario(id) {
  return "https://picsum.photos/seed/mural-user-" + id + "/120/120";
}

function prepararIds() {
  novoIdUsuario = proximoId(usuarios);
  novoIdPost = proximoId(posts);
}

function proximoId(lista) {
  if (lista.length === 0) {
    return 1;
  }

  const maiorId = Math.max.apply(null, lista.map(function(item) {
    return item.id;
  }));

  return maiorId + 1;
}

function mostrarAviso(texto, erro) {
  mensagem.textContent = texto;
  mensagem.classList.toggle("erro", Boolean(erro));
}

function primeiraLetraMaiuscula(texto) {
  if (!texto) {
    return "";
  }

  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
