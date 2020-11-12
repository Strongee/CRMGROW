import { Component, OnInit } from '@angular/core';
import { AUTO_RESEND_DELAY } from '../../constants/variable.constants';

@Component({
  selector: 'app-auto-resend-video',
  templateUrl: './auto-resend-video.component.html',
  styleUrls: ['./auto-resend-video.component.scss']
})
export class AutoResendVideoComponent implements OnInit {
  finishEmailTemplate = { subject: '', content: '' };
  finishSmsTemplate = { subject: '', content: '' };
  watchEmailTemplate = { subject: '', content: '' };
  watchSmsTemplate = { subject: '', content: '' };
  finish_delay_time = '';
  watch_delay_time = '';
  delays;
  constructor() {}

  ngOnInit(): void {
    this.delays = AUTO_RESEND_DELAY;
  }

  selectFinishEmailTemplate(event): void {
    this.finishEmailTemplate = event;
  }

  selectFinishSmsTemplate(event): void {
    this.finishSmsTemplate = event;
  }

  selectWatchEmailTemplate(event): void {
    this.watchEmailTemplate = event;
  }

  selectWatchSmsTemplate(event): void {
    this.watchSmsTemplate = event;
  }
}
