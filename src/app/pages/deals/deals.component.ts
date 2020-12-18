import { Component, OnInit } from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem
} from '@angular/cdk/drag-drop';
import { Board } from 'src/app/models/board.model';
import { DealStage } from 'src/app/models/deal-stage.model';
import { Router } from '@angular/router';
import { DealsService } from 'src/app/services/deals.service';
import { MatDialog } from '@angular/material/dialog';
import { DealCreateComponent } from 'src/app/components/deal-create/deal-create.component';

@Component({
  selector: 'app-deals',
  templateUrl: './deals.component.html',
  styleUrls: ['./deals.component.scss']
})
export class DealsComponent implements OnInit {
  board: Board = new Board('Test Board', []);

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private dealsService: DealsService
  ) {
    this.dealsService.getStage().subscribe((res) => {
      if (res) {
        this.board.dealStages = res['data'];
      }
    });
  }

  ngOnInit(): void {}

  drop(event: CdkDragDrop<string[]>, id: string): void {
    const data = {
      deal_id: event.previousContainer.data[event.previousIndex]['_id'],
      position: event.currentIndex,
      deal_stage_id: id
    };
    this.dealsService.moveDeal(data).subscribe(() => {
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
    });
  }

  taskDetail(item: string): void {
    this.router.navigate(['./deals/detail']);
  }

  addColumns(): void {
    this.dialog
      .open(DealCreateComponent, {
        position: { top: '100px' },
        width: '100vw',
        maxWidth: '400px',
        data: {
          type: 'deal-stage'
        }
      })
      .afterClosed()
      .subscribe((res) => {
        this.board.dealStages.push(res);
      });
  }

  addTasks(dealStage: any): void {
    this.dialog
      .open(DealCreateComponent, {
        position: { top: '100px' },
        width: '100vw',
        maxWidth: '400px',
        data: {
          id: dealStage._id,
          type: 'deal'
        }
      })
      .afterClosed()
      .subscribe((res) => {
        dealStage.deals.push(res);
      });
  }
}
