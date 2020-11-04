import { Component, OnInit } from '@angular/core';
import { DELAY } from 'src/app/constants/variable.constants';

@Component({
  selector: 'app-lead-capture',
  templateUrl: './lead-capture.component.html',
  styleUrls: ['./lead-capture.component.scss']
})
export class LeadCaptureComponent implements OnInit {
  times = DELAY;
  delay_time = '';
  required_fields = ['Name', 'Text', 'Email'];

  constructor() {}

  ngOnInit(): void {}

  saveDelay(): void {}
}
