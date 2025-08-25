import { Injectable } from '@angular/core';
import { ContactsInterface } from '../../../interfaces/contacts-interface';

@Injectable({
  providedIn: 'root'
})
export class ContactGroupingService {
  
  groupContactsByLetter(contacts: ContactsInterface[]): { [letter: string]: ContactsInterface[] } {
    const grouped: { [letter: string]: ContactsInterface[] } = {};
    
    contacts.forEach(contact => {
      const firstLetter = contact.name.charAt(0).toUpperCase();
      if (!grouped[firstLetter]) {
        grouped[firstLetter] = [];
      }
      grouped[firstLetter].push(contact);
    });

    // Sort contacts within each group by name
    Object.keys(grouped).forEach(letter => {
      grouped[letter].sort((a, b) => a.name.localeCompare(b.name));
    });

    return grouped;
  }

  getGroupedKeys(groupedContacts: { [letter: string]: ContactsInterface[] }): string[] {
    return Object.keys(groupedContacts).sort();
  }
}
