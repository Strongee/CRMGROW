import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PlanSelectComponent } from 'src/app/components/plan-select/plan-select.component';

@Component({
  selector: 'app-sms-limits',
  templateUrl: './sms-limits.component.html',
  styleUrls: ['./sms-limits.component.scss']
})
export class SmsLimitsComponent implements OnInit {
  smsType = 'third-party';
  smsPercent = 0;
  subTitle = '';
  totalSms = 200;
  leftSms = 150;

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    this.smsPercent = (this.leftSms / this.totalSms) * 100;
  }

  changeType(type: string): void {
    this.smsType = type;
  }

  buyMore(): void {
    this.dialog.open(PlanSelectComponent, {
      position: { top: '100px' },
      width: '100vw',
      maxWidth: '650px',
      disableClose: true
    });
  }
}
