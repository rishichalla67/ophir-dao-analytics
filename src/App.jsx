import { useState, useEffect } from 'react'
import './App.css'
const tokenMappings = {
  'ibc/517E13F14A1245D4DE8CF467ADD4DA0058974CDCC880FA6AE536DBCA1D16D84E': { symbol: 'bWhale', decimals: 6 },
  'ibc/B3F639855EE7478750CC8F82072307ED6E131A8EFF20345E1D136B50C4E5EC36': { symbol: 'ampWhale', decimals: 6 },
  'factory/migaloo1t862qdu9mj5hr3j727247acypym3ej47axu22rrapm4tqlcpuseqltxwq5/ophir': {symbol: 'ophir', decimals: 6},
  'uwhale': {symbol: "whale", decimals: 6}

};

const coinGeckoSymbolToHumanReadable = {
  'TERRA-LUNA-2': "Luna",
  'WHITE-WHALE': "Whale"
}

function App() {
  const [totalAllianceRewards, setTotalAllianceRewards] = useState({})
  const [stakedBalances, setStakedBalances] = useState({});
  const [whiteWhalePools, setWhiteWhalePools] = useState({});
  const [ophirDaoTreasuryAssets, setOphirDaoTreasuryAssets] = useState({});

  const useCachedApiData = () => {
    const [cachedData, setCachedData] = useState({});
    const [lastUpdated, setLastUpdated] = useState(0);

    const fetchCoinGeckoPrices = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=terra-luna-2,white-whale&vs_currencies=usd&include_last_updated_at=true');
        const data = await response.json();
        const formattedData = Object.keys(data).reduce((acc, key) => {
          acc[key] = data[key].usd;
          return acc;
        }, {});
        setCachedData(formattedData);
        setLastUpdated(Date.now());
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    useEffect(() => {
      // Check if data is older than 2 minutes
      if (Date.now() - lastUpdated > 120000) {
        fetchCoinGeckoPrices();
      }
    }, [lastUpdated]);

    return cachedData;
  };

  const calculateAssetValueBasedOnWWPoolPrice = (pool_id, amount) => {
    console.log(pool_id);
    
    const price = whiteWhalePools[pool_id]?.Price || 0;
    console.log(price);
    return price * amount;
  };

  const formatNumber = (number) => {
    return number.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatOphirPrice = (number) => {
    return number.toLocaleString('en-US', {
      minimumFractionDigits: 5,
      maximumFractionDigits: 5,
    });
  };

  useEffect(() => {
    // Get Alliance Rewards
    fetch('https://phoenix-lcd.terra.dev/cosmwasm/wasm/v1/contract/terra1jwyzzsaag4t0evnuukc35ysyrx9arzdde2kg9cld28alhjurtthq0prs2s/smart/ewogICJhbGxfcGVuZGluZ19yZXdhcmRzIjogeyJhZGRyZXNzIjoidGVycmExaGc1NWRqYXljcndnbTB2cXlkdWwzYWQzazY0am4wamF0bnVoOXdqeGN4d3R4cnM2bXh6c2h4cWpmMyJ9Cn0=')
      .then(response => response.json())
      .then(data => {
        const rewardsObject = data.data.reduce((acc, item) => {
          const tokenInfo = tokenMappings[item.staked_asset.native];
          const humanReadableName = tokenInfo.symbol;
          if(tokenInfo){
            acc[humanReadableName] = parseInt(item.rewards) / Math.pow(10, tokenInfo.decimals);
          }
          return acc;
        }, {});
        setTotalAllianceRewards(rewardsObject);
      });
    
    // Get alliance staked assets 
    fetch('https://phoenix-lcd.terra.dev/cosmwasm/wasm/v1/contract/terra1jwyzzsaag4t0evnuukc35ysyrx9arzdde2kg9cld28alhjurtthq0prs2s/smart/ew0KICAiYWxsX3N0YWtlZF9iYWxhbmNlcyI6IHsNCiAgICAiYWRkcmVzcyI6ICJ0ZXJyYTFoZzU1ZGpheWNyd2dtMHZxeWR1bDNhZDNrNjRqbjBqYXRudWg5d2p4Y3h3dHhyczZteHpzaHhxamYzIg0KICB9DQp9')
      .then(response => response.json())
      .then(data => {
        const balances = data.data.reduce((acc, item) => {
          const tokenInfo = tokenMappings[item.asset.native];
          if (tokenInfo && parseFloat(item.balance) >= 0.1) {
            const humanReadableName = tokenInfo.symbol;
            const balance = parseFloat(item.balance) / Math.pow(10, tokenInfo.decimals);
            acc[humanReadableName] = balance;
          }
          return acc;
        }, {});
        setStakedBalances(balances);
      })
      // get white whale pool prices
      fetch('https://www.api-white-whale.enigma-validator.com/summary/migaloo/all/current')
        .then(response => response.json())
        .then(data => {
          const formattedData = data.reduce((acc, item) => {
            if (item.Price > 0) {
              acc[item.pool_id] = {
                Price: item.Price,
              };
            }
            return acc;
          }, {});
          setWhiteWhalePools(formattedData);
        })
      fetch('https://migaloo.explorer.interbloc.org/account/migaloo10gj7p9tz9ncjk7fm7tmlax7q6pyljfrawjxjfs09a7e7g933sj0q7yeadc')
        .then(response => response.json())
        .then(data => {
          const OphirDaoTreasuryAssets = Object.keys(data.balances).reduce((acc, key) => {
            const tokenInfo = tokenMappings[key];
            if (tokenInfo) {
              acc[tokenInfo.symbol] = parseFloat(data.balances[key]) / Math.pow(10, tokenInfo.decimals);
            }
            return acc;
          }, {});
          setOphirDaoTreasuryAssets(OphirDaoTreasuryAssets);
        });
  }, []);
  const cachedPrices = useCachedApiData();
  

  return (
    <div style={{ display: 'block', justifyContent: 'center', width: '90vw', marginTop: '-1rem' }}>
      <p style={{ textAlign: 'center', marginTop: '1rem' }}>
        <small>Last Updated: {new Date().toLocaleString()}</small>
      </p>
      <h1 style={{ textAlign: 'center', marginTop: '-1rem', cursor: 'pointer' }} onClick={() => window.open('https://daodao.zone/dao/migaloo10gj7p9tz9ncjk7fm7tmlax7q6pyljfrawjxjfs09a7e7g933sj0q7yeadc/treasury', '_blank')}>Ophir DAO Live Analytics</h1>
      <div style={{ width: '90vw', maxWidth: '64rem', padding: '1rem', marginTop: '-2rem', marginBottom: '2rem', marginLeft: "-1rem" }}>
        <h2 style={{marginLeft: '4.5rem' }}>DAO Treasury Assets</h2>
        <table style={{ width: '100%', tableLayout: 'auto', textAlign: 'center' }}>
          <thead>
            <tr style={{ backgroundColor: '#fde68a' }}>
              <th style={{ padding: '0.5rem 0.5rem', borderRight: '1px solid' }}>Asset</th>
              <th style={{ padding: '0.5rem 0.5rem', borderRight: '1px solid' }}>Balance</th>
              <th style={{ padding: '0.5rem 0.5rem' }}>Value (USD)</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(ophirDaoTreasuryAssets).map(([asset, balance]) => (
              <tr key={asset} style={{ borderBottom: '1px solid' }}>
                <td style={{ padding: '0.5rem 0.5rem', borderRight: '1px solid' }}>{asset}</td>
                <td style={{ padding: '0.5rem 0.5rem', borderRight: '1px solid' }}>{formatNumber(balance)}</td>
                <td style={{ padding: '0.5rem 0.5rem' }}>
                ${asset === 'ophir' ? 
                  (formatNumber(balance * calculateAssetValueBasedOnWWPoolPrice('OPHIR-WHALE', cachedPrices["white-whale"] || 0)).toLocaleString('en-US', { style: 'currency', currency: 'USD' })) : 
                  asset === 'whale' ? 
                  (formatNumber(balance * (cachedPrices["white-whale"] || 0)).toLocaleString('en-US', { style: 'currency', currency: 'USD' })) :
                  (formatNumber(balance * (cachedPrices[asset.toLowerCase()] || 0)).toLocaleString('en-US', { style: 'currency', currency: 'USD' }))
                }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ width: '90vw', maxWidth: '64rem', padding: '0rem', marginLeft: '-1rem' }}>
        <h2 style={{ marginLeft: '5rem' }}>Alliance Staked Assets</h2>
        <table style={{ width: '95%', tableLayout: 'auto', textAlign: 'center' }}>
          <thead>
            <tr style={{ backgroundColor: '#fde68a' }}>
              <th style={{ padding: '0.5rem 0.5rem', borderRight: '1px solid' }}>Asset</th>
              <th style={{ padding: '0.5rem 0.5rem', borderRight: '1px solid' }}>Balance</th>
              <th style={{ padding: '0.5rem 0.5rem', borderRight: '1px solid' }}>Value (USD)</th>
              <th style={{ padding: '0.5rem 0.5rem' }}>Pending Rewards</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(stakedBalances).map(([asset, balance]) => (
              <tr key={asset} style={{ borderBottom: '1px solid' }}>
                <td style={{ padding: '0.5rem 0.5rem', borderRight: '1px solid' }}>{asset}</td>
                <td style={{ padding: '0.5rem 0.5rem', borderRight: '1px solid' }}>{formatNumber(balance)}</td>
                <td style={{ padding: '0.5rem 0.5rem', borderRight: '1px solid' }}>
                  {asset === 'bWhale' || asset === 'ampWhale' ? 
                    (balance * calculateAssetValueBasedOnWWPoolPrice(asset === 'bWhale' ? 'bWHALE-WHALE' : 'ampWHALE-WHALE', cachedPrices["white-whale"] || 0)).toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : 
                    '-'
                  }
                </td>
                <td style={{ padding: '0.5rem 0.5rem' }}>
                  {totalAllianceRewards[asset] ? 
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span>
                        {formatNumber(totalAllianceRewards[asset])}
                        <img src="https://app.osmosis.zone/tokens/generated/luna.svg" alt="Luna" style={{ width: '1rem', height: '1rem' }} />
                        {` (${totalAllianceRewards[asset].toLocaleString('en-US', { style: 'currency', currency: 'USD' })})`}
                      </span>
                    </div> : 
                    '-'
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2 style={{textAlign: 'center' }}>Prices</h2>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', margin: '1rem 0', textAlign: 'center'}}>
        {Object.entries(cachedPrices).map(([asset, price]) => (
          <div key={asset} style={{ background: '#fde68a', borderRadius: '1rem', padding: '1rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', minWidth: '100px', margin: '0.5rem' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{coinGeckoSymbolToHumanReadable[asset.toUpperCase()] || asset.toCamelCase()}</div>
            <div style={{ fontSize: '1rem' }}>${price.toFixed(2)}</div>
          </div>
        ))}
        <div style={{ background: '#fde68a', borderRadius: '1rem', padding: '1rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', minWidth: '100px', margin: '0.5rem' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Ophir</div>
          <div style={{ fontSize: '1rem' }}>${formatOphirPrice(calculateAssetValueBasedOnWWPoolPrice('OPHIR-WHALE', cachedPrices["white-whale"] || 0))}</div>
        </div>
        <div style={{ background: '#fde68a', borderRadius: '1rem', padding: '1rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', minWidth: '100px', margin: '0.5rem' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>bWhale</div>
          <div style={{ fontSize: '1rem' }}>${formatOphirPrice(calculateAssetValueBasedOnWWPoolPrice('bWHALE-WHALE', cachedPrices["white-whale"] || 0))}</div>
        </div>
        <div style={{ background: '#fde68a', borderRadius: '1rem', padding: '1rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', minWidth: '100px', margin: '0.5rem' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>ampWhale</div>
          <div style={{ fontSize: '1rem' }}>${formatOphirPrice(calculateAssetValueBasedOnWWPoolPrice('ampWHALE-WHALE', cachedPrices["white-whale"] || 0))}</div>
        </div>
      </div>
    </div>
  )
}

export default App

