import Card from './Card';
import { useApp } from '../context/AppContext';
import { compact, formatNumber } from '../utils/format';

export default function StatsStrip() {
  const { config, language } = useApp();

  const stats = [
    {
      label: language === 'fr' ? 'Volume mensuel' : 'Monthly volume',
      value: compact(config.trustIndicators.monthlyVolume, language),
      helper: 'EUR',
    },
    {
      label: language === 'fr' ? 'Transactions' : 'Transactions',
      value: formatNumber(config.trustIndicators.totalTransactions, 0, language),
      helper: language === 'fr' ? 'demandes traitées' : 'processed requests',
    },
    {
      label: language === 'fr' ? 'Note moyenne' : 'Average rating',
      value: `${config.trustIndicators.averageRating.toFixed(1)}/5`,
      helper: language === 'fr' ? `${formatNumber(config.trustIndicators.reviewCount, 0, language)} avis` : `${formatNumber(config.trustIndicators.reviewCount, 0, language)} reviews`,
    },
    {
      label: language === 'fr' ? 'Taux de completion' : 'Completion rate',
      value: `${config.trustIndicators.completionRate}%`,
      helper: language === 'fr' ? `${config.trustIndicators.averageProcessingMinutes} min en moyenne` : `${config.trustIndicators.averageProcessingMinutes} min avg`,
    },
  ];

  return (
    <div className="stats-strip stats-strip--trust">
      {stats.map((stat) => (
        <Card key={stat.label} className="stat-card stat-card--trust">
          <span>{stat.label}</span>
          <strong>{stat.value}</strong>
          <small>{stat.helper}</small>
        </Card>
      ))}
    </div>
  );
}
