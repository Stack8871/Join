import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserInitialsServices {
  
  private readonly colors = [
    // Original Farben (17)
    '#EF4444', '#F97316', '#F59E0B', '#EAB308',
    '#84CC16', '#22C55E', '#10B981', '#14B8A6',
    '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
    '#8B5CF6', '#A855F7', '#D946EF', '#EC4899',
    '#F43F5E',
    // Zusätzliche Farben (20)
    '#DC2626', '#EA580C', '#D97706', '#CA8A04',
    '#65A30D', '#16A34A', '#059669', '#0D9488',
    '#0891B2', '#0284C7', '#2563EB', '#4F46E5',
    '#7C3AED', '#9333EA', '#C026D3', '#DB2777',
    '#E11D48', '#BE123C', '#991B1B', '#92400E',
    // Weitere 20 Farben (Duplikate entfernt und ersetzt)
    '#F472B6', '#FB7185', '#FBBF24', '#FCD34D',
    '#A3E635', '#4ADE80', '#34D399', '#2DD4BF',
    '#38BDF8', '#60A5FA', '#818CF8', '#A78BFA',
    '#C084FC', '#E879F9', '#F87171', '#FB923C',
    '#15803D', '#166534', '#0F766E', '#155E75'
  ];

  // Lookup-Table für bereits zugewiesene Farben
  private readonly colorAssignments = new Map<string, string>();
  private colorIndex = 0;

  /**
   * Generiert Initialen aus einem Namen
   * @param name - Der vollständige Name
   * @returns Die Initialen (max. 2 Zeichen)
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
      // Bei nur einem Namen: erste 2 Buchstaben
      return nameParts[0].substring(0, 2).toUpperCase();
    }
    
    // Bei mehreren Namen: erster Buchstabe des ersten und letzten Namens
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  }

  /**
   * Generiert eine konsistente Farbe für einen Namen
   * @param name - Der Name des Mitarbeiters/Kontakts
   * @param email - Optional: E-Mail für zusätzliche Eindeutigkeit
   * @returns Eine Hex-Farbe
   */
  getColor(name: string, email?: string): string {
    if (!name || name.trim() === '') {
      return '#6B7280'; // Standard-Grau
    }
    
    // Verwende E-Mail als primären Identifier, fallback auf Name
    const identifier = email?.trim().toLowerCase() || name.trim().toLowerCase();
    
    // Schaue nach bereits zugewiesener Farbe
    if (this.colorAssignments.has(identifier)) {
      return this.colorAssignments.get(identifier)!;
    }
    
    // Weise die nächste verfügbare Farbe zu
    const color = this.colors[this.colorIndex % this.colors.length];
    this.colorAssignments.set(identifier, color);
    this.colorIndex++;
    
    return color;
  }

  /**
   * Setzt die Farbzuweisungen zurück (für Tests oder Reset)
   */
  resetColorAssignments(): void {
    this.colorAssignments.clear();
    this.colorIndex = 0;
  }

  /**
   * Gibt alle verfügbaren Farben zurück

  /**
   * Generiert sowohl Initialen als auch Farbe für einen Namen
   * @param name - Der Name
   * @param email - Optional: E-Mail für eindeutige Farbzuweisung
   * @returns Objekt mit initials und color
   */
  getUserDisplay(name: string, email?: string): { initials: string; color: string } {
    return {
      initials: this.getInitials(name),
      color: this.getColor(name, email)
    };
  }

  /**
   * Erstellt ein Array von Display-Objekten für mehrere Namen
   * @param contacts - Array von Objekten mit name und optional email
   * @returns Array von Objekten mit initials und color
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
   * Gibt alle verfügbaren Farben zurück
   * @returns Array der verfügbaren Farben
   */
  getAvailableColors(): string[] {
    return [...this.colors];
  }
}