// Initial array of quote objects
let quotes = [
    { text: "The only way to do great work is to love what you do.", category: "Work" },
    { text: "Strive not to be a success, but rather to be of value.", category: "Life" },
    { text: "The mind is everything. What you think you become.", category: "Philosophy" },
    { text: "The best way to predict the future is to create it.", category: "Innovation" }
];

// DOM element references
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteButton = document.getElementById('newQuote');

/**
 * Selects a random quote and updates the DOM to display it.
 */
function showRandomQuote() {
    if (quotes.length === 0) {
        quoteDisplay.innerHTML = '<p>No quotes available!</p>';
        return;
    }

    // Generate a random index
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
}

/**
 * Dynamically creates and injects the Add Quote form into the DOM.
 */
function createAddQuoteForm() {
    // 1. Create the main container div
    const formContainer = document.createElement('div');
    formContainer.id = 'addQuoteFormContainer';
    formContainer.style.marginTop = '20px';
    formContainer.style.padding = '15px';
    formContainer.style.border = '1px solid #ccc';
    formContainer.style.borderRadius = '5px';

    // 2. Create the Quote Text input
    const quoteTextInput = document.createElement('input');
    quoteTextInput.id = 'newQuoteText';
    quoteTextInput.type = 'text';
    quoteTextInput.placeholder = 'Enter a new quote';
    quoteTextInput.style.marginRight = '10px';
    quoteTextInput.style.padding = '8px';

    // 3. Create the Category input
    const categoryInput = document.createElement('input');
    categoryInput.id = 'newQuoteCategory';
    categoryInput.type = 'text';
    categoryInput.placeholder = 'Enter quote category';
    categoryInput.style.marginRight = '10px';
    categoryInput.style.padding = '8px';

    // 4. Create the Add Quote button
    const addButton = document.createElement('button');
    addButton.textContent = 'Add Quote';
    // ATTENTION: We attach the 'addQuote' function directly to the click event
    addButton.onclick = addQuote; 
    addButton.style.padding = '8px 15px';

    // 5. Append all elements to the container
    formContainer.appendChild(quoteTextInput);
    formContainer.appendChild(categoryInput);
    formContainer.appendChild(addButton);

    // 6. Append the form container to the body (or another suitable parent)
    // We'll insert it right after the New Quote button.
    newQuoteButton.parentNode.insertBefore(formContainer, newQuoteButton.nextSibling);
}

/**
 * Handles adding a new quote from the form input.
 * Called when the 'Add Quote' button is clicked.
 */
function addQuote() {
    // Get the input elements (now that they are guaranteed to exist in the DOM)
    const quoteTextInput = document.getElementById('newQuoteText');
    const categoryInput = document.getElementById('newQuoteCategory');

    const newQuoteText = quoteTextInput.value.trim();
    const newQuoteCategory = categoryInput.value.trim();

    if (newQuoteText && newQuoteCategory) {
        // Add the new quote object to the array
        quotes.push({ 
            text: newQuoteText, 
            category: newQuoteCategory 
        });

        // Clear the input fields
        quoteTextInput.value = '';
        categoryInput.value = '';

        // Provide user feedback (optional but good practice)
        alert('Quote added successfully!');

        // Optional: Show the newly added quote
        showRandomQuote(); 

    } else {
        alert('Please enter both the quote text and the category.');
    }
}

// --- Initial Setup and Event Listeners ---

// 1. Add event listener to the existing HTML button
newQuoteButton.addEventListener('click', showRandomQuote);

// 2. Initial actions when the script loads:
//    a. Show a quote immediately
document.addEventListener('DOMContentLoaded', () => {
    showRandomQuote();
    //    b. Dynamically create and display the Add Quote form
    createAddQuoteForm();
});