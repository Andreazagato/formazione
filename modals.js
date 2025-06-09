// modals.js
// Funzioni per la gestione delle finestre modali

function showModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function showAddCompanyModal() {
    document.getElementById('companyName').value = '';
    showModal('addCompanyModal');
}

function showAddClientModal() {
    document.getElementById('clientFirstName').value = '';
    document.getElementById('clientLastName').value = '';
    document.getElementById('plannedSessions').value = '10';
    document.getElementById('hoursPerSession').value = '1.5';
    showModal('addClientModal');
}
