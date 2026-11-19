import styles from './SiteIcon.module.css';

const treatments: Record<string, string | undefined> = {
  'Thin record': styles.dotted,
  'Growing record': styles.dashed,
  'Well documented': styles.solid,
  'Richly documented': styles.double,
};

export const integrityTreatments: Record<
  string,
  { symbol: string; description: string }
> = {
  'Thin record': { symbol: 'T', description: 'Thin record integrity band' },
  'Growing record': {
    symbol: 'G',
    description: 'Growing record integrity band',
  },
  'Well documented': {
    symbol: 'W',
    description: 'Well documented integrity band',
  },
  'Richly documented': {
    symbol: 'R',
    description: 'Richly documented integrity band',
  },
};

export function siteIconClass(integrityLabel: string) {
  return [styles.icon, treatments[integrityLabel] ?? styles.solid]
    .filter(Boolean)
    .join(' ');
}
