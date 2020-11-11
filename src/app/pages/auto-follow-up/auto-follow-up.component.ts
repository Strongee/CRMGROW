import { Component, OnInit } from '@angular/core';
import { DELAY } from '../../constants/variable.constants';

@Component({
  selector: 'app-auto-follow-up',
  templateUrl: './auto-follow-up.component.html',
  styleUrls: ['./auto-follow-up.component.scss']
})
export class AutoFollowUpComponent implements OnInit {
  watch_delay = '';
  notwatch_delay = '';
  watch_content = '';
  notwatch_content = '';
  delays;
  constructor() {}

  ngOnInit(): void {
    this.delays = DELAY;
  }
}
