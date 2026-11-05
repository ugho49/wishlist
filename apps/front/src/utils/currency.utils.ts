export const eurosFormatter = Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
});

export const wholeEurosFormatter = Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});
