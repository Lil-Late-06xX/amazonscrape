import puppeteer from 'puppeteer';
import { load } from 'cheerio';
import dotenv from 'dotenv';
dotenv.config();

async function emulateInfiniteScroll(page) {
    try {
        const scrollStep = 1000; // Scroll step in pixels
        let scrollHeight = 0;

        while (true) {
            await page.evaluate(scrollStep => {
                window.scrollBy(0, scrollStep);
            }, scrollStep);

            await page.waitForTimeout(1000); // Wait for new items to load

            const newScrollHeight = await page.evaluate(() => {
                return document.documentElement.scrollHeight;
            });

            if (newScrollHeight === scrollHeight) {
                break; // No more items loaded
            }

            scrollHeight = newScrollHeight;
        }
    } catch (error) {
        console.error('Error emulating infinite scroll:', error);
    }
}

async function CoinMarketCap() {
    const url = 'https://coinmarketcap.com/';
    const rowData = [];

    try {
        const browser = await puppeteer.launch({ headless: true }); // Change 'new' to 'true'
        const page = await browser.newPage();
        await page.goto(url);

        const content = await page.content();
        const $ = load(content);

        await emulateInfiniteScroll(page); // Await here

        $('tr').each((index, element) => {
            const rank = $(element).find('tr p').first().text();
            const name = $(element).find('tr a.cmc-link p').first().text();
            const price = $(element).find('tr a.cmc-link span').first().text()
            const logo = $(element).find('tr a.cmc-link img').attr('src');
            const marketCap = $(element).find('tr p span').first().text();
            
            const symbol = $(element).find('tr td a p').eq(1).text();
            const circulatingSupply = $(element).find('tr td div p').eq(-1).text();
            const volume = $(element).find('tr td a p').eq(2).text();
            const change1h = $(element).find('tr td  span').eq(4).text();
            const change7d = $(element).find('tr td  span').eq(8).text();
            const change24d = $(element).find('tr td  span').eq(6).text();
            const priceGraph = $(element).find(' td a.cmc-link img ').eq(-1).attr('src');
         

            if ((price == '') && (name == '')) {
                return;
              }
      

            rowData.push({
                rank,
                symbol,
                name,
                price,
                logo,
                marketCap,
                change1h,
                change24d,
                change7d,
                circulatingSupply,
                volume,
                priceGraph,
            });

        });

        console.log(rowData);

        await browser.close();
    } catch (error) {
        console.error('Error scraping data:', error);
    }
}

CoinMarketCap();
