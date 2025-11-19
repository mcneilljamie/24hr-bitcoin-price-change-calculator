import { useState, useEffect } from 'react';

interface BitcoinData {
  usd: number;
  usd_24h_change: number;
}

function App() {
  const [bitcoinPrice, setBitcoinPrice] = useState<number | null>(null);
  const [priceChange24h, setPriceChange24h] = useState<number | null>(null);
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

  useEffect(() => {
    fetchBitcoinPrice();
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

  const portfolioValue = calculatePortfolioValue();
  const valueChange24h = calculate24hChange();

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
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
