import { Component, Inject, OnInit } from '@angular/core';
import { DealsService } from 'src/app/services/deals.service';
import { MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-deal-stage-create',
  templateUrl: './deal-stage-create.component.html',
  styleUrls: ['./deal-stage-create.component.scss']
})
export class DealStageCreateComponent implements OnInit {
  title = '';
  submitted = false;
  saving = false;
  createSubscription: Subscription;

  constructor(
    private dealsService: DealsService,
    private dialogRef: MatDialogRef<DealStageCreateComponent>
  ) {}

  ngOnInit(): void {}

  createStages(): void {
    if (this.title == '') {
      return;
    } else {
      this.saving = true;
      const data = {
        title: this.title
      };
      this.createSubscription = this.dealsService.createStage(data).subscribe(
        (res) => {
          if (res) {
            this.saving = false;
            this.dialogRef.close(res);
          }
        },
        (err) => {
          this.saving = false;
        }
      );
    }
  }
}
