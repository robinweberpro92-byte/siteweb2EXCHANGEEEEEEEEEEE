import Card from '../Card';
import Badge from '../Badge';
import { useApp } from '../../context/AppContext';
import { euro } from '../../utils/format';
import { getMarketAssets } from '../../utils/exchange';

export default function ExchangeSidebar({ appData, flowLabel, estimate }) {
  const { copy, language } = useApp();
  const visibleAssets = getMarketAssets(appData).slice(0, 4);
  const sideMessages = [...(appData.exchange.sidebarMessages || []), ...(copy.exchange.sideMessages || [])];

  return (
    <div className="exchange-sidebar">
      <Card>
        <div className="section-head section-head--compact">
          <div>
            <p className="eyebrow">{language === 'fr' ? 'Conditions' : 'Conditions'}</p>
            <h3>{language === 'fr' ? 'Règles actives' : 'Active rules'}</h3>
          </div>
          <Badge tone="warning">{flowLabel || (language === 'fr' ? 'Sélection' : 'Selection')}</Badge>
        </div>
        <div className="summary-list">
          <div className="summary-row"><span>{language === 'fr' ? 'Frais' : 'Fees'}</span><strong>{appData.exchange.globalFeePercent}%</strong></div>
          <div className="summary-row"><span>{language === 'fr' ? 'Minimum' : 'Minimum'}</span><strong>{euro(appData.exchange.minimumAmount, 'EUR', language)}</strong></div>
          <div className="summary-row"><span>{language === 'fr' ? 'Maximum' : 'Maximum'}</span><strong>{euro(appData.exchange.maximumAmount, 'EUR', language)}</strong></div>
          <div className="summary-row"><span>{language === 'fr' ? 'Délai estimé' : 'Estimated delay'}</span><strong>{appData.exchange.estimatedDelay}</strong></div>
        </div>
        <p className="muted sidebar-copy">{appData.exchange.warningMessage}</p>
      </Card>

      <Card>
        <p className="eyebrow">{language === 'fr' ? 'Informations latérales' : 'Side information'}</p>
        <div className="bullet-list bullet-list--compact">
          {sideMessages.map((message, index) => (
            <div key={`${message}-${index}`} className="bullet-list__item">
              <span />
              <p>{message}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="section-head section-head--compact">
          <div>
            <p className="eyebrow">{language === 'fr' ? 'Marché' : 'Market'}</p>
            <h3>{language === 'fr' ? 'Actifs en vue' : 'Assets in focus'}</h3>
          </div>
          {estimate ? <Badge tone="info">Net {estimate.formattedNetFiat}</Badge> : null}
        </div>
        <div className="mini-market-list">
          {visibleAssets.map((asset) => (
            <div key={asset.symbol} className="mini-market-list__item">
              <strong>{asset.symbol}</strong>
              <span>{euro(asset.price, 'EUR', language)}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
