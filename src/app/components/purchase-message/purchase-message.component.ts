import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-purchase-message',
  templateUrl: './purchase-message.component.html',
  styleUrls: ['./purchase-message.component.scss']
})
export class PurchaseMessageComponent implements OnInit {
  currentType = 'medium';
  plans = [
    { type: 'mini', sms: '150', price: '5' },
    { type: 'medium', sms: '150', price: '13' },
    { type: 'maxi', sms: '150', price: '16' }
  ];

  constructor(
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<PurchaseMessageComponent>
  ) {}

  ngOnInit(): void {

  }

  selectPlan(plan): void {
    this.currentType = plan.type;
  }

  purchase(): void {

  }
}
