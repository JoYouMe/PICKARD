const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

const scrapeCards = async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    await page.goto('https://www.banksalad.com/chart/cards?organization-guids=CRD0003&type=%ED%95%A0%EC%9D%B8%E3%83%BB%EC%A0%81%EB%A6%BD&check-only=false&credit-only=true&prev-payment-amount=500000&sort=CARD_SORTING_OPTION_CHART_BENEFIT');

    await page.waitForSelector('.bg-white-900 .css-197f4h9.e1p7zl0v0');

    const html = await page.content();
    const $ = cheerio.load(html);

    $('.bg-white-900 .css-197f4h9.e1p7zl0v0').each((index, element) => {
        const cardImage = $(element).find('.css-13l59is.ezebuvz3').attr('src');
        const cardName = $(element).find('h2.font-bold.leading-28.text-gray-150').text();
        const maxBenefit = $(element).find('.css-95zuz4.ezebuvz2').text();
        const annualFee = $(element).find('.flex.flex-wrap li:nth-child(1)').text();
        const monthlyRecord = $(element).find('.flex.flex-wrap li:nth-child(2)').text();
        const additionalInfo = $(element).find('p.text-body-15.font-medium.text-gray-150').text();

      // Do something with the extracted information (e.g., store in an array, database, or log to console)
      console.log(`Card Image: ${cardImage}`);
      console.log(`Card Name: ${cardName}`);
      console.log(`Max Benefit: ${maxBenefit}`);
      console.log(`Annual Fee: ${annualFee}`);
      console.log(`Monthly Record: ${monthlyRecord}`);
      console.log(`Additional Info: ${additionalInfo}`);
      console.log('------------------------');
    });
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    await browser.close();
};
// const scrapeCards = async () => {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
    
//     await page.goto('https://www.banksalad.com/chart/cards?organization-guids=CRD0003&type=%ED%95%A0%EC%9D%B8%E3%83%BB%EC%A0%81%EB%A6%BD&check-only=false&credit-only=true&prev-payment-amount=500000&sort=CARD_SORTING_OPTION_CHART_BENEFIT');

//     await page.waitForSelector('.bg-white-900 .css-197f4h9.e1p7zl0v0');

//     const html = await page.content();
//     const $ = cheerio.load(html);

//     $('.bg-white-900 .css-197f4h9.e1p7zl0v0').each((index, element) => {
//         const cardImage = $(element).find('.css-13l59is.ezebuvz3').attr('src');
//         const cardName = $(element).find('h2.font-bold.leading-28.text-gray-150').text();
//         const maxBenefit = $(element).find('.css-95zuz4.ezebuvz2').text();
//         const annualFee = $(element).find('.flex.flex-wrap li:nth-child(1)').text();
//         const monthlyRecord = $(element).find('.flex.flex-wrap li:nth-child(2)').text();

//         console.log(`Card Image: ${cardImage}`);
//         console.log(`Card Name: ${cardName}`);
//         console.log(`Max Benefit: ${maxBenefit}`);
//         console.log(`Annual Fee: ${annualFee}`);
//         console.log(`Monthly Record: ${monthlyRecord}`);
//         console.log('--------------------------------');
//     });
//     page.on('console', msg => console.log('PAGE LOG:', msg.text()));
//     await browser.close();
// };

scrapeCards();

