// Simulação de banco de dados no localStorage
const db = {
    getUsers: () => JSON.parse(localStorage.getItem('users')) || [],
    saveUsers: (users) => localStorage.setItem('users', JSON.stringify(users)),
    getTodos: () => JSON.parse(localStorage.getItem('todos')) || [],
    saveTodos: (todos) => localStorage.setItem('todos', JSON.stringify(todos)),
    getCurrentUser: () => JSON.parse(localStorage.getItem('currentUser')),
    setCurrentUser: (user) => localStorage.setItem('currentUser', JSON.stringify(user)),
    removeCurrentUser: () => localStorage.removeItem('currentUser')
};

// --- LÓGICA DE AUTENTICAÇÃO ---

function cadastrarUsuario(nome, email, senha) {
    const users = db.getUsers();
    if (users.find(u => u.email === email)) return alert("E-mail já cadastrado!");
    users.push({ nome, email, senha });
    db.saveUsers(users);
    alert("Cadastro realizado!");
}

function login(email, senha) {
    const users = db.getUsers();
    const user = users.find(u => u.email === email && u.senha === senha);
    if (user) {
        db.setCurrentUser(user);
        renderDashboard();
    } else {
        alert("E-mail ou senha incorretos!");
    }
}

function logout() {
    db.removeCurrentUser();
    location.reload();
}

// --- LÓGICA DE TAREFAS ---

function adicionarTarefa(titulo, tipo, descricao) {
    const user = db.getCurrentUser();
    const todos = db.getTodos();
    const novaTarefa = {
        id: Date.now(),
        userId: user.email,
        titulo,
        tipo,
        descricao,
        done: false
    };
    todos.push(novaTarefa);
    db.saveTodos(todos);
    renderDashboard();
}

function concluirTarefa(id) {
    let todos = db.getTodos();
    todos = todos.map(t => t.id === id ? { ...t, done: true } : t);
    db.saveTodos(todos);
    renderDashboard();
}

// --- RENDERIZAÇÃO (Manipulação de DOM simplificada) ---

function renderDashboard() {
    const user = db.getCurrentUser();
    if (!user) return; // Redirecionar para login se não logado

    // Limpa a tela e injeta o HTML do painel
    document.getElementById('app').innerHTML = `
        <div class="p-6 text-white">
            <header class="flex justify-between mb-8">
                <h1 class="text-2xl">Olá, ${user.nome}</h1>
                <button onclick="logout()" class="bg-red-600 px-4 py-2 rounded">Logout</button>
            </header>
            
            <form onsubmit="event.preventDefault(); adicionarTarefa(this.titulo.value, this.tipo.value, this.descricao.value)" class="bg-gray-800 p-4 rounded mb-6">
                <input name="titulo" placeholder="Título" required class="block w-full p-2 mb-2 bg-gray-700 rounded">
                <select name="tipo" class="block w-full p-2 mb-2 bg-gray-700 rounded">
                    <option value="Trabalho">Trabalho</option>
                    <option value="Pessoal">Pessoal</option>
                    <option value="Estudos">Estudos</option>
                </select>
                <textarea name="descricao" placeholder="Descrição" class="block w-full p-2 mb-2 bg-gray-700 rounded"></textarea>
                <button type="submit" class="bg-blue-600 px-4 py-2 rounded">Adicionar Tarefa</button>
            </form>

            <div id="lista-tarefas"></div>
        </div>
    `;

    const todos = db.getTodos().filter(t => t.userId === user.email);
    const container = document.getElementById('lista-tarefas');
    
    if (todos.length === 0) {
        container.innerHTML = "<p>Nenhuma tarefa cadastrada ainda.</p>";
    } else {
        container.innerHTML = todos.map(t => `
            <div class="bg-gray-800 p-4 mb-3 rounded glass-morphism ${t.done ? 'opacity-50' : ''}">
                <h3 class="${t.done ? 'line-through' : ''}">${t.titulo}</h3>
                <span class="text-xs bg-blue-500 px-2 rounded">${t.tipo}</span>
                <p>${t.descricao}</p>
                ${!t.done ? `<button onclick="concluirTarefa(${t.id})" class="bg-green-600 mt-2 px-2 py-1 rounded">Concluir</button>` : ''}
            </div>
        `).join('');
    }
}
