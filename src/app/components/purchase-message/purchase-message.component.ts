import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SmsService } from 'src/app/services/sms.service';

@Component({
  selector: 'app-purchase-message',
  templateUrl: './purchase-message.component.html',
  styleUrls: ['./purchase-message.component.scss']
})
export class PurchaseMessageComponent implements OnInit {
  saving = false;
  currentType = 2;
  plans = [
    { type: 1, sms: '250', price: '6' },
    { type: 2, sms: '500', price: '10' },
    { type: 3, sms: '1000', price: '15' }
  ];

  constructor(
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<PurchaseMessageComponent>,
    private smsService: SmsService
  ) {}

  ngOnInit(): void {}

  selectPlan(plan: any): void {
    this.currentType = plan.type;
  }

  purchase(): void {
    this.saving = true;
    const data = {
      option: this.currentType
    };
    this.smsService.buyCredit(data).subscribe(
      (res) => {
        if (res && res['status']) {
          this.saving = false;
        }
      },
      (err) => {
        this.saving = false;
      }
    );
  }
}
