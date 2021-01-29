import { Component, Inject, OnInit } from '@angular/core';
import { DealsService } from 'src/app/services/deals.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Deal } from 'src/app/models/deal.model';
import { Contact } from 'src/app/models/contact.model';

@Component({
  selector: 'app-deal-edit',
  templateUrl: './deal-edit.component.html',
  styleUrls: ['./deal-edit.component.scss']
})
export class DealEditComponent implements OnInit {
  stages: any[] = [];
  selectedStage = '';
  deal = {
    main: new Deal(),
    activities: [],
    contacts: []
  };
  saving = false;
  submitted = false;

  constructor(
    private dealsService: DealsService,
    private dialogRef: MatDialogRef<DealEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.deal = JSON.parse(JSON.stringify(this.data.deal));
    this.deal.contacts = (this.deal.contacts || []).map((e) =>
      new Contact().deserialize(e)
    );
  }

  ngOnInit(): void {
    this.dealsService.stages$.subscribe((res) => {
      this.stages = [...this.stages, ...res];
      this.stages.forEach((stage) => {
        if (stage._id == this.deal.main.deal_stage) {
          this.selectedStage = stage._id;
        }
      });
    });
  }

  editDeals(): void {
    this.dialogRef.close(this.deal);
  }
}
