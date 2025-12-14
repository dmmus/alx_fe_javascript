// ====================================================================
// GLOBAL DATA AND REFERENCES
// ====================================================================

// Local Data Store (Primary source of truth for the client)
let quotes = []; 

// Mock Server Data Store (Simulates the remote database)
let serverQuotes = [
    { id: 101, text: "Server quote 1: Consistency is key.", category: "Sync" },
    { id: 102, text: "Server quote 2: Data integrity matters.", category: "Sync" }
];
let nextServerId = 103; // ID generator for new server-side quotes

// DOM element references
const categoryFilter = document.getElementById('categoryFilter');
const allQuotesDisplay = document.getElementById('allQuotesDisplay');
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteButton = document.getElementById('newQuote');

// New element for status/conflict notification
const syncStatus = document.createElement('p'); 
syncStatus.id = 'syncStatus';
syncStatus.style.marginTop = '15px';
syncStatus.style.fontWeight = 'bold';
syncStatus.style.color = 'darkgreen';


// ====================================================================
// 1. Web Storage and Server Simulation Functions
// ====================================================================

/**
 * Loads quotes and the last selected filter from Local Storage.
 */
function loadQuotes() {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        try {
            quotes = JSON.parse(storedQuotes);
        } catch (e) {
            console.error("Could not parse stored quotes:", e);
        }
    } else {
        // Fallback quotes (for first run)
        quotes = [
            { id: 1, text: "Welcome! Add a quote or sync with server.", category: "Intro" }
        ];
        saveQuotes(); 
    }
    
    const lastFilter = localStorage.getItem('lastFilterCategory');
    if (lastFilter && categoryFilter) {
        categoryFilter.value = lastFilter;
    }
}

/**
 * Saves the current quotes array to Local Storage.
 */
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

/**
 * Saves the currently selected category filter to Local Storage.
 */
function saveLastFilter(category) {
    localStorage.setItem('lastFilterCategory', category);
}

// --- Server Mock Functions ---

/**
 * **CORRECTED NAME:** Simulates fetching data from the server.
 * Uses a Promise and setTimeout to mock network latency.
 */
function fetchQuotesFromServer() {
    return new Promise(resolve => {
        setTimeout(() => {
            // Deep copy to prevent direct mutation of serverQuotes
            resolve(JSON.parse(JSON.stringify(serverQuotes))); 
        }, 1500);
    });
}

/**
 * Mock function to simulate pushing local changes to the server.
 */
function mockPushToServer() {
    const newLocalQuotes = quotes.filter(q => !q.id);
    
    newLocalQuotes.forEach(q => {
        // Assign a unique server ID to the new quote
        q.id = nextServerId++;
        serverQuotes.push(q);
    });

    return new Promise(resolve => {
        setTimeout(() => {
            resolve(newLocalQuotes.length);
        }, 800);
    });
}


// ====================================================================
// 2. Data Sync and Conflict Resolution Logic (Updated)
// ====================================================================

/**
 * Performs bi-directional data synchronization and resolves conflicts.
 * Strategy: Server data takes precedence.
 */
async function syncData() {
    updateSyncStatus("Syncing data... please wait.", 'orange');
    
    try {
        // 1. PUSH: Push new local quotes to the mock server
        const pushedCount = await mockPushToServer();
        if (pushedCount > 0) {
            // Update local IDs after push
            saveQuotes(); 
            console.log(`Pushed ${pushedCount} new local quotes to server.`);
        }

        // 2. PULL: Fetch the complete, authoritative data from the server
        const serverData = await fetchQuotesFromServer(); // *** RENAMED CALL ***
        
        // 3. CONFLICT RESOLUTION (Server Precedence Strategy)
        const localQuoteIds = new Set(quotes.map(q => q.id).filter(id => id));

        let conflictsResolved = 0;
        let newQuotesAdded = 0;
        
        const newLocalQuotes = [];
        
        serverData.forEach(serverQuote => {
            const isNew = !localQuoteIds.has(serverQuote.id);
            
            if (isNew) {
                newQuotesAdded++;
            } else {
                // Conflict check
                const localVersion = quotes.find(q => q.id === serverQuote.id);
                if (localVersion && (localVersion.text !== serverQuote.text || localVersion.category !== serverQuote.category)) {
                    conflictsResolved++;
                }
            }
            newLocalQuotes.push(serverQuote); // Server quote always wins and is added
        });
        
        // Add local-only (unsynced) quotes back to the list.
        const unsyncedLocalQuotes = quotes.filter(q => !q.id);
        newLocalQuotes.push(...unsyncedLocalQuotes);

        // 4. Update local state and storage
        quotes = newLocalQuotes;
        saveQuotes();
        
        // 5. Update UI based on sync results
        populateCategories();
        filterQuotes();
        showRandomQuote();

        let message = `Sync complete. ${newQuotesAdded} new quotes added from server.`;
        if (conflictsResolved > 0) {
            message += ` ${conflictsResolved} conflicts resolved (server version kept).`;
            updateSyncStatus(message, 'red');
        } else if (newQuotesAdded > 0 || pushedCount > 0) {
            updateSyncStatus(message, 'blue');
        } else {
            updateSyncStatus("Sync complete. Data is consistent.", 'darkgreen');
        }

    } catch (error) {
        console.error("Sync failed:", error);
        updateSyncStatus("Sync failed. Check console for details.", 'red');
    }
}

/**
 * Updates the UI notification system.
 */
function updateSyncStatus(message, color) {
    syncStatus.textContent = message;
    syncStatus.style.color = color;
}

// ====================================================================
// 3. Core Application Functions
// ====================================================================

function addQuote() {
    const quoteTextInput = document.getElementById('newQuoteText');
    const categoryInput = document.getElementById('newQuoteCategory');

    const newQuoteText = quoteTextInput.value.trim();
    const newQuoteCategory = categoryInput.value.trim();

    if (newQuoteText && newQuoteCategory) {
        quotes.push({ 
            text: newQuoteText, 
            category: newQuoteCategory 
        });

        saveQuotes(); 
        populateCategories();
        filterQuotes();

        quoteTextInput.value = '';
        categoryInput.value = '';

        updateSyncStatus("New quote added locally. Sync required.", 'purple');
        showRandomQuote(); 

    } else {
        alert('Please enter both the quote text and the category.');
    }
}

function populateCategories() {
    const categories = ['all', ...new Set(quotes.map(quote => quote.category))];
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    
    categories.forEach(category => {
        if (category !== 'all') {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        }
    });

    const lastFilter = localStorage.getItem('lastFilterCategory');
    if (lastFilter && categories.includes(lastFilter)) {
        categoryFilter.value = lastFilter;
    } else {
        categoryFilter.value = 'all'; 
    }
}

function filterQuotes() {
    const selectedCategory = categoryFilter.value;
    saveLastFilter(selectedCategory);

    const filteredQuotes = selectedCategory === 'all'
        ? quotes
        : quotes.filter(quote => quote.category === selectedCategory);
    
    allQuotesDisplay.innerHTML = '<h3>Filtered Quotes:</h3>';

    if (filteredQuotes.length === 0) {
        const noQuotesMsg = document.createElement('p');
        noQuotesMsg.textContent = selectedCategory === 'all' 
            ? 'No quotes available in the collection.' 
            : `No quotes found for category: ${selectedCategory}.`;
        allQuotesDisplay.appendChild(noQuotesMsg);
        return;
    }

    const ul = document.createElement('ul');
    filteredQuotes.forEach(quote => {
        const li = document.createElement('li');
        li.className = 'quoteItem';
        const idTag = quote.id ? ` (ID: ${quote.id})` : ' (Unsynced)'; 
        li.innerHTML = `"${quote.text}" <span class="quoteCategory">(${quote.category})${idTag}</span>`;
        ul.appendChild(li);
    });

    allQuotesDisplay.appendChild(ul);
}

function showRandomQuote() {
    if (quotes.length === 0) {
        quoteDisplay.innerHTML = '<p>No quotes available! Add a new one or import from JSON.</p>';
        return;
    }

    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];

    quoteDisplay.innerHTML = '';
    const quoteTextElement = document.createElement('p');
    quoteTextElement.textContent = `"${quote.text}"`;
    quoteTextElement.style.fontSize = '1.5em';
    quoteTextElement.style.fontStyle = 'italic';
    quoteDisplay.appendChild(quoteTextElement);
    
    const categoryElement = document.createElement('span');
    categoryElement.textContent = `- Category: ${quote.category}`;
    categoryElement.style.display = 'block';
    categoryElement.style.marginTop = '10px';
    categoryElement.style.color = '#555';
    quoteDisplay.appendChild(categoryElement);
}

function createAddQuoteForm() {
    const formContainer = document.createElement('div');
    formContainer.id = 'addQuoteFormContainer';
    formContainer.style.marginTop = '20px';
    formContainer.style.padding = '15px';
    formContainer.style.border = '1px solid #ccc';
    formContainer.style.borderRadius = '5px';

    const quoteTextInput = document.createElement('input');
    quoteTextInput.id = 'newQuoteText';
    quoteTextInput.type = 'text';
    quoteTextInput.placeholder = 'Enter a new quote';
    quoteTextInput.style.marginRight = '10px';
    quoteTextInput.style.padding = '8px';

    const categoryInput = document.createElement('input');
    categoryInput.id = 'newQuoteCategory';
    categoryInput.type = 'text';
    categoryInput.placeholder = 'Enter quote category';
    categoryInput.style.marginRight = '10px';
    categoryInput.style.padding = '8px';

    const addButton = document.createElement('button');
    addButton.textContent = 'Add Quote';
    addButton.onclick = addQuote; 
    addButton.style.padding = '8px 15px';

    const syncButton = document.createElement('button');
    syncButton.textContent = 'Manual Sync';
    syncButton.onclick = syncData;
    syncButton.style.padding = '8px 15px';
    syncButton.style.backgroundColor = '#007bff';
    syncButton.style.color = 'white';

    formContainer.appendChild(quoteTextInput);
    formContainer.appendChild(categoryInput);
    formContainer.appendChild(addButton);
    formContainer.appendChild(syncButton);

    newQuoteButton.parentNode.insertBefore(formContainer, newQuoteButton.nextSibling);
    formContainer.parentNode.insertBefore(syncStatus, formContainer.nextSibling); 
}

// Dummy functions for JSON handling (used in Task 3)
function exportToJsonFile() { console.log("Export feature ready."); }
function importFromJsonFile(event) { console.log("Import feature ready."); }


// ====================================================================
// 4. Initialization and Periodic Sync
// ====================================================================

newQuoteButton.addEventListener('click', showRandomQuote);

document.addEventListener('DOMContentLoaded', () => {
    loadQuotes(); 
    populateCategories();
    showRandomQuote();
    createAddQuoteForm(); 

    // Implement Periodic Sync
    setInterval(syncData, 30000); 

    // Perform an initial sync on load
    syncData();
});