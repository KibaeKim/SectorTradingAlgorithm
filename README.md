# SectorTradingAlgorithm

This is a simple trading algorithm I discovered that operates on the Vanguard sector ETFs. This backdating algorithm provides on average a return of ~0.0878% return for each trading day, or ~24.85% annualized return assuming 253 trading days per year.

## The Algorithm

This algorithm is really simple. 
1. On day `n`, determine which ETF gave the highest return
2. On day `n+1`, short sell the previous day's highest performing ETF at market open and close your short position at market close.

Because this algorithm operates on Vanguard's 11 Sector ETFs, it is resilient against the volatility of individual stocks.

### Caution
Hindsight is 20/20 and because this is a backdating algorithm, similar results are not guaranteed in the future. Use at your own risk.
