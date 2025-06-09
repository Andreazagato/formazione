// companyClientManagement.js
// Funzioni per la gestione di aziende e clienti

function addCompany() {
    const name = document.getElementById('companyName').value.trim();
    if (!name) {
        alert('Inserisci il nome dell\'azienda');
        return;
    }
    
    const company = {
        id: Date.now(),
        name: name,
        clients: []
    };
    
    appData.companies.push(company);
    saveDataToLocalStorage();
    closeModal('addCompanyModal');
    renderCompanies();
    updateDashboard();
}

function deleteCompany(companyId) {
    if (confirm('Sei sicuro di voler eliminare questa azienda e tutti i suoi clienti?')) {
        appData.companies = appData.companies.filter(c => c.id !== companyId);
        saveDataToLocalStorage();
        renderCompanies();
        updateDashboard();
        // If the deleted company was the current one in sessions, reset view
        if (appData.currentCompanyId === companyId) {
            appData.currentCompanyId = null;
            appData.currentClientId = null;
            const select = document.getElementById('sessionCompanySelect');
            if (select) select.value = '';
            document.getElementById('sessionClientSelectionCard').style.display = 'none';
            document.getElementById('clientSessionView').style.display = 'none';
            loadCompaniesForSessionSelection(); // Re-load companies for session view
        }
    }
}

function showCompanyDetails(companyId) { // Questa funzione è stata spostata qui per coerenza
    appData.currentCompanyId = companyId; // Assicurati che l'ID dell'azienda corrente sia impostato
    const company = appData.companies.find(c => c.id === companyId);
    document.getElementById('companyDetailsTitle').textContent = company.name;
    renderClientsInModal(company);
    showModal('companyDetailsModal');
}

function addClient() {
    const firstName = document.getElementById('clientFirstName').value.trim();
    const lastName = document.getElementById('clientLastName').value.trim();
    const plannedSessions = parseInt(document.getElementById('plannedSessions').value);
    const hoursPerSession = parseFloat(document.getElementById('hoursPerSession').value);
    
    if (!firstName || !lastName) {
        alert('Inserisci nome e cognome');
        return;
    }
    
    const client = {
        id: Date.now(),
        firstName: firstName,
        lastName: lastName,
        plannedSessions: plannedSessions,
        hoursPerSession: hoursPerSession,
        completedSessions: 0,
        profile: {
            habits: [],
            strengths: [],
            improvementAreas: [],
            compliance: 'good'
        },
        masterElements: [], // Percorso di Coaching objectives
        todos: [],
        sessionHistory: []
    };
    
    // Usa appData.currentCompanyId che dovrebbe essere impostato da showCompanyDetails
    const company = appData.companies.find(c => c.id === appData.currentCompanyId);
    if (company) {
        company.clients.push(client);
        saveDataToLocalStorage();
        closeModal('addClientModal');
        renderClientsInModal(company);
        updateDashboard();
    } else {
        alert('Errore: Azienda non selezionata. Riprova.');
    }
}

function deleteClient(clientId) {
    if (confirm('Sei sicuro di voler eliminare questo cliente?')) {
        const company = appData.companies.find(c => c.id === appData.currentCompanyId);
        company.clients = company.clients.filter(c => c.id !== clientId);
        saveDataToLocalStorage();
        renderClientsInModal(company);
        updateDashboard();
        // If the deleted client was the current one in sessions, reset view
        if (appData.currentClientId === clientId) {
            appData.currentClientId = null;
            document.getElementById('clientSessionView').style.display = 'none';
            renderClientsForSessionSelection(); // Re-render client cards for session
        }
    }
}