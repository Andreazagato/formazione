// sessionManagement.js
// Funzioni per la gestione delle sessioni e del profilo cliente

function loadCompaniesForSessionSelection() {
    const select = document.getElementById('sessionCompanySelect');
    select.innerHTML = '<option value="">Seleziona un\'azienda...</option>';
    
    const companyCardsContainer = document.getElementById('sessionCompanyCards');
    companyCardsContainer.innerHTML = ''; // Clear existing cards

    if (appData.companies.length === 0) {
        companyCardsContainer.innerHTML = '<p class="text-center">Nessuna azienda disponibile. Vai su "Aziende" per aggiungerne una.</p>';
    } else {
        appData.companies.forEach(company => {
            // Also populate the select for fallback/alternative selection
            const option = document.createElement('option');
            option.value = company.id;
            option.textContent = company.name;
            select.appendChild(option);

            // Create cards for selection
            const card = document.createElement('div');
            card.className = 'company-card'; // Reuse company-card style
            card.innerHTML = `
                <h3>${company.name}</h3>
                <p>Clienti: ${company.clients.length}</p>
            `;
            card.onclick = () => {
                select.value = company.id; // Update select dropdown
                renderClientsForSessionSelection();
            };
            companyCardsContainer.appendChild(card);
        });
    }

    // Add event listener to the select dropdown
    select.onchange = renderClientsForSessionSelection;

    // Show company selection card, hide client selection and client session view
    document.getElementById('sessionCompanySelectionCard').style.display = 'block';
    document.getElementById('sessionClientSelectionCard').style.display = 'none';
    document.getElementById('clientSessionView').style.display = 'none';
}


function loadClientSession(clientId) {
    const companyId = appData.currentCompanyId; // Usa stored currentCompanyId
    
    if (!companyId || !clientId) {
        document.getElementById('clientSessionView').style.display = 'none';
        return;
    }
    
    appData.currentClientId = clientId;
    
    // Trova l'azienda e il cliente corretti
    const company = appData.companies.find(c => c.id === companyId);
    const client = company ? company.clients.find(c => c.id === clientId) : null;
    
    if (!client) {
        alert('Cliente non trovato. Assicurati che l\'azienda e il cliente siano selezionati correttamente.');
        document.getElementById('clientSessionView').style.display = 'none';
        return;
    }

    displayClientInfo(client);
    displayClientProfile(client);
    displayMasterElements(client);
    displayClientTodos(client);
    displaySessionHistory(client);
    
    // Set default session hours
    document.getElementById('sessionHours').value = client.hoursPerSession;
    
    document.getElementById('clientSessionView').style.display = 'block';
    // Nascondi le card di selezione cliente dopo aver caricato la sessione
    document.getElementById('sessionClientSelectionCard').style.display = 'none';
}

function addHabit() {
    const name = prompt('Nome dell\'abitudine:');
    if (!name) return;
    
    const company = appData.companies.find(c => c.id === appData.currentCompanyId);
    const client = company.clients.find(c => c.id === appData.currentClientId);
    
    client.profile.habits.push({
        name: name,
        category: 'positive'
    });
    
    saveDataToLocalStorage();
    displayClientProfile(client);
}

function removeHabit(index) {
    const company = appData.companies.find(c => c.id === appData.currentCompanyId);
    const client = company.clients.find(c => c.id === appData.currentClientId);
    
    if (confirm('Sei sicuro di voler rimuovere questa abitudine?')) {
        client.profile.habits.splice(index, 1);
        saveDataToLocalStorage();
        displayClientProfile(client);
    }
}

function updateHabitCategory(index, category) {
    const company = appData.companies.find(c => c.id === appData.currentCompanyId);
    const client = company.clients.find(c => c.id === appData.currentClientId);
    
    client.profile.habits[index].category = category;
    saveDataToLocalStorage();
}

function addStrength() {
    const name = prompt('Nome del punto di forza:');
    if (!name) return;
    
    const company = appData.companies.find(c => c.id === appData.currentCompanyId);
    const client = company.clients.find(c => c.id === appData.currentClientId);
    
    client.profile.strengths.push(name);
    
    saveDataToLocalStorage();
    displayClientProfile(client);
}

function removeStrength(index) {
    const company = appData.companies.find(c => c.id === appData.currentCompanyId);
    const client = company.clients.find(c => c.id === appData.currentClientId);
    
    if (confirm('Sei sicuro di voler rimuovere questo punto di forza?')) {
        client.profile.strengths.splice(index, 1);
        saveDataToLocalStorage();
        displayClientProfile(client);
    }
}

function addImprovementArea() {
    const name = prompt('Nome dell\'area di miglioramento:');
    if (!name) return;

    // Chiedi i tag come stringa separata da virgole
    const tagsInput = prompt('Inserisci i tag per questa area di miglioramento (separati da virgola, es: "Urgente, Priorità Alta"):', '');
    const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '') : [];
    
    const company = appData.companies.find(c => c.id === appData.currentCompanyId);
    const client = company.clients.find(c => c.id === appData.currentClientId);
    
    client.profile.improvementAreas.push({ name: name, tags: tags }); // Salva come oggetto con name e tags
    
    saveDataToLocalStorage();
    displayClientProfile(client);
}

function removeImprovementArea(index) {
    const company = appData.companies.find(c => c.id === appData.currentCompanyId);
    const client = company.clients.find(c => c.id === appData.currentClientId);
    
    if (confirm('Sei sicuro di voler rimuovere questa area di miglioramento?')) {
        client.profile.improvementAreas.splice(index, 1);
        saveDataToLocalStorage();
        displayClientProfile(client);
    }
}

// Rimosso updateCompliance()
/*
function updateCompliance() {
    // ...
}
*/

// Coaching Path (formerly Master elements) management
function addMasterElement() { // Renamed to "Add Objective"
    // Create a temporary div to host the select prompt
    const promptDiv = document.createElement('div');
    promptDiv.innerHTML = `
        <p style="margin-bottom: 10px;">Seleziona l'obiettivo:</p>
        <select id="objectiveSelect" class="form-select" style="width: 100%; margin-bottom: 15px;">
            <option value="">-- Seleziona un obiettivo --</option>
            ${appData.categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
        </select>
        <div style="display: flex; justify-content: flex-end; gap: 10px;">
            <button id="promptSaveBtn" class="btn btn-primary btn-sm">Salva</button>
            <button id="promptCancelBtn" class="btn btn-secondary btn-sm">Annulla</button>
        </div>
    `;

    // Create a temporary modal-like overlay for the prompt
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.4);
        z-index: 1001;
        display: flex;
        justify-content: center;
        align-items: center;
        backdrop-filter: blur(3px);
    `;
    const promptContent = document.createElement('div');
    promptContent.style.cssText = `
        background: white;
        padding: 25px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        max-width: 350px;
        width: 90%;
        text-align: left;
    `;
    promptContent.appendChild(promptDiv);
    overlay.appendChild(promptContent);
    document.body.appendChild(overlay);

    const objectiveSelect = promptDiv.querySelector('#objectiveSelect');
    const promptSaveBtn = promptDiv.querySelector('#promptSaveBtn');
    const promptCancelBtn = promptDiv.querySelector('#promptCancelBtn');

    promptSaveBtn.onclick = () => {
        const name = objectiveSelect.value;
        if (!name) {
            alert('Seleziona un obiettivo dalla lista.');
            return;
        }

        const company = appData.companies.find(c => c.id === appData.currentCompanyId);
        const client = company.clients.find(c => c.id === appData.currentClientId);
        
        // Controlla se l'obiettivo esiste già per questo cliente
        const existingObjective = client.masterElements.find(el => el.name === name);
        if (existingObjective) {
            alert('Questo obiettivo esiste già per il cliente.');
            return;
        }

        client.masterElements.push({
            name: name,
            category: name, // Il nome dell'obiettivo è la categoria selezionata
            subElements: []
        });
        
        saveDataToLocalStorage();
        displayMasterElements(client);
        document.body.removeChild(overlay); // Close the custom prompt
    };

    promptCancelBtn.onclick = () => {
        document.body.removeChild(overlay); // Close the custom prompt
    };

    // Auto-focus on the select when it appears
    objectiveSelect.focus();
}


function removeMasterElement(index) { // Renamed to "Remove Objective"
    if (!confirm('Sei sicuro di voler rimuovere questo obiettivo e tutti i suoi micro obiettivi?')) return;
    
    const company = appData.companies.find(c => c.id === appData.currentCompanyId);
    const client = company.clients.find(c => c.id === appData.currentClientId);
    
    client.masterElements.splice(index, 1);
    saveDataToLocalStorage();
    displayMasterElements(client);
}

function addSubElement(masterIndex) { // Renamed to "Add Micro Objective"
    const name = prompt('Nome del micro obiettivo:');
    if (!name) return;
    
    const notes = prompt('Note aggiuntive (opzionale):');

    // Chiedi i tag come stringa separata da virgole
    const tagsInput = prompt('Inserisci i tag per questo micro obiettivo (separati da virgola, es: "Urgente, Priorità Alta"):', '');
    const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '') : [];
    
    const company = appData.companies.find(c => c.id === appData.currentCompanyId);
    const client = company.clients.find(c => c.id === appData.currentClientId);
    
    client.masterElements[masterIndex].subElements.push({
        name: name,
        notes: notes || '',
        completed: false,
        tags: tags // Aggiunto i tag
    });
    
    saveDataToLocalStorage();
    displayMasterElements(client);
}

function toggleSubElement(masterIndex, subIndex) {
    const company = appData.companies.find(c => c.id === appData.currentCompanyId);
    const client = company.clients.find(c => c.id === appData.currentClientId);
    
    client.masterElements[masterIndex].subElements[subIndex].completed = 
        !client.masterElements[masterIndex].subElements[subIndex].completed;
    
    saveDataToLocalStorage();
    displayMasterElements(client);
}

function removeSubElement(masterIndex, subIndex) {
    if (!confirm('Sei sicuro di voler rimuovere questo micro obiettivo?')) return;
    
    const company = appData.companies.find(c => c.id === appData.currentCompanyId);
    const client = company.clients.find(c => c.id === appData.currentClientId);
    
    client.masterElements[masterIndex].subElements.splice(subIndex, 1);
    saveDataToLocalStorage();
    displayMasterElements(client);
}

// Modificata addClientTodo per includere i tag
function addClientTodo() {
    const text = prompt('Inserisci il promemoria per questo cliente:');
    if (!text) return;
    
    // Chiedi i tag come stringa separata da virgole
    const tagsInput = prompt('Inserisci i tag per questo To-Do (separati da virgola, es: "Urgente, Priorità Alta"):', '');
    const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '') : [];

    const company = appData.companies.find(c => c.id === appData.currentCompanyId);
    const client = company.clients.find(c => c.id === appData.currentClientId);
    
    client.todos.push({
        text: text,
        completed: false,
        createdAt: new Date().toISOString(),
        tags: tags // Aggiunto i tag
    });
    
    saveDataToLocalStorage();
    displayClientTodos(client);
}

function saveSession() {
    const company = appData.companies.find(c => c.id === appData.currentCompanyId);
    const client = company.clients.find(c => c.id === appData.currentClientId);
    
    const hours = parseFloat(document.getElementById('sessionHours').value);
    if (isNaN(hours) || hours <= 0) {
        alert('Inserisci un numero di ore valido per la sessione.');
        return;
    }

    const notes = prompt('Note per questa sessione (opzionale):');
    
    const session = {
        date: new Date().toISOString(),
        duration: hours + ' ore',
        notes: notes || '',
        elementsCompleted: client.masterElements.filter(m => 
            m.subElements.every(s => s.completed)
        ).length
    };
    
    client.sessionHistory.push(session);
    client.completedSessions++;
    
    saveDataToLocalStorage();
    displaySessionHistory(client);
    displayClientInfo(client);
    updateDashboard();
    
    alert('Sessione salvata con successo!');
}

function saveClientData() {
    saveDataToLocalStorage();
    alert('Modifiche salvate con successo!');
}

function generateHRReport() {
    const company = appData.companies.find(c => c.id === appData.currentCompanyId);
    const client = appData.companies.find(c => c.id === appData.currentCompanyId)?.clients.find(cl => cl.id === appData.currentClientId);

    if (!client) {
        alert('Nessun cliente selezionato per generare il report.');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80); // Dark blue-grey
    doc.text('Report Coaching Individuale', 20, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(52, 73, 94); // Slightly lighter blue-grey
    doc.text(`Data: ${new Date().toLocaleDateString('it-IT')}`, 20, 35);
    doc.text(`Azienda: ${company.name}`, 20, 45);
    doc.text(`Cliente: ${client.firstName} ${client.lastName}`, 20, 55);

    // Session info
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text('Informazioni Sessioni', 20, 70);
    doc.setFontSize(12);
    doc.setTextColor(52, 73, 94);
    doc.text(`Sessioni completate: ${client.completedSessions}/${client.plannedSessions}`, 20, 80);
    doc.text(`Ore totali di coaching: ${client.completedSessions * client.hoursPerSession}h`, 20, 90);
    
    // Coaching Path (Master elements) completed
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text('Obiettivi Completati del Percorso di Coaching', 20, 110);
    doc.setFontSize(12);
    doc.setTextColor(52, 73, 94);
    
    let yPos = 120;
    const completedObjectives = client.masterElements.filter(m => m.subElements.every(s => s.completed));
    if (completedObjectives.length > 0) {
        completedObjectives.forEach(master => {
            doc.text(`• ${master.name}`, 25, yPos); // Rimosso categoria dal report
            yPos += 10;
        });
    } else {
        doc.text('Nessun obiettivo completato finora.', 25, yPos);
        yPos += 10;
    }
    
    // Strengths
    yPos += 15; // Add some space
    if (client.profile.strengths.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(44, 62, 80);
        doc.text('Punti di Forza', 20, yPos);
        doc.setFontSize(12);
        doc.setTextColor(52, 73, 94);
        yPos += 10;
        
        client.profile.strengths.forEach(strength => {
            doc.text(`• ${strength}`, 25, yPos);
            yPos += 10;
        });
    }

    // Improvement Areas - AGGIUNTA GESTIONE TAG NEL REPORT
    yPos += 15; // Add some space
    if (client.profile.improvementAreas.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(44, 62, 80);
        doc.text('Aree di Miglioramento', 20, yPos);
        doc.setFontSize(12);
        doc.setTextColor(52, 73, 94);
        yPos += 10;
        
        client.profile.improvementAreas.forEach(area => {
            let areaText = `• ${area.name}`;
            if (area.tags && area.tags.length > 0) {
                areaText += ` (Tags: ${area.tags.join(', ')})`;
            }
            doc.text(areaText, 25, yPos);
            yPos += 10;
        });
    }

    // Habits (Optional, if detailed enough for report)
    yPos += 15;
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text('Abitudini Rilevate', 20, yPos);
    doc.setFontSize(12);
    doc.setTextColor(52, 73, 94);
    yPos += 10;

    if (client.profile.habits.length > 0) {
        client.profile.habits.forEach(habit => {
            doc.text(`• ${habit.name} (Categoria: ${habit.category === 'positive' ? 'Positiva' : 'Da migliorare'})`, 25, yPos);
            yPos += 10;
        });
    } else {
        doc.text('Nessuna abitudine rilevata.', 25, yPos);
        yPos += 10;
    }


    // Add a new page for Session History if needed
    if (yPos > 250) { // Arbitrary threshold, adjust as needed
        doc.addPage();
        yPos = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text('Storico Dettaglio Sessioni', 20, yPos + 10);
    doc.setFontSize(10); // Smaller font for history
    doc.setTextColor(52, 73, 94);
    yPos += 20;

    client.sessionHistory.sort((a, b) => new Date(a.date) - new Date(b.date)).forEach(session => {
        const sessionText = `Data: ${new Date(session.date).toLocaleDateString('it-IT')}, Durata: ${session.duration}, Note: ${session.notes || 'N/A'}`;
        const splitText = doc.splitTextToSize(sessionText, 170); // Max width for text
        doc.text(splitText, 25, yPos);
        yPos += (splitText.length * 5) + 5; // Adjust Y position based on lines
        if (yPos > 280) { // Check for page overflow
            doc.addPage();
            yPos = 20;
            doc.setFontSize(10);
            doc.setTextColor(52, 73, 94);
        }
    });


    // Save PDF
    doc.save(`Report_Coaching_${client.firstName}_${client.lastName}_${new Date().toISOString().split('T')[0]}.pdf`);
}