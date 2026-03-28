import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import MarketTable from '../components/MarketTable';
import { useApp } from '../context/AppContext';
import { getMarketAssets } from '../utils/exchange';

export default function MarketPage() {
  const { config, copy, language } = useApp();
  const [sortBy, setSortBy] = useState('position');

  const rows = useMemo(() => {
    const sorted = [...getMarketAssets(config)];
    sorted.sort((left, right) => {
      if (sortBy === 'position') return Number(left.position || 0) - Number(right.position || 0);
      return Number(right[sortBy] || 0) - Number(left[sortBy] || 0);
    });
    return sorted;
  }, [config, sortBy]);

  return (
    <section className="container section page-intro">
      <div className="page-head">
        <span className="eyebrow">{copy.nav.market}</span>
        <h1>{copy.market.title}</h1>
        <p>{copy.market.subtitle}</p>
      </div>

      <Card className="toolbar-card">
        <div className="section-toolbar section-toolbar--between">
          <div>
            <strong>{language === 'fr' ? 'Tri des actifs' : 'Asset sorting'}</strong>
            <p className="muted">{language === 'fr' ? 'Passez d’un classement opérationnel à un tri par prix, volume ou variation.' : 'Switch between configured ordering and value-based sorting.'}</p>
          </div>
          <div className="toolbar-actions">
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="position">{language === 'fr' ? 'Ordre configuré' : 'Configured order'}</option>
              <option value="price">{language === 'fr' ? 'Prix' : 'Price'}</option>
              <option value="change24h">{language === 'fr' ? 'Variation 24h' : '24h change'}</option>
              <option value="volume">{language === 'fr' ? 'Volume' : 'Volume'}</option>
              <option value="marketCap">Market cap</option>
            </select>
            <Link to="/exchange" className="button button--primary">{copy.common.openExchange}</Link>
          </div>
        </div>
      </Card>

      <MarketTable rows={rows} title={language === 'fr' ? 'Tableau des actifs' : 'Asset table'} subtitle={config.market.livePricingEnabled ? copy.common.liveRatesPlanned : copy.market.subtitle} />
    </section>
  );
}
