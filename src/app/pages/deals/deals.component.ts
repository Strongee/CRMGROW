import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem
} from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
import { DealsService } from 'src/app/services/deals.service';
import { MatDialog } from '@angular/material/dialog';
import { DealCreateComponent } from 'src/app/components/deal-create/deal-create.component';
import { DialogSettings, STATUS } from 'src/app/constants/variable.constants';
import { DealStage } from 'src/app/models/deal-stage.model';
import { DealStageCreateComponent } from 'src/app/components/deal-stage-create/deal-stage-create.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-deals',
  templateUrl: './deals.component.html',
  styleUrls: ['./deals.component.scss']
})
export class DealsComponent implements OnInit, OnDestroy {
  STATUS = STATUS;
  loadSubscription: Subscription;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    public dealsService: DealsService
  ) {
    this.dealsService.getStage(true);
    this.loadSubscription && this.loadSubscription.unsubscribe();
    this.loadSubscription = this.dealsService.stages$.subscribe((res) => {});
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.loadSubscription && this.loadSubscription.unsubscribe();
  }

  drop(event: CdkDragDrop<string[]>, id: string): void {
    const data = {
      deal_id: event.previousContainer.data[event.previousIndex]['_id'],
      position: event.currentIndex,
      deal_stage_id: id
    };
    const deal = event.previousContainer.data[event.previousIndex];
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    this.dealsService.moveDeal(data).subscribe(() => {
      if (deal['deal_stage'] !== id) {
        const stages = this.dealsService.stages.getValue();
        const sourceStage = stages.filter(
          (stage) => stage._id === deal['deal_stage']
        )[0];
        const targetStage = stages.filter((stage) => stage._id === id)[0];
        sourceStage.deals_count = sourceStage.deals.length;
        targetStage.deals_count = targetStage.deals.length;
      }
    });
  }

  dealDetail(id: string): void {
    this.router.navigate([`./deals/${id}`]);
  }

  addStages(): void {
    this.dialog
      .open(DealStageCreateComponent, {
        position: { top: '100px' },
        width: '100vw',
        maxWidth: '400px'
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.dealsService.createStage$(new DealStage().deserialize(res));
        }
      });
  }

  addDeals(dealStage: any): void {
    this.dialog
      .open(DealCreateComponent, {
        position: { top: '100px' },
        width: '100vw',
        maxWidth: '600px',
        disableClose: true,
        data: {
          id: dealStage._id
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.dealsService.getStage(true);
        }
      });
  }

  addNewDeal(): void {
    this.dialog
      .open(DealCreateComponent, DialogSettings.DEAL)
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.dealsService.getStage(true);
        }
      });
  }

  getAvatarName(contact: any): string {
    if (contact) {
      if (contact.first_name && contact.last_name) {
        return contact.first_name[0] + contact.last_name[0];
      } else if (contact.first_name) {
        return contact.first_name.substring(0, 2);
      } else if (contact.last_name) {
        return contact.last_name.substring(0, 2);
      } else {
        return 'UN';
      }
    }
  }
}
