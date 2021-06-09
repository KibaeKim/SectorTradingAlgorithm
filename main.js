const csv = require('csv-parser');
const fs = require('fs');

const etfDirectory = 'VanguardSectorETFs';

var res = {};

fs.readdir(etfDirectory, function (err, files) {
  if (err) {
    console.log('Could not list the directory.', err);
    process.exit(1);
  }

  // Reading each csv file in folder VanguardSectorETFs
  files.forEach((file, index) => {
    fs.createReadStream(`${etfDirectory}/${file}`)
      .pipe(csv())
      .on('data', (data) => {
        var etf = file.substring(0, 3);
        var date = data.Date;
        var open = data.Open;
        var close = data.Close;

        // Making a new array if this is the first piece of data on this date
        if (!res[date]) {
          res[date] = [];
        }
        res[date].push({ name: etf, open: open, close: close });
      })
      .on('end', () => {
        // Run mainFunction() after reading the last file
        if (index == files.length - 1) {
          mainFunction();
        }
      });
  });
});

function mainFunction() {
  bestPerformers = [];
  Object.keys(res)
    .sort()
    .forEach((date, index) => {
      var bestPerformance = Number.NEGATIVE_INFINITY;
      var bestEtf = '';
      res[date].forEach((etf) => {
        etfPerformance = (etf.close - etf.open) / etf.open;
        if (etfPerformance > bestPerformance) {
          bestEtf = etf.name;
          bestPerformance = etfPerformance;
        }
      });
      bestPerformers.push(bestEtf);
    });

  performance = [];
  cash = 1000.0;
  Object.keys(res)
    .sort()
    .forEach((date, index) => {
      if (index != 0) {
        res[date].forEach((etf) => {
          if (etf.name == bestPerformers[index - 1]) {
            cash = cash * (1 + (etf.open - etf.close) / etf.close);
            performance.push((etf.open - etf.close) / etf.close);
          }
        });
      }
    });

  var total = 0;
  for (var i = 0; i < performance.length; i++) {
    total += performance[i];
  }
  var avg = total / performance.length;
  var tradingDays = performance.length;

  var annualizedReturn = (cash / 1000) ** (253 / tradingDays) - 1;

  /*  
    Average daily rate = 0.08774690684042068%
Number of trading days = 4366
Annualized return = 22.204163102061415%
1000 on January 30, 2005 would equal 31829.94540714155 on June 6, 2021
Standard deviation = 0.013087746861928531
Performance on the worst trading day -9.825416558076196%
  */
  console.log(`Average daily rate = ${avg * 100}%`);
  console.log(`Number of trading days = ${tradingDays}`);
  console.log(`Annualized return = ${annualizedReturn * 100}%`);
  console.log(
    `${1000} on January 30, 2005 would equal ${cash} on June 6, 2021`
  );
  console.log(
    `Standard deviation = ${calculateStandardDeviation(performance)}`
  );
  console.log(
    `Performance on the worst trading day ${
      worstDayPerformance(performance) * 100
    }%`
  );
}

function calculateStandardDeviation(performance) {
  var total = 0;
  for (var key in performance) total += performance[key];
  var meanVal = total / performance.length;

  var sdPrep = 0;
  for (var key in performance)
    sdPrep += Math.pow(parseFloat(performance[key]) - meanVal, 2);
  var sdResult = Math.sqrt(sdPrep / performance.length);
  return sdResult;
}

function worstDayPerformance(performance) {
  return Math.min(...performance);
}
