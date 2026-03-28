import { useState } from 'react';
import Badge from '../../Badge';
import { AdminField, AdminMetric, AdminSaveBar, AdminSection, AdminToggle } from '../AdminFormControls';
import { compact, euro, formatPercent } from '../../../utils/format';
import { generateId } from '../../../utils/storage';

export default function MarketTab({ data, dirty, onChangeSection, onSave, onReset, readOnly = false }) {
  const market = data.market;
  const [newAsset, setNewAsset] = useState({
    symbol: '',
    name: '',
    price: 0,
    change24h: 0,
    volume: 0,
    marketCap: 0,
    position: market.assets.length + 1,
    featured: false,
  });

  function updateMarket(patch) {
    onChangeSection('market', { ...market, ...patch });
  }

  function updateAsset(symbol, patch) {
    updateMarket({ assets: market.assets.map((asset) => (asset.symbol === symbol ? { ...asset, ...patch } : asset)) });
  }

  function deleteAsset(symbol) {
    updateMarket({ assets: market.assets.filter((asset) => asset.symbol !== symbol) });
  }

  function addAsset() {
    if (readOnly || !newAsset.symbol.trim() || !newAsset.name.trim()) return;
    const symbol = newAsset.symbol.trim().toUpperCase();
    updateMarket({
      assets: [
        ...market.assets,
        {
          id: generateId('AST'),
          symbol,
          name: newAsset.name.trim(),
          iconUrl: '',
          fallbackIcon: symbol.slice(0, 1),
          visibleInMarket: true,
          visibleInExchange: true,
          price: Number(newAsset.price || 0),
          change24h: Number(newAsset.change24h || 0),
          volume: Number(newAsset.volume || 0),
          marketCap: Number(newAsset.marketCap || 0),
          position: Number(newAsset.position || market.assets.length + 1),
          accent: '#3B82F6',
          sparkline: [42, 45, 49, 52, 48, 54, 59],
          featured: Boolean(newAsset.featured),
        },
      ],
    });
    setNewAsset({ symbol: '', name: '', price: 0, change24h: 0, volume: 0, marketCap: 0, position: market.assets.length + 2, featured: false });
  }

  return (
    <div className="admin-stack">
      <div className="metric-grid metric-grid--4">
        <AdminMetric label="Actifs visibles" value={String(market.assets.filter((asset) => asset.visibleInMarket).length)} helper="sur la page Market" />
        <AdminMetric label="Actifs échangeables" value={String(market.assets.filter((asset) => asset.visibleInExchange).length)} helper="dans l’Exchange" tone="success" />
        <AdminMetric label="Featured assets" value={String(market.assets.filter((asset) => asset.featured).length)} helper="mise en avant" tone="warning" />
        <AdminMetric label="Live pricing" value={market.livePricingEnabled ? 'Prévu' : 'Local'} helper="front autonome" tone="info" />
      </div>

      <AdminSection eyebrow="Marché" title="Mode de tarification et nouvel actif" description="Le mode live peut rester visible dans la structure mais le site doit continuer à fonctionner uniquement avec ses propres données locales.">
        <div className="toggle-stack">
          <AdminToggle label="Mode prix live prévu" checked={market.livePricingEnabled} onChange={(checked) => updateMarket({ livePricingEnabled: checked })} disabled={readOnly} />
        </div>
        <div className="field-grid field-grid--4">
          <AdminField label="Symbole"><input disabled={readOnly} value={newAsset.symbol} onChange={(event) => setNewAsset((current) => ({ ...current, symbol: event.target.value }))} /></AdminField>
          <AdminField label="Nom"><input disabled={readOnly} value={newAsset.name} onChange={(event) => setNewAsset((current) => ({ ...current, name: event.target.value }))} /></AdminField>
          <AdminField label="Prix"><input disabled={readOnly} type="number" min="0" step="0.0001" value={newAsset.price} onChange={(event) => setNewAsset((current) => ({ ...current, price: Number(event.target.value || 0) }))} /></AdminField>
          <AdminField label="Variation 24h"><input disabled={readOnly} type="number" step="0.01" value={newAsset.change24h} onChange={(event) => setNewAsset((current) => ({ ...current, change24h: Number(event.target.value || 0) }))} /></AdminField>
          <AdminField label="Volume"><input disabled={readOnly} type="number" min="0" step="1" value={newAsset.volume} onChange={(event) => setNewAsset((current) => ({ ...current, volume: Number(event.target.value || 0) }))} /></AdminField>
          <AdminField label="Market cap"><input disabled={readOnly} type="number" min="0" step="1" value={newAsset.marketCap} onChange={(event) => setNewAsset((current) => ({ ...current, marketCap: Number(event.target.value || 0) }))} /></AdminField>
          <AdminField label="Position"><input disabled={readOnly} type="number" min="1" step="1" value={newAsset.position} onChange={(event) => setNewAsset((current) => ({ ...current, position: Number(event.target.value || 1) }))} /></AdminField>
          <div className="toggle-stack field--full">
            <AdminToggle label="Mettre en avant" checked={newAsset.featured} onChange={(checked) => setNewAsset((current) => ({ ...current, featured: checked }))} disabled={readOnly} />
          </div>
          {!readOnly ? <div className="field field--action"><span className="field__label">Action</span><button type="button" className="button button--primary" onClick={addAsset}>Ajouter l’actif</button></div> : null}
        </div>
      </AdminSection>

      <AdminSection eyebrow="Actifs visibles" title="Paramètres crypto" description="Chaque actif alimente la page Market, les sélecteurs de l’Exchange et les aperçus dashboard.">
        <div className="asset-admin-grid">
          {market.assets.map((asset) => (
            <div key={asset.symbol} className="sub-card">
              <div className="section-head section-head--compact">
                <div>
                  <p className="eyebrow">{asset.symbol}</p>
                  <h4>{asset.name}</h4>
                </div>
                <div className="inline-badges">
                  <Badge tone={asset.change24h >= 0 ? 'success' : 'danger'}>{formatPercent(asset.change24h)}</Badge>
                  {asset.featured ? <Badge tone="warning">Featured</Badge> : null}
                  {!readOnly ? <button type="button" className="button button--ghost button--sm" onClick={() => deleteAsset(asset.symbol)}>Supprimer</button> : null}
                </div>
              </div>
              <div className="field-grid field-grid--2 compact-fields">
                <AdminField label="Nom"><input disabled={readOnly} value={asset.name} onChange={(event) => updateAsset(asset.symbol, { name: event.target.value })} /></AdminField>
                <AdminField label="Symbole"><input disabled={readOnly} value={asset.symbol} onChange={(event) => updateAsset(asset.symbol, { symbol: event.target.value.toUpperCase() })} /></AdminField>
                <AdminField label="Icône URL"><input disabled={readOnly} value={asset.iconUrl || ''} onChange={(event) => updateAsset(asset.symbol, { iconUrl: event.target.value })} /></AdminField>
                <AdminField label="Fallback icon"><input disabled={readOnly} value={asset.fallbackIcon || ''} onChange={(event) => updateAsset(asset.symbol, { fallbackIcon: event.target.value })} /></AdminField>
                <AdminField label="Accent"><input disabled={readOnly} type="color" value={asset.accent || '#3B82F6'} onChange={(event) => updateAsset(asset.symbol, { accent: event.target.value })} /></AdminField>
                <AdminField label="Position"><input disabled={readOnly} type="number" min="1" step="1" value={asset.position} onChange={(event) => updateAsset(asset.symbol, { position: Number(event.target.value || 1) })} /></AdminField>
                <AdminField label="Prix"><input disabled={readOnly} type="number" min="0" step="0.0001" value={asset.price} onChange={(event) => updateAsset(asset.symbol, { price: Number(event.target.value || 0) })} /></AdminField>
                <AdminField label="Variation 24h"><input disabled={readOnly} type="number" step="0.01" value={asset.change24h} onChange={(event) => updateAsset(asset.symbol, { change24h: Number(event.target.value || 0) })} /></AdminField>
                <AdminField label="Volume"><input disabled={readOnly} type="number" min="0" step="1" value={asset.volume} onChange={(event) => updateAsset(asset.symbol, { volume: Number(event.target.value || 0) })} /></AdminField>
                <AdminField label="Market cap"><input disabled={readOnly} type="number" min="0" step="1" value={asset.marketCap} onChange={(event) => updateAsset(asset.symbol, { marketCap: Number(event.target.value || 0) })} /></AdminField>
              </div>
              <div className="inline-badges inline-badges--wrap market-asset-meta">
                <Badge tone="neutral">{euro(asset.price)}</Badge>
                <Badge tone="neutral">Vol. {compact(asset.volume)}</Badge>
                <Badge tone="neutral">Cap {compact(asset.marketCap)}</Badge>
              </div>
              <div className="toggle-stack toggle-stack--inline">
                <AdminToggle label="Visible dans Market" checked={asset.visibleInMarket} onChange={(checked) => updateAsset(asset.symbol, { visibleInMarket: checked })} disabled={readOnly} />
                <AdminToggle label="Visible dans Exchange" checked={asset.visibleInExchange} onChange={(checked) => updateAsset(asset.symbol, { visibleInExchange: checked })} disabled={readOnly} />
                <AdminToggle label="Featured" checked={Boolean(asset.featured)} onChange={(checked) => updateAsset(asset.symbol, { featured: checked })} disabled={readOnly} />
              </div>
            </div>
          ))}
        </div>
      </AdminSection>

      {!readOnly ? <AdminSaveBar dirty={dirty} onSave={onSave} onReset={onReset} saveLabel="Sauvegarder le marché" /> : null}
    </div>
  );
}
