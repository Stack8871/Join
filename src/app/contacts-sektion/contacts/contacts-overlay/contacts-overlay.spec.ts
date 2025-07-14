import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactsOverlay } from './contacts-overlay';

describe('ContactsOverlay', () => {
  let component: ContactsOverlay;
  let fixture: ComponentFixture<ContactsOverlay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactsOverlay]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactsOverlay);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
