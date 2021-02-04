import { Component, Inject, OnInit } from '@angular/core';
import { DealsService } from 'src/app/services/deals.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Deal } from 'src/app/models/deal.model';
import { Contact } from 'src/app/models/contact.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-deal-edit',
  templateUrl: './deal-edit.component.html',
  styleUrls: ['./deal-edit.component.scss']
})
export class DealEditComponent implements OnInit {
  deal = new Deal();
  saving = false;
  saveSubscription: Subscription;

  constructor(
    public dealsService: DealsService,
    private dialogRef: MatDialogRef<DealEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (this.data && this.data.deal) {
      this.deal.deserialize(this.data.deal);
    }
  }

  ngOnInit(): void {}

  editDeals(): void {
    const data = {
      title: this.deal.title,
      deal_stage: this.deal.deal_stage,
      value: this.deal.value
    };
    this.saveSubscription && this.saveSubscription.unsubscribe();
    this.saving = true;
    this.saveSubscription = this.dealsService
      .editDeal(this.deal._id, data)
      .subscribe((res) => {
        this.saving = false;
        if (res) {
          this.dialogRef.close(data);
        }
      });
  }
}
