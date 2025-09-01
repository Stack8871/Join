import { Injectable } from '@angular/core';

/**
 * Service for generating user initials and color assignments.
 * Provides consistent color assignment and initial generation for user names.
 * 
 * @example
 * ```typescript
 * constructor(private userInitials: UserInitialsServices) {
 *   const display = this.userInitials.getUserDisplay('John Doe', 'john@example.com');
 *   console.log(display.initials); // 'JD'
 *   console.log(display.color); // '#EF4444'
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class UserInitialsServices {
  
  /** Array of predefined colors for user avatar backgrounds */
  private readonly colors = [
    '#EF4444', '#F97316', '#F59E0B', '#EAB308',
    '#84CC16', '#22C55E', '#10B981', '#14B8A6',
    '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
    '#8B5CF6', '#A855F7', '#D946EF', '#EC4899',
    '#F43F5E',
    '#DC2626', '#EA580C', '#D97706', '#CA8A04',
    '#65A30D', '#16A34A', '#059669', '#0D9488',
    '#0891B2', '#0284C7', '#2563EB', '#4F46E5',
    '#7C3AED', '#9333EA', '#C026D3', '#DB2777',
    '#E11D48', '#BE123C', '#991B1B', '#92400E',
    '#F472B6', '#FB7185', '#FBBF24', '#FCD34D',
    '#A3E635', '#4ADE80', '#34D399', '#2DD4BF',
    '#38BDF8', '#60A5FA', '#818CF8', '#A78BFA',
    '#C084FC', '#E879F9', '#F87171', '#FB923C',
    '#15803D', '#166534', '#0F766E', '#155E75'
  ];

  /** Map to store persistent color assignments for users based on name/email */
  private readonly colorAssignments = new Map<string, string>();
  
  /** Index counter for cycling through available colors */
  private colorIndex = 0;

  /**
   * Generates initials from a full name
   * @param name - The full name
   * @returns The initials (max. 2 characters)
   */
  getInitials(name: string): string {
    if (!name || name.trim() === '') {
      return '';
    }
    
    const trimmedName = name.trim();
    const nameParts = trimmedName.split(' ').filter(part => part.length > 0);
    
    if (nameParts.length === 0) {
      return '';
    }
    
    if (nameParts.length === 1) {
      return nameParts[0].substring(0, 2).toUpperCase();
    }
    
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  }

  /**
   * Generates a consistent color for a name
   * @param name - The employee/contact name
   * @param email - Optional email for additional uniqueness
   * @returns A hex color code
   */
  getColor(name: string, email?: string): string {
    if (!name || name.trim() === '') {
      return '#6B7280'; 
    }
    
    const identifier = email?.trim().toLowerCase() || name.trim().toLowerCase();
    
    if (this.colorAssignments.has(identifier)) {
      return this.colorAssignments.get(identifier)!;
    }
    
    const color = this.colors[this.colorIndex % this.colors.length];
    this.colorAssignments.set(identifier, color);
    this.colorIndex++;
    
    return color;
  }

  /**
   * Resets color assignments (for tests or reset)
   */
  resetColorAssignments(): void {
    this.colorAssignments.clear();
    this.colorIndex = 0;
  }

  /**
   * Generates both initials and color for a name
   * @param name - The name
   * @param email - Optional email for unique color assignment
   * @returns Object with initials and color properties
   */
  getUserDisplay(name: string, email?: string): { initials: string; color: string } {
    return {
      initials: this.getInitials(name),
      color: this.getColor(name, email)
    };
  }

  /**
   * Creates an array of display objects for multiple names
   * @param contacts - Array of objects with name and optional email
   * @returns Array of objects with initials, color, name and email properties
   */
  getMultipleUserDisplays(contacts: Array<{ name: string; email?: string }>): { name: string; initials: string; color: string; email?: string }[] {
    return contacts.map(contact => ({
      name: contact.name,
      email: contact.email,
      initials: this.getInitials(contact.name),
      color: this.getColor(contact.name, contact.email)
    }));
  }

  /**
   * Returns all available colors
   * @returns Array of available color codes
   */
  getAvailableColors(): string[] {
    return [...this.colors];
  }
}