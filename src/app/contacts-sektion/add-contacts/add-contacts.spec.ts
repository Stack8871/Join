import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddContacts } from './add-contacts';

describe('AddContacts', () => {
  let component: AddContacts;
  let fixture: ComponentFixture<AddContacts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddContacts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddContacts);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
