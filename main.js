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
  var annualizedReturn = (1 + avg) ** 253 - 1;

  console.log(
    `Average daily rate = ${avg}
      \nNumber of trading days = ${tradingDays}
      \nAnnualized return = ${annualizedReturn * 100}%
      \n${1000} on January 30, 2005 would equal ${cash} on June 6, 2021`
  );
}
