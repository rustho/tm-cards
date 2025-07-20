/**
 * Utility functions for date calculations and age computation
 */

/**
 * Calculate age from date of birth
 * @param dateOfBirth - Date of birth in ISO string format (YYYY-MM-DD)
 * @returns Age in years as a number
 */
export function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  
  // Basic validation
  if (isNaN(birthDate.getTime())) {
    throw new Error('Invalid date of birth format');
  }
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  // If birthday hasn't occurred this year yet, subtract 1
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Validate if a date of birth is valid and within acceptable range (18-100 years old)
 * @param dateOfBirth - Date of birth in ISO string format (YYYY-MM-DD)
 * @returns Object with validation result and error message if invalid
 */
export function validateDateOfBirth(dateOfBirth: string): { isValid: boolean; errorMessage?: string } {
  try {
    const age = calculateAge(dateOfBirth);
    
    if (age < 18) {
      return { isValid: false, errorMessage: 'You must be at least 18 years old' };
    }
    
    if (age > 100) {
      return { isValid: false, errorMessage: 'Age cannot exceed 100 years' };
    }
    
    return { isValid: true };
  } catch (error) {
    return { isValid: false, errorMessage: 'Invalid date format' };
  }
}

/**
 * Get date of birth from age (for backward compatibility during migration)
 * @param age - Age in years
 * @returns Approximate date of birth in ISO string format (YYYY-MM-DD)
 */
export function getDateOfBirthFromAge(age: number): string {
  const today = new Date();
  const approximateBirthYear = today.getFullYear() - age;
  
  // Use January 1st as default
  const dateOfBirth = new Date(approximateBirthYear, 0, 1);
  
  return dateOfBirth.toISOString().split('T')[0];
}

/**
 * Format date for display in input fields
 * @param dateString - Date in ISO format
 * @returns Formatted date string for input
 */
export function formatDateForInput(dateString: string): string {
  return dateString.split('T')[0];
}

/**
 * Check if a person is an adult (18 or older)
 * @param dateOfBirth - Date of birth in ISO string format
 * @returns Boolean indicating if person is adult
 */
export function isAdult(dateOfBirth: string): boolean {
  try {
    return calculateAge(dateOfBirth) >= 18;
  } catch {
    return false;
  }
} 