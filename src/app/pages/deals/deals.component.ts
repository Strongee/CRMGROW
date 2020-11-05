import { Component, OnInit } from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem
} from '@angular/cdk/drag-drop';
import { Board } from 'src/app/models/board.model';
import { Column } from 'src/app/models/column.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-deals',
  templateUrl: './deals.component.html',
  styleUrls: ['./deals.component.scss']
})
export class DealsComponent implements OnInit {
  board: Board = new Board('Test Board', [
    new Column('New lead - Working', [
      'Real Estate sale 1',
      'Real Estate sale 2',
      'Real Estate sale 3',
      'Real Estate sale 4'
    ]),
    new Column('50% Commited', [
      'Lorem ipsum',
      'foo',
      "This was in the 'Research' column"
    ]),
    new Column('Opportunity Fully Presented', [
      'Get to work',
      'Pick up groceries',
      'Go home',
      'Fall asleep'
    ]),
    new Column('Proposal Made', [
      'Get up',
      'Brush teeth',
      'Take a shower',
      'Check e-mail',
      'Walk dog'
    ])
  ]);

  constructor(private router: Router) {}

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
    const newColumn = new Column('New Column', []);
    this.board.columns.push(newColumn);
  }

  addTasks(tasks: string[]): void {
    tasks.push('New Task');
  }
}
