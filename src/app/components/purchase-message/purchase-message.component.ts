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
    { type: 'mini', sms: '250', price: '6' },
    { type: 'medium', sms: '500', price: '10' },
    { type: 'maxi', sms: '1000', price: '15' }
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
