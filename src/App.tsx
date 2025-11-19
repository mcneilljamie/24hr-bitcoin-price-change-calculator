import { useState, useEffect } from 'react';

interface BitcoinData {
  usd: number;
  usd_24h_change: number;
}

interface HistoricalData {
  prices: [number, number][];
}

function App() {
  const [bitcoinPrice, setBitcoinPrice] = useState<number | null>(null);
  const [priceChange24h, setPriceChange24h] = useState<number | null>(null);
  const [price1YearAgo, setPrice1YearAgo] = useState<number | null>(null);
  const [holdings, setHoldings] = useState<string>('');

  const fetchBitcoinPrice = async () => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true'
      );
      const data = await response.json();
      const bitcoinData: BitcoinData = data.bitcoin;
      setBitcoinPrice(bitcoinData.usd);
      setPriceChange24h(bitcoinData.usd_24h_change);
    } catch (err) {
      console.error('Failed to fetch Bitcoin price');
    }
  };

  const fetch1YearAgoPrice = async () => {
    try {
      const oneYearAgo = Math.floor(Date.now() / 1000) - (365 * 24 * 60 * 60);
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range?vs_currency=usd&from=${oneYearAgo}&to=${oneYearAgo + 86400}`
      );
      const data: HistoricalData = await response.json();
      if (data.prices && data.prices.length > 0) {
        setPrice1YearAgo(data.prices[0][1]);
      }
    } catch (err) {
      console.error('Failed to fetch historical Bitcoin price');
    }
  };

  useEffect(() => {
    fetchBitcoinPrice();
    fetch1YearAgoPrice();
    const interval = setInterval(fetchBitcoinPrice, 15000);
    return () => clearInterval(interval);
  }, []);

  const calculatePortfolioValue = () => {
    const holdingsNum = parseFloat(holdings);
    if (isNaN(holdingsNum) || !bitcoinPrice) return null;
    return holdingsNum * bitcoinPrice;
  };

  const calculate24hChange = () => {
    const holdingsNum = parseFloat(holdings);
    if (isNaN(holdingsNum) || !bitcoinPrice || priceChange24h === null) return null;
    const priceChange = (priceChange24h / 100) * bitcoinPrice;
    return holdingsNum * priceChange;
  };

  const calculate1YearChange = () => {
    const holdingsNum = parseFloat(holdings);
    if (isNaN(holdingsNum) || !bitcoinPrice || !price1YearAgo) return null;
    return holdingsNum * (bitcoinPrice - price1YearAgo);
  };

  const portfolioValue = calculatePortfolioValue();
  const valueChange24h = calculate24hChange();
  const valueChange1Year = calculate1YearChange();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-4xl space-y-12">
        <input
          type="number"
          step="0.00000001"
          placeholder="BTC amount"
          value={holdings}
          onChange={(e) => setHoldings(e.target.value)}
          className="w-full px-8 py-6 bg-black border border-gray-700 rounded text-center text-4xl text-white placeholder-gray-500 focus:outline-none focus:border-gray-300"
        />

        {portfolioValue !== null && !isNaN(portfolioValue) && (
          <div className="space-y-6 pt-8">
            <div className="text-center">
              <div className="text-8xl font-light text-white">
                ${Math.round(portfolioValue).toLocaleString('en-US')}
              </div>
            </div>

            {valueChange24h !== null && (
              <div className="text-center">
                <div className={`text-4xl ${valueChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  You've {valueChange24h >= 0 ? 'gained' : 'lost'} ${Math.round(Math.abs(valueChange24h)).toLocaleString('en-US')} in 24 hours
                </div>
              </div>
            )}

            {valueChange1Year !== null && (
              <div className="text-center">
                <div className={`text-4xl ${valueChange1Year >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  You've {valueChange1Year >= 0 ? 'gained' : 'lost'} ${Math.round(Math.abs(valueChange1Year)).toLocaleString('en-US')} in 1 year
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
