import { Injectable } from '@angular/core';

/**
 * Service for generating consistent colors based on string input.
 * Primarily used for creating unique background colors for user initials and contact avatars.
 * 
 * @example
 * ```typescript
 * constructor(private colorService: ColorService) {
 *   const userColor = this.colorService.generateColorByString('John Doe');
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class ColorService {
  /**
   * Generates a consistent color based on the input string.
   * Uses a hash function to convert the string into a hexadecimal color code.
   * @param str The input string to generate a color from
   * @returns A hexadecimal color code
   */
  generateColorByString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xFF;
      color += ('00' + value.toString(12)).substr(-2);
    }
    return color;
  }
}
