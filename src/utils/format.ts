export function formatCurrency(amount: number): string {
  if (amount >= 1000000) return `R${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `R${(amount / 1000).toFixed(0)}K`;
  return `R${amount.toLocaleString()}`;
}

export function formatCurrencyFull(amount: number): string {
  return `R ${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}
