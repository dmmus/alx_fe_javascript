// Initial array of quote objects - this is the fallback if local storage is empty
let quotes = []; 
// References to new DOM elements
const categoryFilter = document.getElementById('categoryFilter');
const allQuotesDisplay = document.getElementById('allQuotesDisplay');

// DOM element references from Task 2
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteButton = document.getElementById('newQuote');

// --- 1. Web Storage Functions (Updated) ---

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
        // Fallback quotes if storage is completely empty (for first run)
        quotes = [
            { text: "The only way to do great work is to love what you do.", category: "Work" },
            { text: "Strive not to be a success, but rather to be of value.", category: "Life" },
            { text: "The best way to predict the future is to create it.", category: "Innovation" }
        ];
        saveQuotes(); // Save the defaults immediately
    }
    
    // Load last selected filter
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

// --- 2. Dynamic Filtering Functions (NEW) ---

/**
 * Extracts unique categories and populates the filter dropdown menu.
 */
function populateCategories() {
    // 1. Extract unique categories
    const categories = ['all', ...new Set(quotes.map(quote => quote.category))];
    
    // 2. Clear existing options (keep the 'All Categories' option)
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    
    // 3. Create and append new options
    categories.forEach(category => {
        if (category !== 'all') {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        }
    });

    // 4. Restore the last selected filter value from Local Storage
    const lastFilter = localStorage.getItem('lastFilterCategory');
    if (lastFilter && categories.includes(lastFilter)) {
        categoryFilter.value = lastFilter;
    } else {
        categoryFilter.value = 'all'; // Default to 'all' if the stored category no longer exists
    }
}

/**
 * Filters the quotes based on the selected category and updates the DOM.
 */
function filterQuotes() {
    const selectedCategory = categoryFilter.value;

    // Save the selected filter for persistence
    saveLastFilter(selectedCategory);

    // 1. Filter the quotes array
    const filteredQuotes = selectedCategory === 'all'
        ? quotes
        : quotes.filter(quote => quote.category === selectedCategory);
    
    // 2. Clear the previous list display
    allQuotesDisplay.innerHTML = '<h3>Filtered Quotes:</h3>';

    // 3. Check if any quotes exist
    if (filteredQuotes.length === 0) {
        const noQuotesMsg = document.createElement('p');
        noQuotesMsg.textContent = selectedCategory === 'all' 
            ? 'No quotes available in the collection.' 
            : `No quotes found for category: ${selectedCategory}.`;
        allQuotesDisplay.appendChild(noQuotesMsg);
        return;
    }

    // 4. Iterate over filtered quotes and update the display
    const ul = document.createElement('ul');
    filteredQuotes.forEach(quote => {
        const li = document.createElement('li');
        li.className = 'quoteItem';
        li.innerHTML = `"${quote.text}" <span class="quoteCategory">(${quote.category})</span>`;
        ul.appendChild(li);
    });

    allQuotesDisplay.appendChild(ul);
    
    // Note: We intentionally don't call showRandomQuote() here, 
    // as filtering is meant for the list view, not the random single quote display.
}


// --- 3. Core Application Functions (Updated) ---

/**
 * Handles adding a new quote, updates storage, and updates categories list.
 */
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
        
        // IMPORTANT: Update categories and filtering after adding a new quote
        populateCategories();
        filterQuotes();

        quoteTextInput.value = '';
        categoryInput.value = '';

        alert('Quote added, categories updated, and data saved!');
        showRandomQuote(); 

    } else {
        alert('Please enter both the quote text and the category.');
    }
}

// ... (showRandomQuote(), createAddQuoteForm(), exportToJsonFile(), importFromJsonFile() from Task 2 are included below) ...

// --- (Task 2: Functions for Random Quote and Session Storage) ---
function saveLastViewedQuote(quote) {
    sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));
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

    saveLastViewedQuote(quote);
}

// --- (Task 2: Functions for Form Creation) ---
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

    formContainer.appendChild(quoteTextInput);
    formContainer.appendChild(categoryInput);
    formContainer.appendChild(addButton);

    newQuoteButton.parentNode.insertBefore(formContainer, newQuoteButton.nextSibling);
}

// --- (Task 2: Functions for JSON Export/Import) ---
function exportToJsonFile() {
    const jsonString = JSON.stringify(quotes, null, 2); 
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes_export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
    const fileReader = new FileReader();

    fileReader.onload = function(event) {
        try {
            const importedQuotes = JSON.parse(event.target.result);
            if (!Array.isArray(importedQuotes) || importedQuotes.some(q => !q.text || !q.category)) {
                alert('Invalid JSON format. Expected an array of objects with "text" and "category" keys.');
                return;
            }

            quotes.push(...importedQuotes);
            saveQuotes(); 
            
            // IMPORTANT: Update categories and filtering after import
            populateCategories();
            filterQuotes();

            alert(`Successfully imported ${importedQuotes.length} quotes!`);

        } catch (e) {
            alert('Error parsing JSON file. Please ensure the file is valid.');
            console.error(e);
        }
    };
    
    if (event.target.files.length > 0) {
        fileReader.readAsText(event.target.files[0]);
    }
}


// --- 4. Initialization and Event Listeners ---

// 1. Add event listener to the existing HTML button
newQuoteButton.addEventListener('click', showRandomQuote);

// 2. Initial actions when the script loads:
document.addEventListener('DOMContentLoaded', () => {
    // 1. Load data from storage (quotes and last filter)
    loadQuotes(); 
    
    // 2. Populate the categories dropdown based on loaded data
    populateCategories();
    
    // 3. Display a random quote
    showRandomQuote();

    // 4. Create the Add Quote form
    createAddQuoteForm();

    // 5. Apply the initial (or persisted) filter to the list display
    filterQuotes();
});