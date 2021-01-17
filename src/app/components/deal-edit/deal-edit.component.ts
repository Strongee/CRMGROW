import { Component, Inject, OnInit } from '@angular/core';
import { DealsService } from 'src/app/services/deals.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Deal } from 'src/app/models/deal.model';

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
    this.deal = this.data.deal;
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
    this.dialogRef.close();
  }
}
