/**
 * Splits a full name string into first name and last name.
 * @param fullName - The full name string (e.g., "John Doe Smith"). Defaults to empty string.
 * @returns An object with firstName and lastName properties.
 */
export const splitName = (
  fullName: string = '',
): { firstName: string; lastName: string } => {
  const parts = fullName.trim().split(' ');
  const firstName = parts[0] || '';
  const lastName = parts.slice(1).join(' ') || '';
  return { firstName, lastName };
};

/**
 * Joins first name and last name into a single full name string.
 * @param firstName - The first name. Defaults to empty string.
 * @param lastName - The last name. Defaults to empty string.
 * @returns The combined full name string.
 */
export const joinName = (
  firstName: string = '',
  lastName: string = '',
): string => {
  return `${firstName.trim()} ${lastName.trim()}`.trim();
};
