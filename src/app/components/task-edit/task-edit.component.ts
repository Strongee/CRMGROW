import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { REPEAT_DURATIONS, TIMES } from 'src/app/constants/variable.constants';
import { Task } from 'src/app/models/task.model';
import { HandlerService } from 'src/app/services/handler.service';
import { StoreService } from 'src/app/services/store.service';
import { TaskService } from 'src/app/services/task.service';
import * as moment from 'moment';
import 'moment-timezone';
import { UserService } from 'src/app/services/user.service';
import { HelperService } from 'src/app/services/helper.service';
import { getCurrentTimezone } from 'src/app/helper';

@Component({
  selector: 'app-task-edit',
  templateUrl: './task-edit.component.html',
  styleUrls: ['./task-edit.component.scss']
})
export class TaskEditComponent implements OnInit {
  REPEAT_DURATIONS = REPEAT_DURATIONS;
  TIMES = TIMES;
  MIN_DATE = {};

  date;
  time = '12:00:00.000';
  task = new Task();

  timezone;

  saving = false;
  saveSubscription: Subscription;

  constructor(
    private taskService: TaskService,
    private handlerService: HandlerService,
    private userService: UserService,
    private helperService: HelperService,
    private dialogRef: MatDialogRef<TaskEditComponent>,
    @Inject(MAT_DIALOG_DATA) private data: Task
  ) {
    const current = new Date();
    this.MIN_DATE = {
      year: current.getFullYear(),
      month: current.getMonth() + 1,
      day: current.getDate()
    };
    this.userService.profile$.subscribe((user) => {
      try {
        this.timezone = JSON.parse(user.time_zone_info);
      } catch (err) {
        const timezone = getCurrentTimezone();
        this.timezone = { zone: user.time_zone || timezone };
      }
      if (this.task && this.task._id) {
        this.initTime();
      }
    });
    if (this.data) {
      this.task = this.data;
      if (this.timezone) {
        this.initTime();
      }
    }
  }

  initTime(): void {
    const standardTime = moment.tz(this.task.due_date, '');
    let dateTimeObj;
    if (this.timezone.tz_name) {
      const myTime = standardTime.clone().tz(this.timezone.tz_name);
      const hour = myTime.get('hour');
      const min = myTime.get('minute');
      const hour_s = hour < 10 ? '0' + hour : hour;
      const min_s = min < 10 ? '0' + min : min;
      const time = `${hour_s}:${min_s}:00.000`;
      dateTimeObj = {
        year: myTime.get('year'),
        month: myTime.get('month') + 1,
        day: myTime.get('date'),
        time: time
      };
    } else {
      dateTimeObj = this.helperService.customTzTime(
        standardTime.format(),
        this.timezone.zone
      );
    }
    this.date = {
      year: dateTimeObj.year,
      month: dateTimeObj.month,
      day: dateTimeObj.day
    };
    this.time = dateTimeObj.time;
  }

  ngOnInit(): void {}

  toggleRepeatSetting(): void {
    this.task.is_repeat = !this.task.is_repeat;
  }
  submit(): void {
    // if (!this.contacts.length) {
    //   return;
    // }
    // this.saving = true;
    // const ids = [];
    // this.contacts.forEach((e) => {
    //   ids.push(e._id);
    // });
    // const dateStr = `${this.date.year}-${this.date.month}-${this.date.day} ${this.time}`;
    // const due_date = moment.tz(dateStr, 'America/Chicago');
    // const data = {
    //   contacts: ids,
    //   type: this.task.type,
    //   content: this.task.content,
    //   due_date: due_date
    // };
    // this.saveSubscription && this.saveSubscription.unsubscribe();
    // this.saveSubscription = this.taskService
    //   .bulkCreate(data)
    //   .subscribe((res) => {
    //     this.saving = false;
    //     this.handlerService.activityAdd$(ids, 'task');
    //     this.dialogRef.close();
    //   });
  }
}
