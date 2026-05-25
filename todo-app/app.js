/**
 * TaskFlow — app.js
 * Lógica completa da aplicação To-Do
 * Stack: HTML5 + Tailwind CSS (CDN) + JavaScript puro
 * Persistência: localStorage (simula db.json com "users" e "todos")
 */

// ════════════════════════════════════════════════════════════════════
// HELPERS DE PERSISTÊNCIA (localStorage como "banco de dados")
// ════════════════════════════════════════════════════════════════════

/**
 * Retorna todos os usuários cadastrados.
 * @returns {Array} Lista de objetos { nome, email, senha }
 */
function getUsers() {
  return JSON.parse(localStorage.getItem('users') || '[]');
}

/**
 * Salva a lista de usuários no localStorage.
 * @param {Array} users
 */
function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

/**
 * Retorna todas as tarefas armazenadas (de todos os usuários).
 * @returns {Array} Lista de objetos tarefa
 */
function getTodos() {
  return JSON.parse(localStorage.getItem('todos') || '[]');
}

/**
 * Salva a lista completa de tarefas no localStorage.
 * @param {Array} todos
 */
function saveTodos(todos) {
  localStorage.setItem('todos', JSON.stringify(todos));
}

/**
 * Retorna o usuário logado atualmente (ou null).
 * @returns {Object|null}
 */
function getCurrentUser() {
  return JSON.parse(localStorage.getItem('currentUser') || 'null');
}

/**
 * Define o usuário logado no localStorage.
 * @param {Object|null} user
 */
function setCurrentUser(user) {
  if (user === null) {
    localStorage.removeItem('currentUser');
  } else {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }
}


// ════════════════════════════════════════════════════════════════════
// NAVEGAÇÃO ENTRE TELAS
// ════════════════════════════════════════════════════════════════════

/**
 * Exibe apenas a tela cujo id é passado como parâmetro,
 * ocultando todas as outras.
 * @param {string} id - id do elemento <div> da tela
 */
function mostrarTela(id) {
  document.querySelectorAll('.screen').forEach(el => {
    el.classList.remove('active');
  });
  document.getElementById(id).classList.add('active');
}


// ════════════════════════════════════════════════════════════════════
// AUTENTICAÇÃO
// ════════════════════════════════════════════════════════════════════

/**
 * Registra um novo usuário.
 * Valida campos obrigatórios, duplicidade de e-mail e comprimento de senha.
 */
function realizarCadastro() {
  const nome  = document.getElementById('cad-nome').value.trim();
  const email = document.getElementById('cad-email').value.trim().toLowerCase();
  const senha = document.getElementById('cad-senha').value;
  const erroEl = document.getElementById('cad-erro');

  // Limpa erro anterior
  erroEl.classList.remove('visible');

  // Validações básicas
  if (!nome || !email || !senha) {
    erroEl.textContent = 'Preencha todos os campos.';
    erroEl.classList.add('visible');
    return;
  }
  if (senha.length < 6) {
    erroEl.textContent = 'A senha deve ter pelo menos 6 caracteres.';
    erroEl.classList.add('visible');
    return;
  }

  const users = getUsers();

  // Verifica duplicidade de e-mail
  if (users.find(u => u.email === email)) {
    erroEl.textContent = 'Este e-mail já está cadastrado.';
    erroEl.classList.add('visible');
    return;
  }

  // Salva novo usuário
  users.push({ nome, email, senha });
  saveUsers(users);

  // Redireciona para login com os campos pré-limpos
  document.getElementById('cad-nome').value  = '';
  document.getElementById('cad-email').value = '';
  document.getElementById('cad-senha').value = '';
  mostrarTela('screen-login');
}

/**
 * Autentica o usuário com e-mail e senha.
 * Em caso de sucesso, salva currentUser e carrega o painel.
 */
function realizarLogin() {
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const senha = document.getElementById('login-senha').value;
  const erroEl = document.getElementById('login-erro');

  erroEl.classList.remove('visible');

  // Valida campos vazios
  if (!email || !senha) {
    erroEl.textContent = 'Preencha e-mail e senha.';
    erroEl.classList.add('visible');
    return;
  }

  const users = getUsers();
  const user  = users.find(u => u.email === email);

  // Verifica se o e-mail existe
  if (!user) {
    erroEl.textContent = 'E-mail não encontrado.';
    erroEl.classList.add('visible');
    return;
  }

  // Verifica senha
  if (user.senha !== senha) {
    erroEl.textContent = 'Senha incorreta.';
    erroEl.classList.add('visible');
    return;
  }

  // Login bem-sucedido
  setCurrentUser(user);
  carregarPainel();
}

/**
 * Encerra a sessão removendo currentUser do localStorage
 * e redirecionando para a tela de login.
 */
function realizarLogout() {
  setCurrentUser(null);
  document.getElementById('login-email').value = '';
  document.getElementById('login-senha').value = '';
  document.getElementById('login-erro').classList.remove('visible');
  mostrarTela('screen-login');
}


// ════════════════════════════════════════════════════════════════════
// PAINEL / DASHBOARD
// ════════════════════════════════════════════════════════════════════

/**
 * Configura e exibe o painel do usuário logado.
 * Atualiza a saudação e renderiza as tarefas.
 */
function carregarPainel() {
  const user = getCurrentUser();
  if (!user) {
    mostrarTela('screen-login');
    return;
  }

  // Saudação no header
  document.getElementById('header-nome').textContent = user.nome;

  // Exibe o painel e renderiza tarefas
  mostrarTela('screen-dashboard');
  renderizarTarefas();
}

/**
 * Adiciona uma nova tarefa ao localStorage para o usuário logado.
 * Valida que o título não esteja vazio.
 */
function adicionarTarefa() {
  const titulo = document.getElementById('task-titulo').value.trim();
  const tipo   = document.getElementById('task-tipo').value;
  const desc   = document.getElementById('task-desc').value.trim();
  const erroEl = document.getElementById('task-erro');
  const user   = getCurrentUser();

  erroEl.classList.remove('visible');

  // Valida título obrigatório
  if (!titulo) {
    erroEl.textContent = 'O título da tarefa é obrigatório.';
    erroEl.classList.add('visible');
    return;
  }

  const todos = getTodos();

  // Cria o objeto da tarefa
  const novaTarefa = {
    id:          Date.now(),          // timestamp como ID único
    userId:      user.email,          // vincula ao usuário logado
    titulo,
    tipo,
    descricao:   desc,
    feita:       false,
    criadaEm:    new Date().toLocaleDateString('pt-BR')
  };

  todos.push(novaTarefa);
  saveTodos(todos);

  // Limpa o formulário
  document.getElementById('task-titulo').value = '';
  document.getElementById('task-desc').value   = '';

  renderizarTarefas();
}

/**
 * Alterna o status "feita" de uma tarefa pelo seu id.
 * @param {number} id - id da tarefa (timestamp)
 */
function concluirTarefa(id) {
  const todos = getTodos();
  const idx   = todos.findIndex(t => t.id === id);
  if (idx === -1) return;

  // Inverte o status
  todos[idx].feita = !todos[idx].feita;
  saveTodos(todos);
  renderizarTarefas();
}

/**
 * Remove permanentemente uma tarefa pelo seu id.
 * @param {number} id
 */
function excluirTarefa(id) {
  const todos = getTodos().filter(t => t.id !== id);
  saveTodos(todos);
  renderizarTarefas();
}

/**
 * Renderiza a lista de tarefas do usuário logado no DOM.
 * Tarefas concluídas aparecem no final, com estilo diferenciado.
 */
function renderizarTarefas() {
  const user     = getCurrentUser();
  const container = document.getElementById('lista-tarefas');
  const contador  = document.getElementById('task-contador');

  if (!user) return;

  // Filtra apenas as tarefas do usuário atual
  const todos = getTodos().filter(t => t.userId === user.email);

  // Pendentes primeiro, concluídas no final
  const pendentes  = todos.filter(t => !t.feita);
  const concluidas = todos.filter(t =>  t.feita);
  const ordenadas  = [...pendentes, ...concluidas];

  // Atualiza contador
  contador.textContent = `${pendentes.length} pendente(s) · ${concluidas.length} concluída(s)`;

  // Sem tarefas
  if (ordenadas.length === 0) {
    container.innerHTML = `
      <div class="glass p-8 text-center">
        <p class="text-slate-500 text-sm">Nenhuma tarefa cadastrada ainda.</p>
        <p class="text-slate-600 text-xs mt-1">Crie sua primeira tarefa acima ↑</p>
      </div>`;
    return;
  }

  // Mapeamento de badge por tipo
  const badges = {
    trabalho: '<span class="badge badge-trabalho">Trabalho</span>',
    pessoal:  '<span class="badge badge-pessoal">Pessoal</span>',
    estudos:  '<span class="badge badge-estudos">Estudos</span>',
  };

  // Gera o HTML de cada card de tarefa
  container.innerHTML = ordenadas.map(t => `
    <div class="glass p-4 fade-up ${t.feita ? 'task-done' : ''}">
      <div class="flex items-start justify-between gap-3">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap mb-1">
            <p class="task-title font-semibold text-white text-sm">${escapeHtml(t.titulo)}</p>
            ${badges[t.tipo] || ''}
          </div>
          ${t.descricao
            ? `<p class="text-slate-400 text-xs mt-1 leading-relaxed">${escapeHtml(t.descricao)}</p>`
            : ''}
          <p class="text-slate-600 text-xs mt-2">📅 ${t.criadaEm}</p>
        </div>
        <div class="flex items-center gap-2 flex-shrink-0">
          <button
            onclick="concluirTarefa(${t.id})"
            title="${t.feita ? 'Reabrir tarefa' : 'Marcar como concluída'}"
            class="text-xs px-3 py-1.5 rounded-lg border transition-all duration-200
              ${t.feita
                ? 'border-slate-700 text-slate-500 hover:border-slate-600'
                : 'border-emerald-700 text-emerald-400 hover:bg-emerald-900/30'}">
            ${t.feita ? '↩ Reabrir' : '✓ Concluir'}
          </button>
          <button
            onclick="excluirTarefa(${t.id})"
            title="Excluir tarefa"
            class="text-xs px-2 py-1.5 rounded-lg border border-slate-700 text-slate-500
              hover:border-red-800 hover:text-red-400 transition-all duration-200">
            ✕
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

/**
 * Escapa caracteres especiais HTML para evitar XSS
 * ao inserir texto do usuário no DOM.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

/**
 * Suporte a pressionar Enter nos campos de login e cadastro.
 */
function inicializarAtalhos() {
  document.getElementById('login-senha').addEventListener('keydown', e => {
    if (e.key === 'Enter') realizarLogin();
  });
  document.getElementById('cad-senha').addEventListener('keydown', e => {
    if (e.key === 'Enter') realizarCadastro();
  });
  document.getElementById('task-titulo').addEventListener('keydown', e => {
    if (e.key === 'Enter') adicionarTarefa();
  });
}


// ════════════════════════════════════════════════════════════════════
// INICIALIZAÇÃO DA APLICAÇÃO
// ════════════════════════════════════════════════════════════════════

/**
 * Ponto de entrada.
 * Verifica se há um usuário já logado (currentUser no localStorage)
 * e carrega a tela adequada sem forçar novo login.
 */
(function init() {
  inicializarAtalhos();

  const user = getCurrentUser();
  if (user) {
    // Usuário já estava logado — vai direto ao painel
    carregarPainel();
  } else {
    // Nenhuma sessão ativa — exibe tela de login
    mostrarTela('screen-login');
  }
})();
