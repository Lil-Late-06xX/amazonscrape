const addButton = document.getElementById('addButton');
const searchBar = document.getElementById('searchBar');
const hiddenList = document.getElementById('hiddenList');
const product = document.getElementById('product');


document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/amazon_page', {});
        if (response.ok) {
            const data = await response.json();
            const rowData = data.existing_products;

            if (rowData) {
                const uniqueUserInputs = [...new Set(Object.values(rowData).map(item => item.userinput))];

                uniqueUserInputs.forEach(userInput => {
                    const li = document.createElement('li');
                    const a = document.createElement('a');
                    a.classList.add('product')
                    a.href = '#';
                    a.textContent = userInput;
                    li.appendChild(a);
                    hiddenList.appendChild(li);
                });
            }
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
});






addButton.addEventListener("click", async () => {
    loader.style.display = 'block';
    const userInput = searchBar.value;

    try {
        const response = await fetch('/amazon', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userInput }),
        });

        if (response.ok) {
            loader.style.display = 'none';
            const data = await response.json();
            const newRowData = data.rowData;


            if (newRowData.length === 0) {
                alert('No data found');
                searchBar.value = '';
                return;
            }

            const li = document.createElement('li');

            li.innerHTML += `
                <a href="#" class="product">${userInput}</a>
            `;
            hiddenList.appendChild(li);
            searchBar.value = '';

            newRowData.forEach((item) => {
                console.log(item);
            });

        } else {
            console.error('Error:', response.status);
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
});





function displayMySQLData(data) {
    const mysqlDataDiv = document.getElementById('mysql_data');
    mysqlDataDiv.innerHTML = ''; // Clear previous content

    const table = document.createElement('table');
    table.classList.add('mysql-table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Date Scraped</th>
                <th>Details</th>
                <th>Price</th>
                <th>Rating</th>
                <th>Review Count</th>
                <th>Image</th>
            </tr>
        </thead>
        <tbody>
            ${data.map(item => `
                <tr>
                    <td>${item.created}</td>
                    <td>${item.details}</td>
                    <td>${item.price}</td>
                    <td>${item.rating}</td>
                    <td>${item.reviewCount}</td>
                    <td><img src="${item.imageSrc}" alt="Product Image" width="50"></td>
                </tr>
            `).join('')}
        </tbody>
    `;

    mysqlDataDiv.appendChild(table);
}







hiddenList.addEventListener("click", async (event) => {
    const clickedElement = event.target;

    if (clickedElement.matches(".product")) {
        const productName = clickedElement.innerText;

        try {
            const response = await fetch('/searchProduct', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ productName }),
            });

            if (response.ok) {
                const data = await response.json();
                const mysqlData = data.mysqlData;

                // Call a function to display the MySQL data in a table
                displayMySQLData(mysqlData);
            } else {
                console.error('Error:', response.status);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        }
    }
});



hiddenList.addEventListener("dblclick", async (event) => {
    const clickedElement = event.target;

    if (clickedElement.matches(".product")) {
        
        const productName = clickedElement.innerText;
        location.reload();
        


        // Remove item from the database with matching user input
        try {
            const response = await fetch('/remove', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userInput: productName }),
                
            });
            

            if (response.ok) {

                console.log('data deleted from database');
                

            } else {
                console.error('Error:', response.status);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        }
    }
});

