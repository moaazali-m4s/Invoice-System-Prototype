export function formatCurrency(amount?: number | null, currency: string = 'USD'): string {
  const safeAmount = amount == null || isNaN(amount) ? 0 : amount;
  const formatted = safeAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  switch ((currency || 'USD').toUpperCase()) {
    case 'USD':
      return `$${formatted}`;
    case 'EUR':
      return `€${formatted}`;
    case 'GBP':
      return `£${formatted}`;
    case 'CAD':
      return `CA$${formatted}`;
    case 'AUD':
      return `A$${formatted}`;
    default:
      return `${currency} ${formatted}`;
  }
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return dateStr;
  }

  const day = date.getDate().toString().padStart(2, '0');
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

export function generateInvoiceNumber(prefix: string = 'XYZ', date: Date = new Date(), sequence: number = 1): string {
  const year = date.getFullYear();
  const seqStr = sequence.toString().padStart(4, '0');
  return `${prefix}-${year}-${seqStr}`;
}

export function sanitizeFilename(name: string): string {
  return name.replace(/[/\\?%*:|"<>]/g, '_').replace(/\s+/g, '_');
}
