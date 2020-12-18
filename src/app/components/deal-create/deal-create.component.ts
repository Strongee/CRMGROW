import { Component, Inject, OnInit } from '@angular/core';
import { Contact } from 'src/app/models/contact.model';
import { DealsService } from 'src/app/services/deals.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-deal-create',
  templateUrl: './deal-create.component.html',
  styleUrls: ['./deal-create.component.scss']
})
export class DealCreateComponent implements OnInit {
  contacts: Contact[] = [];
  title = '';
  submitted = false;
  saving = false;

  constructor(
    private dealsService: DealsService,
    private dialogRef: MatDialogRef<DealCreateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {}

  select(evt: any): void {
    console.log('###', evt);
  }

  createStages(): void {
    this.saving = true;
    const data = {
      title: this.title
    };
    this.dealsService.createStage(data).subscribe((res) => {
      if (res) {
        this.saving = false;
        this.dialogRef.close(res['data']);
      }
    });
  }

  createDeals(): void {
    this.saving = true;
    const data = {
      deal_stage: this.data.id,
      contact: this.contacts[0],
      title: this.title
    };
    this.dealsService.createDeal(data).subscribe((res) => {
      if (res) {
        this.saving = false;
        this.dialogRef.close(res['data']);
      }
    });
  }
}
