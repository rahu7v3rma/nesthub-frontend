/**
 * A function to format a given amount into USD currency format.
 *
 * @param amount - The amount to be formatted. If null, it will be treated as 0.
 * @returns Returns the amount formatted in USD currency format.
 */
export const formatCurrency = (amount: number | null) => {
  const value = amount || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export function formatQuantity(quantity: number, noun: string): string {
  return quantity === 1 ? `${quantity} ${noun}` : `${quantity} ${noun}s`;
}

export const formatPrice = (amount: number | null) => {
  if (!amount) return '0';
  // if (amount > 1000000) return `$ ${(amount / 1000000).toFixed(2)}M`;
  return `$ ${amount.toLocaleString()}`;
};

/**
 * Adds the appropriate suffix to a given day number (e.g., "1st", "2nd", "3rd", "4th").
 *
 * This function handles the special cases for the suffixes of 11th, 12th, and 13th,
 * and provides the correct ordinal suffix for other day numbers (e.g., "1st", "2nd", "21st").
 *
 * @param {number} day - The day of the month for which the suffix is to be added.
 * @returns {string} The day with the correct ordinal suffix (e.g., "1st", "2nd", "21st").
 */

const getDayWithSuffix = (day: number) => {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const lastDigit = day % 10;
  const lastTwoDigits = day % 100;
  return (
    day +
    (lastTwoDigits >= 11 && lastTwoDigits <= 13
      ? 'th'
      : suffixes[lastDigit] || 'th')
  );
};

// Format date to desired string
export const getFormattedDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const formattedDate = new Date(date)
    .toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    })
    .replace(`${date.getDate()}`, getDayWithSuffix(date.getDate()));
  return formattedDate;
};
