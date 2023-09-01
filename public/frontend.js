const inputElement = document.querySelector(".search-input");
const buttonElement = document.querySelector(".search-button");
const searchBar = document.querySelector(".search-bar");
const conversation = document.querySelector(".conversation"); 
const searchSec = document.querySelector(".searchSec");
const amazon_page = document.getElementById('amazon_page');
const loader = document.getElementById('loader'); 






buttonElement.addEventListener("click", async () => {
    loader.style.display = 'block';
    const userInput = inputElement.value;

    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userInput }),
        });

        if (response.ok) {
            loader.style.display = 'none';
            const responseData = await response.json();
            console.log(`AI Browser: ${responseData.response}`);

            // Create a <p> element to display the response
            const responseParagraph = document.createElement('p');
            responseParagraph.textContent = responseData.response;

            // Append the <p> element to the response container
            conversation.appendChild(responseParagraph);

            searchSec.classList.remove('searchSec');
            searchSec.classList.add('searchSec-active');

            conversation.classList.remove('conversation');
            conversation.classList.add('conversation-active');

            searchBar.classList.remove('search-bar');
            searchBar.classList.add('search-bar-active');
            inputElement.value = ''; 
            
        } else {
            loader.style.display = 'none';
            console.error('Error:', response.status);
        }
    } catch (error) {
        loader.style.display = 'none';

        console.error('Fetch error:', error);
    }
});