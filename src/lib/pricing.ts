
/**
 * Utility for calculating bundle pricing based on sales count thresholds.
 * HQ: 0-10 sales (Base Price)
 * MQ: 10-20 sales (40% slash = 60% of base)
 * LQ: 20+ sales (60% slash = 40% of base)
 */
export function getBundlePricing(basePrice: number, salesCount: number = 0) {
  if (salesCount < 10) {
    return {
      tier: 'HQ',
      label: 'High Quality',
      discount: 0,
      price: basePrice,
      color: 'text-accent',
      borderColor: 'border-accent/40',
      bgColor: 'bg-accent/10',
      description: 'Exclusive Standard Bundle'
    };
  }
  if (salesCount < 20) {
    return {
      tier: 'MQ',
      label: 'Medium Quality',
      discount: 40,
      price: Math.floor(basePrice * 0.6),
      color: 'text-yellow-500',
      borderColor: 'border-yellow-500/30',
      bgColor: 'bg-yellow-500/10',
      description: 'Popular Distribution'
    };
  }
  return {
    tier: 'LQ',
    label: 'Low Quality',
    discount: 60,
    price: Math.floor(basePrice * 0.4),
    color: 'text-muted-foreground',
    borderColor: 'border-white/10',
    bgColor: 'bg-white/5',
    description: 'Archive Group List'
  };
}
