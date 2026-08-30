export const formatPrice = (price) => {
  if (price === undefined || price === null || isNaN(price)) return '0.00';
  return Number(price).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};
