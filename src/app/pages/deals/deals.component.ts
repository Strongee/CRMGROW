import { Component, OnInit } from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem
} from '@angular/cdk/drag-drop';
import { Board } from 'src/app/models/board.model';
import { Router } from '@angular/router';
import { DealsService } from 'src/app/services/deals.service';
import { MatDialog } from '@angular/material/dialog';
import { DealCreateComponent } from 'src/app/components/deal-create/deal-create.component';
import { STATUS } from 'src/app/constants/variable.constants';
import { DealStage } from 'src/app/models/deal-stage.model';
import { DealStageCreateComponent } from 'src/app/components/deal-stage-create/deal-stage-create.component';

@Component({
  selector: 'app-deals',
  templateUrl: './deals.component.html',
  styleUrls: ['./deals.component.scss']
})
export class DealsComponent implements OnInit {
  STATUS = STATUS;
  board: Board = new Board('Test Board', []);

  constructor(
    private dialog: MatDialog,
    private router: Router,
    public dealsService: DealsService
  ) {
    this.dealsService.getStage(true);
  }

  ngOnInit(): void {
    this.dealsService.stages$.subscribe((res) => {
      console.log('stage', res);
    });
  }

  drop(event: CdkDragDrop<string[]>, id: string): void {
    const data = {
      deal_id: event.previousContainer.data[event.previousIndex]['_id'],
      position: event.currentIndex,
      deal_stage_id: id
    };
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
    console.log("move deal ============>", data);
    this.dealsService.moveDeal(data).subscribe(() => {});
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
