import puppeteer from 'puppeteer';
import { load } from 'cheerio';

const url = "https://www.avito.ma/fr/maroc/appartements/appt--%C3%A0_vendre";

async function scrapeData() {
    try {
        const browser = await puppeteer.launch({headless: "new"});
        const page = await browser.newPage();
        await page.goto(url);

        const content = await page.content();
        const $ = load(content);

        const dataArray = []; // Array to store the extracted data

        $('.sc-jejop8-0.epNjzr').each((index, element) => {
            const productTitle = $(element).find('h3.sc-1x0vz2r-0.iXetrR.sc-jejop8-19.fIpwiP span').text();
            const productPrice = $(element).find('span.sc-1x0vz2r-0.bpfcIG.sc-jejop8-18.dfevBq span[dir="auto"]').text();
            const category = $(element).find('p.sc-1x0vz2r-0.hfbzFD.sc-jejop8-21.iUmQdJ').text();
            const whenlisted = $(element).find('div.sc-jejop8-15.fkCnHO span.hCOOjL').eq(0).text();
            const location = $(element).find('div.sc-jejop8-15.fkCnHO span.hCOOjL').eq(1).text();
            const imageSrc = $(element).find('img.sc-e64a09-1.jOJhKR').attr('src');
            const productLink = $(element).find('a.sc-jejop8-1.cYNgZe').attr('href');

            if ((location == '') && (productTitle == '')) {
                return;
            }

            // Create a data object
            const dataObject = {
                productTitle,
                productPrice,
                category,
                whenlisted,
                location,
                imageSrc,
                productLink
            };

            dataArray.push(dataObject); // Push the data object into the array
        });

        await browser.close();

        return dataArray; // Return the array of extracted data
    } catch (error) {
        console.error('Error:', error);
        return []; // Return an empty array in case of an error
    }
}

(async () => {
    const extractedData = await scrapeData();
    console.log(extractedData); // Now you have the extracted data in an array
})();
