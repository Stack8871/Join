import { Injectable } from '@angular/core';
import { ContactsInterface } from '../../../interfaces/contacts-interface';

/**
 * Service for grouping contacts by alphabetical order
 * Provides functionality to organize contacts by first letter and sort them
 * 
 * @example
 * ```typescript
 * constructor(private groupingService: ContactGroupingService) {}
 * 
 * organizeContacts() {
 *   const grouped = this.groupingService.groupContactsByLetter(this.contacts);
 *   const keys = this.groupingService.getGroupedKeys(grouped);
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class ContactGroupingService {
  
  /**
   * Groups contacts by the first letter of their name
   * Sorts contacts alphabetically within each group
   * @param contacts - Array of contacts to group
   * @returns Object with letters as keys and contact arrays as values
   */
  groupContactsByLetter(contacts: ContactsInterface[]): { [letter: string]: ContactsInterface[] } {
    const grouped: { [letter: string]: ContactsInterface[] } = {};
    
    contacts.forEach(contact => {
      const firstLetter = contact.name.charAt(0).toUpperCase();
      if (!grouped[firstLetter]) {
        grouped[firstLetter] = [];
      }
      grouped[firstLetter].push(contact);
    });

    Object.keys(grouped).forEach(letter => {
      grouped[letter].sort((a, b) => a.name.localeCompare(b.name));
    });

    return grouped;
  }

  /**
   * Gets sorted array of group letters from grouped contacts
   * @param groupedContacts - Object containing grouped contacts by letter
   * @returns Sorted array of letters
   */
  getGroupedKeys(groupedContacts: { [letter: string]: ContactsInterface[] }): string[] {
    return Object.keys(groupedContacts).sort();
  }
}
