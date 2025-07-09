import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginService } from './login.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  standalone: true
})
export class Login {
  constructor(private loginService: LoginService) {}

  closeOverlay() {
    this.loginService.closeLoginOverlay();
  }
}
