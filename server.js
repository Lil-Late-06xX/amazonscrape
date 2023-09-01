import express from 'express';
import path from 'path';
import ejs from 'ejs';
import OpenAIApi from 'openai';
import puppeteer from 'puppeteer';
import { load } from 'cheerio';
import dotenv from 'dotenv';
import getConnection from './db-con.js';
dotenv.config();

const app = express();
const port = 8000;
app.use(express.static('public'));
app.use(express.json());

const __dirname = path.dirname(new URL(import.meta.url).pathname);



const openai = new OpenAIApi({
    apiKey: process.env.OPENAI_API_KEY,
});


// serve files from the public directory // --------------------------------------------------------------------------------------------

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});


// first page AI chat // --------------------------------------------------------------------------------------------

app.post('/chat', async (req, res) => {
    const userInput = req.body.userInput;

    const chatCompletion = await openai.chat.completions.create({
        messages: [{ role: "user", content: userInput }],
        model: "gpt-3.5-turbo",
    });

    const response = chatCompletion.choices[0].message.content;
    console.log(`AI Server : ${response}`);
    console.log('------------------------------------------------');

    res.json({ response });
});


// Amazon scraping routes  // --------------------------------------------------------------------------------------------

app.get('/amazon_page', async (req, res) => {
    try {
        const connection = await getConnection();

        // Check if the "amazon" database exists, and create it if not
        await connection.query('CREATE DATABASE IF NOT EXISTS amazon');
        await connection.query('USE amazon');

        // Check if the "prodDets" table exists, and create it if not
        const createTableQuery = `
        CREATE TABLE IF NOT EXISTS prodDets (
            userinput VARCHAR(255),
            id INT AUTO_INCREMENT PRIMARY KEY,
            details VARCHAR(255),
            price DECIMAL(10, 2),
            rating VARCHAR(30),
            reviewCount VARCHAR(30),
            imageSrc VARCHAR(255),
            created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            
        
        )
    `;
        await connection.query(createTableQuery);

        // Fetch existing products from the "prodDets" table
        const query = 'SELECT * FROM prodDets';
        const [rows] = await connection.query(query);

        connection.end();

        const existing_products = rows;
        res.json({ existing_products });

    } catch (error) {
        console.error('Error fetching existing products:', error);
        res.status(500).send('Error fetching existing products');
    }
});



app.post('/amazon', async (req, res) => {
    const userInput = req.body.userInput;
    const baseURL = "https://www.amazon.com";
    const searchURL = `${baseURL}/s?k=${encodeURIComponent(userInput)}`;

    const rowData = [];

    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(searchURL);

        // Wait for a specific indicator that the results are loaded
        await page.waitForSelector('.s-main-slot', { timeout: 60000 });

        const content = await page.content();
        const $ = load(content);

        $('.sg-row').each((index, element) => {
            const details = $(element).find('.a-size-medium').first().text().trim();
            const price = $(element).find('.a-price .a-offscreen').first().text().trim();
            let rating = $(element).find('.a-icon-star-small .a-icon-alt').first().text().trim();
            let reviewCount = $(element).find('.a-link-normal span').eq(1).text().trim();
            const imageSrc = $(element).find('.s-product-image-container img.s-image').attr('src');

            reviewCount = reviewCount.replace(',', '');

            if (details && price && details.length > 10) {
                if (reviewCount.length > 4 ) {
                    reviewCount = 'No reviews';
                        if (rating == '') {

                            rating = 'No rating';
                            
                        }
                }
                rowData.push({
                    userInput,
                    details,
                    price,
                    rating,
                    reviewCount,
                    imageSrc
                });
            }
        });

        // Send the rowData to your server
        const serverResponse = await fetch('http://localhost:8000/store', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ rowData }),
        });
    
        if (serverResponse.ok) {
            const serverData = await serverResponse.json();
            console.log('Data sent to server:', serverData);
        } else {
            console.error('Error sending data to server:', serverResponse.status);
        }
    
        await browser.close();
    } catch (error) {
        console.error('Error scraping data:', error);
    }

    res.json({ rowData });


});




app.post('/searchProduct', async (req, res) => {
    const { productName } = req.body;


    try {
        const connection = await getConnection();
        await connection.query('USE amazon');

        const query = 'SELECT * FROM prodDets WHERE userinput = ?';

        const [rows] = await connection.query(query, [productName]);

        connection.end();

        res.json({ mysqlData: rows });
    } catch (error) {
        console.error('Database search error:', error);
        res.status(500).json({ message: 'Error searching the database' });
    }
});



app.post('/store', async (req, res) => {
    const { rowData } = req.body;

    try {
        const connection = await getConnection();

        // Check if the database exists, if not, create it
        await connection.query('CREATE DATABASE IF NOT EXISTS amazon');
        await connection.query('USE amazon');

        // Define the table if it doesn't exist, adjust the column types accordingly
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS prodDets (
                userinput VARCHAR(255),
                id INT AUTO_INCREMENT PRIMARY KEY,
                details VARCHAR(255),
                price DECIMAL(10, 2),
                rating VARCHAR(30),
                reviewCount VARCHAR(30),
                imageSrc VARCHAR(255),
                created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                
            
            )
        `;
        await connection.query(createTableQuery);

        // Insert rowData into the MySQL database
        for (const data of rowData) {
            const priceValue = parseFloat(data.price.replace('$', ''));
            const query = 'INSERT INTO prodDets (userinput, details, price, rating, reviewCount, imageSrc ) VALUES (?, ?, ?, ?, ?, ?)';
            await connection.query(query, [
                data.userInput,
                data.details,
                priceValue,
                data.rating,
                data.reviewCount,
                data.imageSrc,
            ]);
        }

        console.log('Data inserted into database');

        connection.end(); // Close the connection

        res.status(200).json({ message: 'Data inserted into database' });
    } catch (error) {
        console.error('Database insertion error:', error);
        res.status(500).json({ message: 'Error inserting data into the database' });
    }
});

app.post('/remove', async (req, res) => {
    const { userInput } = req.body;
    const connection = await getConnection();
    await connection.query('USE amazon');

    const sql = 'DELETE FROM prodDets WHERE userInput = ?';

    connection.query(sql, [userInput], (err, result) => {
        if (err) {
            console.error('SQL error:', err);
            res.status(500).send('Internal server error');
        } else if (result.affectedRows === 0) {
            res.status(404).send('Item not found.');
        } else {
            console.log('200 / ok removed respons');
            res.status(200).send('Item removed successfully.');
        }
    });
});

// footbal scraping routes  // --------------------------------------------------------------------------------------------     

async function scrapeData() {
    const url = 'https://1koora.elkoora.live/';
    const matches = [];
  
    try {
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto(url);
  
      const content = await page.content();
      const $ = load(content);
  
      $('.match-event').each((index, element) => {

        const title = $(element).find('.match-event a').attr('title');
        const rightTeamName = $(element).find('.right-team .team-name').text().trim();
        const rightLogo = $(element).find('.right-team .team-logo img').attr('data-img');
        const leftLogo = $(element).find('.left-team .team-logo img').attr('data-img');
        const leftTeamName = $(element).find('.left-team .team-name').text().trim();
        const matchTime = $(element).find('.match-timing #match-time').text().trim();
        const result = $(element).find('.match-timing #result').text().trim();
        const matchInfo = $(element).find('.match-info li span').map((i, el) => $(el).text()).get().join(' | ');
        const link = $(element).find('.match-event a').attr('href');

  
  
        
        if ((rightTeamName == '') && (leftTeamName == '')) {
            return;
          }
  
  
        matches.push({
          title,
          rightTeamName,
          rightLogo,
          leftTeamName,
          leftLogo,
          matchTime,
          result,
          matchInfo,
          link,
       
        });
      });
  
      await browser.close();
      return matches;
    } catch (error) {
      console.error('Error scraping data:', error);
      return [];
    }
  }

app.get('/api/matches', async (req, res) => {
    const matches = await scrapeData();
    res.json(matches);
  });





// footbal scraping routes  // --------------------------------------------------------------------------------------------
/*
app.post('/live' , async (req, res) => {
    
        const link = req.body.liveSrc;
        const matches = [];
      
        try {
          const browser = await puppeteer.launch({ headless: 'new' }); // Set headless to true for a headless browser
          const page = await browser.newPage();
          await page.goto(link);
      
          const content = await page.content();
          const $ = load(content);
      
          $('iframe.cf').each((index, element) => {
            const src = $(element).attr('src');
      
      
            matches.push({
              src,
            });
          });
      
          console.log(matches);
      
          await browser.close();
        } catch (error) {
          console.error('Error scraping data:', error);
        }
      
      
      
      res.json(matches);
});
  */

// server port setup // --------------------------------------------------------------------------------------------


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});




