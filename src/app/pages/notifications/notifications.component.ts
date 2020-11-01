import { Component, OnInit } from '@angular/core';
import { REMINDER } from '../../constants/variable.constants';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  types = [
    'all',
    'material viewed',
    'email opened',
    'follow up',
    'lead capture',
    'unsubscribe'
  ];
  reminders = REMINDER;
  reminder_time = '';

  constructor() {}

  ngOnInit(): void {}
}
