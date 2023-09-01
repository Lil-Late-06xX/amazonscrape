import puppeteer from 'puppeteer';
import { load } from 'cheerio';
import dotenv from 'dotenv';
dotenv.config();


async function scrapeAmazonProducts() {
    const url = 'https://www.amazon.com/s?k=m2%20chip%20macbook%20pro';
    const rowData = [];

    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(url);

        // Wait for a specific indicator that the results are loaded
        await page.waitForSelector('.s-main-slot');

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
                    reviewCount = 'No reviews yet';
                        
                }
                rowData.push({
                    details,
                    price,
                    rating,
                    reviewCount,
                    imageSrc
                });
            }
        });
        console.log(rowData);

        await browser.close();
    } catch (error) {
        console.error('Error scraping data:', error);
    }
}

scrapeAmazonProducts();



