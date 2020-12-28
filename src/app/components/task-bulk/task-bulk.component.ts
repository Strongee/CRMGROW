import { Component, Inject, OnInit } from '@angular/core';
import { getCurrentTimezone } from '../../helper';
import { TIMES } from 'src/app/constants/variable.constants';
import { UserService } from '../../services/user.service';
import * as moment from 'moment';
import { HelperService } from '../../services/helper.service';
import { TaskService } from '../../services/task.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-task-bulk',
  templateUrl: './task-bulk.component.html',
  styleUrls: ['./task-bulk.component.scss']
})
export class TaskBulkComponent implements OnInit {
  keepSubject = 'new_subject';
  keepDate = 'new_date';
  TIMES = TIMES;
  MIN_DATE = {};
  subject = '';
  date;
  time = '12:00:00.000';
  timezone;
  ids = [];

  updating = false;
  bulkUpdateSubscription: Subscription;

  constructor(
    private dialogRef: MatDialogRef<TaskBulkComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userService: UserService,
    private helperService: HelperService,
    private taskService: TaskService
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
      this.initTime();
    });
    this.ids = this.data.ids;
  }

  initTime(): void {
    const standardTime = moment.tz(new Date(), '');
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
  }

  ngOnInit(): void {}

  submit(): void {
    this.updating = true;
    const dateStr = `${this.date.year}-${this.date.month}-${this.date.day} ${this.time}`;
    const due_date = moment.tz(dateStr, 'America/Chicago');
    const data = {
      ids: this.ids,
      content: this.subject,
      due_date
    };
    this.bulkUpdateSubscription && this.bulkUpdateSubscription.unsubscribe();
    this.taskService.bulkUpdate(data).subscribe(
      (res) => {
        this.updating = false;
        if (res.status) {
          this.dialogRef.close({ status: true });
        } else {
          this.dialogRef.close({ status: false });
        }
      },
      (error) => {
        this.dialogRef.close({ status: false });
      }
    );
  }
}
