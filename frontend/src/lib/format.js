const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
});

export function formatCurrency(value) {
  const parsedValue = Number(value);
  return currencyFormatter.format(Number.isFinite(parsedValue) ? parsedValue : 0);
}

function parseDate(value) {
  if (!value) {
    return null;
  }

  const parsedValue = new Date(value);
  return Number.isNaN(parsedValue.getTime()) ? null : parsedValue;
}

export function formatDate(value) {
  const parsedValue = parseDate(value);

  if (!parsedValue) {
    return 'N/A';
  }

  return parsedValue.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(value) {
  const parsedValue = parseDate(value);

  if (!parsedValue) {
    return 'N/A';
  }

  return parsedValue.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
