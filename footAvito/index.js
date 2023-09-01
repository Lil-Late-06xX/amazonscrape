import puppeteer from 'puppeteer';
import { load } from 'cheerio';
import dotenv from 'dotenv';
dotenv.config();

async function scrapeMatch() {
  const url = 'https://www.sa.al-koora-live.com/2023/08/on-time-sports-1-hd.html';
  const matches = [];

  try {
    const browser = await puppeteer.launch({ headless: 'new' }); // Set headless to true for a headless browser
    const page = await browser.newPage();
    await page.goto(url);

    const content = await page.content();
    const $ = load(content);

    $('.embedvideo iframe').each((index, element) => {
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
}

scrapeMatch();
