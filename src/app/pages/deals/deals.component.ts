import { Component, OnInit } from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem
} from '@angular/cdk/drag-drop';
import { Board } from 'src/app/models/board.model';
import { Column } from 'src/app/models/column.model';
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
        res['data'].forEach((stage) => {
          const column = new Column(stage.title, []);
          this.board.columns.push(column);
        });
      }
    });
    this.dealsService.getDeal().subscribe((res) => {
      if (res) {
        console.log('###', res);
      }
    });
  }

  ngOnInit(): void {}

  drop(event: CdkDragDrop<string[]>): void {
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
  }

  taskDetail(item: string): void {
    this.router.navigate(['./deals/detail']);
  }

  addColumns(): void {
    this.dialog
      .open(DealCreateComponent, {
        position: { top: '100px' },
        width: '100vw',
        maxWidth: '400px'
      })
      .afterClosed()
      .subscribe((res) => {
        const stage = new Column(res.title, []);
        this.board.columns.push(stage);
      });
  }

  addTasks(tasks: string[]): void {
    // tasks.push('New Task');
    this.dealsService.createDeal().subscribe((res) => {
      if (res) {
        console.log('###', res);
      }
    })
  }
}
