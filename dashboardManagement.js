// dashboardManagement.js
// Funzioni per l'aggiornamento della dashboard

function updateDashboard() {
    let totalClients = 0;
    let totalHours = 0;
    let todaySessions = 0;
    const today = new Date().toDateString();
    
    appData.companies.forEach(company => {
        totalClients += company.clients.length;
        company.clients.forEach(client => {
            totalHours += client.completedSessions * client.hoursPerSession;
            client.sessionHistory.forEach(session => {
                if (new Date(session.date).toDateString() === today) {
                    todaySessions++;
                }
            });
        });
    });
    
    document.getElementById('totalCompanies').textContent = appData.companies.length;
    document.getElementById('activeClients').textContent = totalClients;
    document.getElementById('todaySessions').textContent = todaySessions;
    document.getElementById('totalHours').textContent = totalHours.toFixed(1);
}

// Modificata addGlobalTodo per includere i tag
function addGlobalTodo() {
    const text = prompt('Inserisci il promemoria globale:');
    if (!text) return;
    
    // Chiedi i tag come stringa separata da virgole
    const tagsInput = prompt('Inserisci i tag per questo promemoria (separati da virgola, es: "Urgente, Priorità Alta"):', '');
    const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '') : [];

    appData.globalTodos.push({
        text: text,
        completed: false,
        createdAt: new Date().toISOString(),
        tags: tags // Aggiunto i tag
    });
    
    saveDataToLocalStorage();
    renderGlobalTodos();
}

function toggleTodo(type, index) {
    if (type === 'client') {
        const company = appData.companies.find(c => c.id === appData.currentCompanyId);
        const client = company.clients.find(c => c.id === appData.currentClientId);
        client.todos[index].completed = !client.todos[index].completed;
        displayClientTodos(client);
    } else {
        appData.globalTodos[index].completed = !appData.globalTodos[index].completed;
        renderGlobalTodos();
    }
    saveDataToLocalStorage();
}

function removeTodo(type, index) {
    if (type === 'client') {
        const company = appData.companies.find(c => c.id === appData.currentCompanyId);
        const client = company.clients.find(c => c.id === appData.currentClientId);
        if (confirm('Sei sicuro di voler rimuovere questo To-Do per il cliente?')) {
            client.todos.splice(index, 1);
            displayClientTodos(client);
        }
    } else {
        if (confirm('Sei sicuro di voler rimuovere questo promemoria globale?')) {
            appData.globalTodos.splice(index, 1);
            renderGlobalTodos();
        }
    }
    saveDataToLocalStorage();
}