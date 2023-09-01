const baseURL = "https://www.amazon.com";


const userInput = 'feet rubs';
const searchURL = `${baseURL}/s?k=${encodeURIComponent(userInput)}`;

console.log(searchURL);




app.get('/', async (req, res) => {
    try {
        const connection = await getConnection();
        await connection.query('USE amazon');

        const query = 'SELECT * FROM prodDets';
        const [rows] = await connection.query(query);

        connection.end();

        const existing_products = rows;

        res.render('index', { existing_products });
        console.log(existing_products); // Render the HTML template with the data
    } catch (error) {
        console.error('Error fetching existing products:', error);
        res.status(500).send('Error fetching existing products');
    }
});