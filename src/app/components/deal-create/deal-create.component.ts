import { Component, Inject, OnInit } from '@angular/core';
import { Contact } from 'src/app/models/contact.model';
import { DealsService } from 'src/app/services/deals.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DealStage } from 'src/app/models/deal-stage.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-deal-create',
  templateUrl: './deal-create.component.html',
  styleUrls: ['./deal-create.component.scss']
})
export class DealCreateComponent implements OnInit {
  contacts: Contact[] = [];
  title = '';
  value = '';
  submitted = false;
  stages: any[] = [];
  selectedStage = '';
  note = '';
  saving = false;
  createSubscription: Subscription;

  constructor(
    private dealsService: DealsService,
    private dialogRef: MatDialogRef<DealCreateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.dealsService.stages$.subscribe((res) => {
      this.stages = [...this.stages, ...res];
      this.stages.forEach((stage) => {
        if (stage._id == this.data.id) {
          this.selectedStage = stage._id;
        }
      });
    });
  }

  createDeals(): void {
    if (this.contacts.length == 0) {
      return;
    } else {
      this.saving = true;
      const data = {
        deal_stage: this.selectedStage,
        contact: this.contacts[0],
        title: this.title,
        value: this.value,
        note: this.note
      };
      this.dealsService.createDeal(data).subscribe((res) => {
        if (res) {
          this.saving = false;
          this.dialogRef.close(res['data']);
        }
      });
    }
  }
}
