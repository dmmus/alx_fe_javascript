// Initial array of quote objects - this is the fallback if local storage is empty
let quotes = [
    { text: "The only way to do great work is to love what you do.", category: "Work" },
    { text: "Strive not to be a success, but rather to be of value.", category: "Life" },
    { text: "The best way to predict the future is to create it.", category: "Innovation" }
];

// DOM element references
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteButton = document.getElementById('newQuote');

// --- 1. Web Storage Functions ---

/**
 * Loads quotes from Local Storage or uses the default array if storage is empty.
 */
function loadQuotes() {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        try {
            quotes = JSON.parse(storedQuotes);
        } catch (e) {
            console.error("Could not parse stored quotes:", e);
            // Fallback to default quotes if parsing fails
        }
    }
}

/**
 * Saves the current quotes array to Local Storage.
 */
function saveQuotes() {
    // Convert the JavaScript array to a JSON string before saving
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

/**
 * Demonstrates Session Storage by saving the last viewed quote.
 * @param {object} quote - The quote object that was just displayed.
 */
function saveLastViewedQuote(quote) {
    sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));
    console.log("Last viewed quote saved to Session Storage:", quote.text);
}


// --- 2. Core Application Functions ---

/**
 * Selects a random quote, displays it, and saves it to session storage.
 */
function showRandomQuote() {
    if (quotes.length === 0) {
        quoteDisplay.innerHTML = '<p>No quotes available! Add a new one or import from JSON.</p>';
        return;
    }

    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];

    // Clear previous content
    quoteDisplay.innerHTML = '';

    // Create and append the quote text element
    const quoteTextElement = document.createElement('p');
    quoteTextElement.textContent = `"${quote.text}"`;
    quoteTextElement.style.fontSize = '1.5em';
    quoteTextElement.style.fontStyle = 'italic';
    quoteDisplay.appendChild(quoteTextElement);
    
    // Create and append the category element
    const categoryElement = document.createElement('span');
    categoryElement.textContent = `- Category: ${quote.category}`;
    categoryElement.style.display = 'block';
    categoryElement.style.marginTop = '10px';
    categoryElement.style.color = '#555';
    quoteDisplay.appendChild(categoryElement);

    // Session Storage: save the displayed quote
    saveLastViewedQuote(quote);
}

/**
 * Dynamically creates and injects the Add Quote form into the DOM. (From Task 1)
 */
function createAddQuoteForm() {
    // ... (Your createAddQuoteForm implementation from Task 1 goes here) ...
    // Note: To keep the code clean, the full body is omitted here, 
    // but you would paste the entire function from the Task 1 solution.
    
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

    // Insert the form right after the New Quote button
    newQuoteButton.parentNode.insertBefore(formContainer, newQuoteButton.nextSibling);
}

/**
 * Handles adding a new quote and saving the updated list to Local Storage.
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

        // Local Storage: Save the updated quotes array
        saveQuotes(); 

        // Clear the input fields
        quoteTextInput.value = '';
        categoryInput.value = '';

        alert('Quote added and saved successfully!');
        showRandomQuote(); 

    } else {
        alert('Please enter both the quote text and the category.');
    }
}


// --- 3. JSON Import and Export Functions ---

/**
 * Exports the current quotes array to a downloadable JSON file.
 * Uses Blob and URL.createObjectURL for dynamic file generation.
 */
function exportToJsonFile() {
    const jsonString = JSON.stringify(quotes, null, 2); // null, 2 for pretty printing

    // 1. Create a Blob from the JSON string
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // 2. Create a temporary URL for the Blob
    const url = URL.createObjectURL(blob);
    
    // 3. Create a temporary <a> element for downloading
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes_export.json';
    
    // 4. Programmatically click the link to trigger download
    document.body.appendChild(a);
    a.click();
    
    // 5. Clean up the temporary URL and element
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Imports quotes from a file selected by the user, updates the array, and saves to Local Storage.
 * @param {Event} event - The change event from the file input.
 */
function importFromJsonFile(event) {
    const fileReader = new FileReader();

    fileReader.onload = function(event) {
        try {
            const importedQuotes = JSON.parse(event.target.result);
            
            // Basic validation: Check if it's an array of objects
            if (!Array.isArray(importedQuotes) || importedQuotes.some(q => !q.text || !q.category)) {
                alert('Invalid JSON format. Expected an array of objects with "text" and "category" keys.');
                return;
            }

            // Append the new quotes to the existing array
            quotes.push(...importedQuotes);

            // Save the combined list back to Local Storage
            saveQuotes(); 
            showRandomQuote(); // Update display with a random quote

            alert(`Successfully imported ${importedQuotes.length} quotes!`);

        } catch (e) {
            alert('Error parsing JSON file. Please ensure the file is valid.');
            console.error(e);
        }
    };
    
    // Start reading the file as text
    if (event.target.files.length > 0) {
        fileReader.readAsText(event.target.files[0]);
    }
}


// --- 4. Initialization and Event Listeners ---

// 1. Add event listener to the existing HTML button
newQuoteButton.addEventListener('click', showRandomQuote);

// 2. Initial actions when the script loads:
document.addEventListener('DOMContentLoaded', () => {
    // IMPORTANT: Load quotes from storage FIRST
    loadQuotes(); 
    
    // Then display a quote and create the form
    showRandomQuote();
    createAddQuoteForm();
});