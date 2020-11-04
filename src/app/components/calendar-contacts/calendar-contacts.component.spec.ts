import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarContactsComponent } from './calendar-contacts.component';

describe('CalendarContactsComponent', () => {
  let component: CalendarContactsComponent;
  let fixture: ComponentFixture<CalendarContactsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalendarContactsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalendarContactsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
