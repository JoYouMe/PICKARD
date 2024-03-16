const request = require('request');
const cheerio = require('cheerio');

scrapingResult = {
  date: '',
  the_basic_rate: '',
  buy: '',
  sell: '',
};

function getData() {
  request(
    'https://finance.naver.com/marketindex/exchangeDailyQuote.nhn',
    function (err, res, body) {
      const $ = cheerio.load(body);
      const bodyList = $('.tbl_exchange tbody tr').map(function (i, element) {
        scrapingResult['date'] = String(
          $(element).find('td:nth-of-type(1)').text(),
        );
        scrapingResult['the_basic_rate'] = String(
          $(element).find('td:nth-of-type(2)').text(),
        );
        scrapingResult['buy'] = String(
          $(element).find('td:nth-of-type(4)').text(),
        );
        scrapingResult['sell'] = String(
          $(element).find('td:nth-of-type(5)').text(),
        );

        console.log(scrapingResult);
      });
    },
  );
}

getData();
