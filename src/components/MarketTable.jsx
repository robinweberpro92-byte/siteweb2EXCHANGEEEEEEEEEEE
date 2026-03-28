import Card from './Card';
import Badge from './Badge';
import Sparkline from './Sparkline';
import AssetIcon from './AssetIcon';
import { useApp } from '../context/AppContext';
import { compact, euro, pct } from '../utils/format';
import { getMarketAssets } from '../utils/exchange';

export default function MarketTable({ rows, limit, title = 'Actifs suivis', subtitle }) {
  const { config, language } = useApp();
  const resolvedRows = rows || getMarketAssets(config);
  const displayedRows = typeof limit === 'number' ? resolvedRows.slice(0, limit) : resolvedRows;

  return (
    <Card className="market-surface">
      <div className="section-head">
        <div>
          <p className="eyebrow">{language === 'fr' ? 'Marché' : 'Market'}</p>
          <h3>{title}</h3>
          <p className="muted">
            {subtitle || (config.market.livePricingEnabled ? 'Live pricing structure is ready.' : 'Local pricing mode is active and remains fully configurable from the admin panel.')}
          </p>
        </div>
        <Badge tone={config.market.livePricingEnabled ? 'success' : 'warning'}>
          {config.market.livePricingEnabled ? (language === 'fr' ? 'Mode live prêt' : 'Live mode ready') : (language === 'fr' ? 'Tarification locale' : 'Local pricing')}
        </Badge>
      </div>

      <div className="table-wrap market-table-wrap">
        <table className="market-table">
          <thead>
            <tr>
              <th>{language === 'fr' ? 'Actif' : 'Asset'}</th>
              <th>{language === 'fr' ? 'Prix' : 'Price'}</th>
              <th>24h</th>
              <th>{language === 'fr' ? 'Volume' : 'Volume'}</th>
              <th>{language === 'fr' ? 'Market cap' : 'Market cap'}</th>
              <th>{language === 'fr' ? 'Tendance' : 'Trend'}</th>
            </tr>
          </thead>
          <tbody>
            {displayedRows.map((asset) => (
              <tr key={asset.symbol}>
                <td>
                  <div className="coin-cell">
                    <AssetIcon asset={asset} size={40} />
                    <div>
                      <strong>{asset.name}</strong>
                      <span>{asset.symbol}</span>
                    </div>
                    {asset.featured ? <Badge tone="info">Top</Badge> : null}
                  </div>
                </td>
                <td>{euro(asset.price, 'EUR', language)}</td>
                <td className={asset.change24h >= 0 ? 'text-success' : 'text-danger'}>{pct(asset.change24h)}</td>
                <td>{compact(asset.volume, language)}</td>
                <td>{compact(asset.marketCap, language)}</td>
                <td>
                  <Sparkline points={asset.sparkline || []} positive={asset.change24h >= 0} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mobile-market-list">
        {displayedRows.map((asset) => (
          <div key={`${asset.symbol}-mobile`} className="mobile-market-card">
            <div className="mobile-market-card__head">
              <div className="coin-cell">
                <AssetIcon asset={asset} size={34} />
                <div>
                  <strong>{asset.name}</strong>
                  <span>{asset.symbol}</span>
                </div>
              </div>
              <strong>{euro(asset.price, 'EUR', language)}</strong>
            </div>
            <div className="mobile-market-card__grid">
              <div><span>24h</span><strong className={asset.change24h >= 0 ? 'text-success' : 'text-danger'}>{pct(asset.change24h)}</strong></div>
              <div><span>Vol.</span><strong>{compact(asset.volume, language)}</strong></div>
              <div><span>Cap</span><strong>{compact(asset.marketCap, language)}</strong></div>
            </div>
            <Sparkline points={asset.sparkline || []} positive={asset.change24h >= 0} />
          </div>
        ))}
      </div>
    </Card>
  );
}
