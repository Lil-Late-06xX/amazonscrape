import puppeteer from 'puppeteer';
import { load } from 'cheerio';
import dotenv from 'dotenv';
dotenv.config();


async function scrapeData() {
  const url = 'https://1koora.elkoora.live/';
  const matches = [];

  try {
    const browser = await puppeteer.launch({headless: "new"});
    const page = await browser.newPage();
    await page.goto(url);

    const content = await page.content();
    const $ = load(content);

    $('.match-event').each((index, element) => {

      const title = $(element).find('.match-event a').attr('title');
      const rightTeamName = $(element).find('.right-team .team-name').text().trim();
      const rightLogo = $(element).find('.right-team .team-logo img').attr('src');
      const leftLogo = $(element).find('.left-team .team-logo img').attr('src');
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
        link
      });
    });

    console.log(matches); 

    await browser.close();
  } catch (error) {
    console.error('Error scraping data:', error);
  }
}

scrapeData();
