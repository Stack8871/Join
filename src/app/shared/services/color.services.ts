import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ColorService {
  private readonly goldenAngle = 137.5;


  generateColorByIndex(index: number): string {

    const hue = (index * this.goldenAngle) % 360;


    const saturation = 70;
    const lightness = 55;

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }


  generateColorByString(str: string): string {
    // Create a simple hash from the string
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Convert hash to an index and use the golden angle method
    const index = Math.abs(hash);
    return this.generateColorByIndex(index);
  }
}