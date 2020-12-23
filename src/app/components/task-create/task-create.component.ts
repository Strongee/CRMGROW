import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { REPEAT_DURATIONS, TIMES } from 'src/app/constants/variable.constants';
import { Contact } from 'src/app/models/contact.model';
import { Task } from 'src/app/models/task.model';
import { HandlerService } from 'src/app/services/handler.service';
import { StoreService } from 'src/app/services/store.service';
import { TaskService } from 'src/app/services/task.service';
import { numPad, getCurrentTimezone } from 'src/app/helper';
import * as moment from 'moment';
import 'moment-timezone';
import { UserService } from 'src/app/services/user.service';
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

  saving = false;
  saveSubscription: Subscription;

  timezone;

  constructor(
    private taskService: TaskService,
    private handlerService: HandlerService,
    private userService: UserService,
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
    this.userService.profile$.subscribe((user) => {
      try {
        this.timezone = JSON.parse(user.time_zone_info);
      } catch (err) {
        const timezone = getCurrentTimezone();
        this.timezone = { zone: user.time_zone || timezone };
      }
    });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {}

  toggleRepeatSetting(): void {
    this.task.is_repeat = !this.task.is_repeat;
  }
  selectContact(event: Contact): void {
    this.contacts = [event];
  }
  submit(): void {
    if (!this.contacts.length) {
      return;
    }
    this.saving = true;
    const ids = [];
    this.contacts.forEach((e) => {
      ids.push(e._id);
    });
    let due_date = '';
    if (this.timezone.tz_name) {
      const dateStr = `${this.date.year}-${this.date.month}-${this.date.day} ${this.time}`;
      due_date = moment.tz(dateStr, this.timezone.tz_name).format();
    } else {
      due_date = `${this.date.year}-${numPad(this.date.month)}-${numPad(
        this.date.day
      )}T${this.time}${this.timezone.zone}`;
    }
    const data = {
      contacts: ids,
      type: this.task.type,
      content: this.task.content,
      due_date: due_date
    };
    this.saveSubscription && this.saveSubscription.unsubscribe();
    this.saveSubscription = this.taskService
      .bulkCreate(data)
      .subscribe((res) => {
        this.saving = false;
        this.handlerService.activityAdd$(ids, 'task');
        this.dialogRef.close();
      });
  }
}
