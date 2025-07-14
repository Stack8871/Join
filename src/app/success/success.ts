import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-success',
  imports: [CommonModule],
  templateUrl: './success.html',
  styleUrl: './success.scss'
})
export class Success{
  @Input() message = '';
}