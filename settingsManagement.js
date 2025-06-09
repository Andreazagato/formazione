// settingsManagement.js
// Funzioni per la gestione delle impostazioni

function addCategory() {
    const input = document.getElementById('newCategoryInput');
    const category = input.value.trim();
    
    if (!category) {
        alert('Inserisci il nome della categoria');
        return;
    }
    if (appData.categories.includes(category)) {
        alert('Questa categoria esiste già');
        return;
    }
    
    appData.categories.push(category);
    input.value = '';
    saveDataToLocalStorage();
    renderCategories();
}

function removeCategory(index) {
    if (confirm('Sei sicuro di voler eliminare questa categoria?')) {
        appData.categories.splice(index, 1);
        saveDataToLocalStorage();
        renderCategories();
    }
}

function addTag() {
    const input = document.getElementById('newTagInput');
    const tag = input.value.trim();
    
    if (!tag) {
        alert('Inserisci il nome del tag');
        return;
    }
    if (appData.tags.includes(tag)) {
        alert('Questo tag esiste già');
        return;
    }
    
    appData.tags.push(tag);
    input.value = '';
    saveDataToLocalStorage();
    renderTags();
}

function removeTag(index) {
    if (confirm('Sei sicuro di voler eliminare questo tag?')) {
        appData.tags.splice(index, 1);
        saveDataToLocalStorage();
        renderTags();
    }
}