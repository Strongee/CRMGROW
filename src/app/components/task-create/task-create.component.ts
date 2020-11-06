import { Component, OnDestroy, OnInit } from '@angular/core';
import { REPEAT_DURATIONS, TIMES } from 'src/app/constants/variable.constants';
import { Task } from 'src/app/models/task.model';

@Component({
  selector: 'app-task-create',
  templateUrl: './task-create.component.html',
  styleUrls: ['./task-create.component.scss']
})
export class TaskCreateComponent implements OnInit, OnDestroy {
  REPEAT_DURATIONS = REPEAT_DURATIONS;
  TIMES = TIMES;
  MIN_DATE = {};

  date;
  time = '12:00:00.000';
  task = new Task();

  constructor() {
    const current = new Date();
    this.MIN_DATE = {
      year: current.getFullYear(),
      month: current.getMonth() + 1,
      day: current.getDate()
    };
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {}

  toggleRepeatSetting(): void {
    this.task.is_repeat = !this.task.is_repeat;
  }
  submit(): void {}
}
