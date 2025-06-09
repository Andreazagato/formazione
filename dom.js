// dom.js
// Funzioni per l'aggiornamento del DOM e il rendering delle sezioni

function updateDateTime() {
    const now = new Date();
    document.getElementById('currentDateTime').textContent =
        now.toLocaleDateString('it-IT', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
}

function renderCompanies() {
    const grid = document.getElementById('companyGrid');
    grid.innerHTML = '';

    if (appData.companies.length === 0) {
        grid.innerHTML = '<p class="text-center text-muted">Nessuna azienda aggiunta. Clicca "Aggiungi Azienda" per iniziare.</p>';
        return;
    }

    appData.companies.forEach(company => {
        const card = document.createElement('div');
        card.className = 'company-card';
        card.innerHTML = `
            <button class="delete-btn" onclick="event.stopPropagation(); deleteCompany(${company.id})">×</button>
            <h3>${company.name}</h3>
            <p>Clienti: ${company.clients.length}</p>
        `;
        card.onclick = () => showCompanyDetails(company.id);
        grid.appendChild(card);
    });
}

function renderClientsInModal(company) {
    const grid = document.getElementById('clientGrid');
    grid.innerHTML = '';

    if (company.clients.length === 0) {
        grid.innerHTML = '<p class="text-center text-muted">Nessun cliente aggiunto per questa azienda. Clicca "Aggiungi Cliente".</p>';
        return;
    }

    company.clients.forEach(client => {
        const card = document.createElement('div');
        card.className = 'client-card';
        card.innerHTML = `
            <button class="delete-btn" onclick="event.stopPropagation(); deleteClient(${client.id})">×</button>
            <h3>${client.firstName} ${client.lastName}</h3>
            <p>Sessioni: ${client.completedSessions}/${client.plannedSessions}</p>
            <p>Ore per sessione: ${client.hoursPerSession}h</p>
        `;
        grid.appendChild(card);
    });
}

function renderClientsForSessionSelection() {
    const companyId = parseInt(document.getElementById('sessionCompanySelect').value);
    const clientSelectGrid = document.getElementById('clientSelectGrid');
    clientSelectGrid.innerHTML = '';

    document.getElementById('clientSessionView').style.display = 'none'; // Hide client details when company changes
    appData.currentClientId = null; // Clear current client

    if (!companyId) {
        document.getElementById('sessionClientSelectionCard').style.display = 'none';
        return;
    }

    appData.currentCompanyId = companyId; // Set current company
    const company = appData.companies.find(c => c.id === companyId);

    if (company && company.clients.length > 0) {
        company.clients.forEach(client => {
            const card = document.createElement('div');
            card.className = 'client-select-card';
            card.innerHTML = `
                <h3>${client.firstName} ${client.lastName}</h3>
                <p>Sessioni completate: ${client.completedSessions}/${client.plannedSessions}</p>
            `;
            // AGGIUNTA DELL'EVENT LISTENER QUI
            card.onclick = () => loadClientSession(client.id);
            clientSelectGrid.appendChild(card);
        });
        document.getElementById('sessionClientSelectionCard').style.display = 'block';
    } else {
        clientSelectGrid.innerHTML = '<p class="text-center text-muted">Nessun cliente per l\'azienda selezionata.</p>';
        document.getElementById('sessionClientSelectionCard').style.display = 'block'; // Still show the card, but with a message
    }
}

function displayClientInfo(client) {
    const infoDiv = document.getElementById('clientInfoDisplay');
    const clientNameDisplay = document.getElementById('clientNameDisplay');
    const complianceIndicator = document.getElementById('complianceIndicator'); // Questo sarà nascosto via CSS o JS

    clientNameDisplay.textContent = `${client.firstName} ${client.lastName}`;

    complianceIndicator.style.display = 'none'; // Assicurati che sia nascosto

    infoDiv.innerHTML = `
        <p><strong>Sessioni completate:</strong> ${client.completedSessions}/${client.plannedSessions}</p>
        <p><strong>Ore per sessione:</strong> ${client.hoursPerSession}h</p>
        <p><strong>Data sessione corrente:</strong> ${new Date().toLocaleDateString('it-IT')}</p>
    `;
}

function displayClientProfile(client) {
    // Habits
    const habitsDiv = document.getElementById('habitsSection');
    habitsDiv.innerHTML = '';
    if (client.profile.habits.length === 0) {
        habitsDiv.innerHTML = '<p class="text-muted">Nessuna abitudine aggiunta.</p>';
    } else {
        client.profile.habits.forEach((habit, index) => {
            const habitDiv = document.createElement('div');
            habitDiv.className = 'habit-tracker';
            habitDiv.innerHTML = `
                <span>${habit.name}</span>
                <select onchange="updateHabitCategory(${index}, this.value)" class="form-select btn-sm">
                    <option value="positive" ${habit.category === 'positive' ? 'selected' : ''}>Positiva</option>
                    <option value="improve" ${habit.category === 'improve' ? 'selected' : ''}>Da migliorare</option>
                </select>
                <button class="btn btn-danger btn-sm" onclick="removeHabit(${index})">Rimuovi</button>
            `;
            habitsDiv.appendChild(habitDiv);
        });
    }

    // Strengths (Punti di Forza)
    const strengthsDiv = document.getElementById('strengthsSection');
    strengthsDiv.innerHTML = '';
    if (client.profile.strengths.length === 0) {
        strengthsDiv.innerHTML = '<p class="text-muted">Nessun punto di forza aggiunto.</p>';
    } else {
        client.profile.strengths.forEach((strength, index) => {
            const strengthDiv = document.createElement('div');
            strengthDiv.innerHTML = `
                <span>${strength}</span>
                <button class="btn btn-danger btn-sm" onclick="removeStrength(${index})">×</button>
            `;
            strengthsDiv.appendChild(strengthDiv);
        });
    }

    // Improvement Areas (Aree di Miglioramento) - AGGIUNTA GESTIONE TAG
    const improvementsDiv = document.getElementById('improvementsSection');
    improvementsDiv.innerHTML = '';
    if (client.profile.improvementAreas.length === 0) {
        improvementsDiv.innerHTML = '<p class="text-muted">Nessuna area di miglioramento aggiunta.</p>';
    } else {
        client.profile.improvementAreas.forEach((area, index) => {
            const improvementDiv = document.createElement('div');
            improvementDiv.className = 'item-with-tags'; // Nuova classe per lo stile
            improvementDiv.innerHTML = `
                <span>${area.name}</span>
                <div class="tags-container">
                    ${area.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    <button class="btn btn-danger btn-sm" onclick="removeImprovementArea(${index})">×</button>
                </div>
            `;
            improvementsDiv.appendChild(improvementDiv);
        });
    }

    // Compliance select (rimossa)
}

function displayMasterElements(client) {
    const elementsDiv = document.getElementById('masterElementsSection');
    elementsDiv.innerHTML = '';

    if (client.masterElements.length === 0) {
        elementsDiv.innerHTML = '<p class="text-center text-muted">Nessun obiettivo aggiunto al percorso di coaching.</p>';
        return;
    }

    client.masterElements.forEach((master, masterIndex) => {
        const allSubCompleted = master.subElements.every(sub => sub.completed);
        const masterDiv = document.createElement('div');
        masterDiv.className = `master-element ${allSubCompleted ? 'completed' : ''}`;

        masterDiv.innerHTML = `
            <h3>${master.name}</h3>
            <div class="sub-elements">
                ${master.subElements.length === 0 ? '<p class="text-muted" style="margin-left: 20px;">Nessun micro obiettivo.</p>' : ''}
                ${master.subElements.map((sub, subIndex) => `
                    <div class="sub-element ${sub.completed ? 'completed' : ''}">
                        <span onclick="toggleSubElement(${masterIndex}, ${subIndex})">
                            <strong>${sub.name}</strong>
                            ${sub.notes ? `<p>${sub.notes}</p>` : ''}
                            <small>Stato: ${sub.completed ? 'Completato' : 'In corso'}</small>
                        </span>
                        <div class="tags-container">
                            ${sub.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                            <button class="delete-btn-small" onclick="removeSubElement(${masterIndex}, ${subIndex})">×</button>
                        </div>
                    </div>
                `).join('')}
            </div>
            <button class="btn btn-primary btn-sm" onclick="addSubElement(${masterIndex})">Aggiungi Micro Obiettivo</button>
            <button class="btn btn-danger btn-sm" onclick="removeMasterElement(${masterIndex})">Rimuovi Obiettivo</button>
        `;

        elementsDiv.appendChild(masterDiv);
    });
}

function displayClientTodos(client) {
    const todosDiv = document.getElementById('clientTodos');
    todosDiv.innerHTML = '';

    if (client.todos.length === 0) {
        todosDiv.innerHTML = '<p class="text-muted">Nessun To-Do per questo cliente.</p>';
        return;
    }

    client.todos.forEach((todo, index) => {
        const todoDiv = document.createElement('div');
        todoDiv.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        todoDiv.innerHTML = `
            <input type="checkbox" ${todo.completed ? 'checked' : ''}
                   onchange="toggleTodo('client', ${index})">
            <span>${todo.text}</span>
            <div class="tags-container">
                ${todo.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                <button class="btn btn-danger btn-sm" onclick="removeTodo('client', ${index})">×</button>
            </div>
        `;
        todosDiv.appendChild(todoDiv);
    });
}

function displaySessionHistory(client) {
    const historyDiv = document.getElementById('sessionHistory');
    historyDiv.innerHTML = '';

    if (client.sessionHistory.length === 0) {
        historyDiv.innerHTML = '<p class="text-center text-muted">Nessuna sessione registrata.</p>';
        return;
    }

    client.sessionHistory.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(session => {
        const sessionDiv = document.createElement('div');
        sessionDiv.className = 'session-entry';
        sessionDiv.innerHTML = `
            <strong>Data:</strong> ${new Date(session.date).toLocaleDateString('it-IT')}<br>
            <strong>Durata:</strong> ${session.duration}<br>
            <strong>Note:</strong> ${session.notes || 'Nessuna nota'}
        `;
        historyDiv.appendChild(sessionDiv);
    });
}

function renderGlobalTodos() {
    const todosDiv = document.getElementById('globalTodos');
    todosDiv.innerHTML = '';

    if (appData.globalTodos.length === 0) {
        todosDiv.innerHTML = '<p class="text-muted">Nessun promemoria globale aggiunto.</p>';
        return;
    }

    appData.globalTodos.forEach((todo, index) => {
        const todoDiv = document.createElement('div');
        todoDiv.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        todoDiv.innerHTML = `
            <input type="checkbox" ${todo.completed ? 'checked' : ''}
                   onchange="toggleTodo('global', ${index})">
            <span>${todo.text}</span>
            <div class="tags-container">
                ${todo.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                <button class="btn btn-danger btn-sm" onclick="removeTodo('global', ${index})">×</button>
            </div>
        `;
        todosDiv.appendChild(todoDiv);
    });
}

function renderCategories() {
    const categoriesDiv = document.getElementById('categoriesList');
    categoriesDiv.innerHTML = '';

    if (appData.categories.length === 0) {
        categoriesDiv.innerHTML = '<p class="text-muted">Nessuna categoria definita.</p>';
        return;
    }

    appData.categories.forEach((category, index) => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category-item';
        categoryDiv.innerHTML = `
            <span>${category}</span>
            <button class="btn btn-danger btn-sm" onclick="removeCategory(${index})">Rimuovi</button>
        `;
        categoriesDiv.appendChild(categoryDiv);
    });
}

function renderTags() {
    const tagsDiv = document.getElementById('tagsList');
    tagsDiv.innerHTML = '';

    if (appData.tags.length === 0) {
        tagsDiv.innerHTML = '<p class="text-muted">Nessun tag definito.</p>';
        return;
    }

    appData.tags.forEach((tag, index) => {
        const tagDiv = document.createElement('div');
        tagDiv.className = 'tag-item';
        tagDiv.innerHTML = `
            <span>${tag}</span>
            <button class="btn btn-danger btn-sm" onclick="removeTag(${index})">Rimuovi</button>
        `;
        tagsDiv.appendChild(tagDiv);
    });
}