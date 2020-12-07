import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { REPEAT_DURATIONS, TIMES } from 'src/app/constants/variable.constants';
import { Contact } from 'src/app/models/contact.model';
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
  isSelected = false;
  contacts: Contact[] = [];

  constructor(
    private dialogRef: MatDialogRef<TaskCreateComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {
    const current = new Date();
    this.MIN_DATE = {
      year: current.getFullYear(),
      month: current.getMonth() + 1,
      day: current.getDate()
    };
    if (this.data && this.data.contacts) {
      this.isSelected = true;
      this.contacts = this.data.contacts;
    }
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {}

  toggleRepeatSetting(): void {
    this.task.is_repeat = !this.task.is_repeat;
  }
  selectContact(event: Contact): void {
    this.contacts = [event];
  }
  submit(): void {}
}
