// Funções de Banco de Dados (LocalStorage)
const db = {
    getUsers: () => JSON.parse(localStorage.getItem('users')) || [],
    saveUsers: (users) => localStorage.setItem('users', JSON.stringify(users)),
    getTodos: () => JSON.parse(localStorage.getItem('todos')) || [],
    saveTodos: (todos) => localStorage.setItem('todos', JSON.stringify(todos)),
    getCurrentUser: () => JSON.parse(localStorage.getItem('currentUser')),
    setCurrentUser: (user) => localStorage.setItem('currentUser', JSON.stringify(user)),
    removeCurrentUser: () => localStorage.removeItem('currentUser')
};

// Funções de Navegação
function showRegister() {
    document.getElementById('app').innerHTML = `
        <div class="glass-morphism p-8 rounded-2xl shadow-2xl text-white">
            <h2 class="text-3xl font-bold mb-6 text-center">Cadastro</h2>
            <form onsubmit="handleRegister(event)">
                <div class="mb-4">
                    <label class="block text-sm mb-2 text-gray-400">Nome</label>
                    <input type="text" id="reg-nome" required class="w-full p-3 bg-slate-800 rounded-lg border border-slate-700 focus:border-blue-500 outline-none">
                </div>
                <div class="mb-4">
                    <label class="block text-sm mb-2 text-gray-400">E-mail</label>
                    <input type="email" id="reg-email" required class="w-full p-3 bg-slate-800 rounded-lg border border-slate-700 focus:border-blue-500 outline-none">
                </div>
                <div class="mb-6">
                    <label class="block text-sm mb-2 text-gray-400">Senha</label>
                    <input type="password" id="reg-senha" required class="w-full p-3 bg-slate-800 rounded-lg border border-slate-700 focus:border-blue-500 outline-none">
                </div>
                <button type="submit" class="w-full bg-green-600 hover:bg-green-500 p-3 rounded-lg font-bold transition-all mb-4">Criar Conta</button>
            </form>
            <p class="text-center text-sm text-gray-400">Já tem conta? <a href="index.html" class="text-blue-400">Fazer Login</a></p>
        </div>
    `;
}

// Handlers de Formulário
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-senha').value;
    const user = db.getUsers().find(u => u.email === email && u.senha === senha);
    
    if (user) {
        db.setCurrentUser(user);
        renderDashboard();
    } else {
        alert("Usuário ou senha incorretos.");
    }
}

function handleRegister(e) {
    e.preventDefault();
    const nome = document.getElementById('reg-nome').value;
    const email = document.getElementById('reg-email').value;
    const senha = document.getElementById('reg-senha').value;
    
    const users = db.getUsers();
    if (users.find(u => u.email === email)) return alert("E-mail já cadastrado!");
    
    users.push({ nome, email, senha });
    db.saveUsers(users);
    alert("Cadastro concluído! Agora faça login.");
    location.reload();
}

function logout() {
    db.removeCurrentUser();
    location.reload();
}

// Lógica de Tarefas
function adicionarTarefa(titulo, tipo, descricao) {
    const user = db.getCurrentUser();
    const todos = db.getTodos();
    todos.push({
        id: Date.now(),
        userId: user.email,
        titulo, tipo, descricao, done: false
    });
    db.saveTodos(todos);
    renderDashboard();
}

function concluirTarefa(id) {
    let todos = db.getTodos();
    todos = todos.map(t => t.id === id ? { ...t, done: true } : t);
    db.saveTodos(todos);
    renderDashboard();
}

// Renderização do Painel
function renderDashboard() {
    const user = db.getCurrentUser();
    document.body.classList.remove('flex', 'items-center', 'justify-center'); // Ajusta layout para o painel
    
    document.getElementById('app').innerHTML = `
        <div class="max-w-4xl mx-auto w-full p-6 text-white">
            <header class="flex justify-between items-center mb-10">
                <h1 class="text-2xl font-bold">Olá, ${user.nome} 👋</h1>
                <button onclick="logout()" class="bg-red-500/20 hover:bg-red-500 p-2 px-4 rounded-lg transition-all">Sair</button>
            </header>

            <form onsubmit="event.preventDefault(); adicionarTarefa(this.t.value, this.tp.value, this.d.value)" class="glass-morphism p-6 rounded-xl mb-10">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input name="t" placeholder="Título da tarefa" required class="p-3 bg-slate-800 rounded-lg outline-none">
                    <select name="tp" class="p-3 bg-slate-800 rounded-lg outline-none text-white">
                        <option value="Trabalho">Trabalho</option>
                        <option value="Pessoal">Pessoal</option>
                        <option value="Estudos">Estudos</option>
                    </select>
                </div>
                <textarea name="d" placeholder="Descrição (opcional)" class="w-full p-3 bg-slate-800 rounded-lg outline-none mb-4"></textarea>
                <button type="submit" class="w-full bg-blue-600 hover:bg-blue-500 p-3 rounded-lg font-bold">Adicionar Tarefa</button>
            </form>

            <div id="lista" class="grid gap-4"></div>
        </div>
    `;

    const userTodos = db.getTodos().filter(t => t.userId === user.email);
    const lista = document.getElementById('lista');

    if (userTodos.length === 0) {
        lista.innerHTML = `<p class="text-center text-gray-500">Nenhuma tarefa encontrada.</p>`;
    } else {
        lista.innerHTML = userTodos.map(t => `
            <div class="glass-morphism p-4 rounded-lg flex justify-between items-center ${t.done ? 'opacity-40' : ''}">
                <div>
                    <h3 class="font-bold ${t.done ? 'line-through' : ''}">${t.titulo}</h3>
                    <p class="text-sm text-gray-400">${t.descricao}</p>
                    <span class="text-[10px] uppercase font-bold bg-blue-900 px-2 py-0.5 rounded">${t.tipo}</span>
                </div>
                ${!t.done ? `<button onclick="concluirTarefa(${t.id})" class="bg-green-600 p-2 px-4 rounded text-xs font-bold">Concluir</button>` : '✅'}
            </div>
        `).join('');
    }
}

// Inicialização
if (db.getCurrentUser()) renderDashboard();
