// utils.js
// Funzioni di utilità

function saveDataToLocalStorage() {
    localStorage.setItem('mentalCoachingData', JSON.stringify(appData));
}

function loadDataFromLocalStorage() {
    const savedData = localStorage.getItem('mentalCoachingData');
    if (savedData) {
        appData = JSON.parse(savedData);
    }
}

function exportAllData() {
    const dataStr = JSON.stringify(appData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MentalCoaching_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    alert('Dati esportati con successo!');
}

function importData() {
    document.getElementById('importFile').click();
}

function handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (confirm('Questo sovrascriverà tutti i dati esistenti. Continuare?')) {
                // Basic validation for imported data structure
                if (importedData.companies && importedData.categories && importedData.tags) {
                    appData = importedData;
                    saveDataToLocalStorage();
                    location.reload(); // Reload to reinitialize with new data
                } else {
                    alert('Il file importato non sembra essere un file di dati valido per questa applicazione.');
                }
            }
        } catch (error) {
            console.error('Errore durante l\'importazione del file:', error);
            alert('Errore nell\'importazione del file: ' + error.message);
        }
    };
    reader.readAsText(file);
}