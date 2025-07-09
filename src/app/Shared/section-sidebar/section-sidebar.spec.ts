import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionSidebar } from './section-sidebar';

describe('SectionSidebar', () => {
  let component: SectionSidebar;
  let fixture: ComponentFixture<SectionSidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionSidebar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SectionSidebar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
