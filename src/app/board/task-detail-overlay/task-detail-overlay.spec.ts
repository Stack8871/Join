import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskDetailOverlay } from './task-detail-overlay';

describe('TaskDetailOverlay', () => {
  let component: TaskDetailOverlay;
  let fixture: ComponentFixture<TaskDetailOverlay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskDetailOverlay]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskDetailOverlay);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
