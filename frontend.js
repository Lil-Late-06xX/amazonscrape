const inputElement = document.querySelector(".search-input");
const buttonElement = document.querySelector(".search-button");

buttonElement.addEventListener("click", async () => {
    const userInput = inputElement.value;

    const response = await fetch('/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userInput }),
    }).then(response => response.json());

    console.log(`AI: ${response.response}`);
});
