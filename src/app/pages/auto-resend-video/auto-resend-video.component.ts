import { Component, OnInit } from '@angular/core';
import { DELAY } from '../../constants/variable.constants';

@Component({
  selector: 'app-auto-resend-video',
  templateUrl: './auto-resend-video.component.html',
  styleUrls: ['./auto-resend-video.component.scss']
})
export class AutoResendVideoComponent implements OnInit {
  finish_email_template = '';
  finish_sms_template = '';
  watch_email_template = '';
  watch_sms_template = '';
  finish_delay_time = '';
  watch_delay_time = '';
  delays;
  constructor() {}

  ngOnInit(): void {
    this.delays = DELAY;
  }
}
