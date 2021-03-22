import { Component, Inject, OnInit } from '@angular/core';
import { getCurrentTimezone, numPad } from '../../helper';
import { TIMES } from 'src/app/constants/variable.constants';
import { UserService } from '../../services/user.service';
import * as moment from 'moment';
import { HelperService } from '../../services/helper.service';
import { TaskService } from '../../services/task.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { HandlerService } from 'src/app/services/handler.service';
import { ContactService } from 'src/app/services/contact.service';

@Component({
  selector: 'app-task-bulk',
  templateUrl: './task-bulk.component.html',
  styleUrls: ['./task-bulk.component.scss']
})
export class TaskBulkComponent implements OnInit {
  keepSubject = 'keep_subject';
  keepDate = 'keep_date';
  TIMES = TIMES;
  MIN_DATE = {};

  type = '';
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
    private handlerService: HandlerService,
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
    });
    this.ids = this.data.ids;
    if (this.ids.length > 1) {
      this.initTime();
    }
  }

  initTime(): void {
    const standardTime = moment.tz(new Date(), '');
    let dateTimeObj;
    if (this.timezone.tz_name) {
      const myTime = standardTime.clone().tz(this.timezone.tz_name);
      dateTimeObj = {
        year: myTime.get('year'),
        month: myTime.get('month') + 1,
        day: myTime.get('date')
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
    let due_date = '';
    if (this.keepDate === 'new_date') {
      if (!this.date) {
        return;
      }
      if (this.timezone.tz_name) {
        const dateStr = `${this.date.year}-${numPad(this.date.month)}-${numPad(
          this.date.day
        )} ${this.time}`;
        due_date = moment.tz(dateStr, this.timezone.tz_name).format();
      } else {
        due_date = `${this.date.year}-${numPad(this.date.month)}-${numPad(
          this.date.day
        )}T${this.time}${this.timezone.zone}`;
      }
    }

    const data = { ids: this.ids };
    let isValid = false;
    if (this.type) {
      data['type'] = this.type;
      isValid = true;
    }
    if (this.subject) {
      data['content'] = this.subject;
      isValid = true;
    }
    if (due_date) {
      data['due_date'] = due_date;
      isValid = true;
    }
    if (isValid) {
      this.updating = true;
      this.bulkUpdateSubscription && this.bulkUpdateSubscription.unsubscribe();
      this.taskService.bulkUpdate(data).subscribe((status) => {
        this.updating = false;
        if (status) {
          this.handlerService.updateTasks$(this.ids, {
            ...data,
            ids: undefined
          });
          this.dialogRef.close();
        }
      });
    }
  }
}
