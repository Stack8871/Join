import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Firebase } from './Shared/firebase/firebase-services/firebase-services';
import { Header } from './Shared/header/header';
import { SectionSidebar } from './Shared/section-sidebar/section-sidebar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SectionSidebar, Header],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'join';
    firebase = inject(Firebase);
}
