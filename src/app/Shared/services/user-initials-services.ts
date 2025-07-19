import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserInitialsServices {
  
  private readonly colors = [
    '#EF4444', '#F97316', '#F59E0B', '#EAB308',
    '#84CC16', '#22C55E', '#10B981', '#14B8A6',
    '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
    '#8B5CF6', '#A855F7', '#D946EF', '#EC4899',
    '#F43F5E'
  ];

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
   * @returns Eine Hex-Farbe
   */
  getColor(name: string): string {
    if (!name || name.trim() === '') {
      return '#6B7280'; // Standard-Grau
    }
    
    const trimmedName = name.trim();
    let hash = 0;
    
    // Hash-Berechnung
    for (let i = 0; i < trimmedName.length; i++) {
      hash = trimmedName.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Index bestimmen
    const index = Math.abs(hash) % this.colors.length;
    return this.colors[index];
  }

  /**
   * Generiert sowohl Initialen als auch Farbe für einen Namen
   * @param name - Der Name
   * @returns Objekt mit initials und color
   */
  getUserDisplay(name: string): { initials: string; color: string } {
    return {
      initials: this.getInitials(name),
      color: this.getColor(name)
    };
  }

  /**
   * Erstellt ein Array von Display-Objekten für mehrere Namen
   * @param names - Array von Namen
   * @returns Array von Objekten mit initials und color
   */
  getMultipleUserDisplays(names: string[]): { name: string; initials: string; color: string }[] {
    return names.map(name => ({
      name: name,
      initials: this.getInitials(name),
      color: this.getColor(name)
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