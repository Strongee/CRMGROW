import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  resolveForwardRef
} from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog
} from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { REPEAT_DURATIONS, TIMES } from 'src/app/constants/variable.constants';
import { Task, TaskDetail } from 'src/app/models/task.model';
import { HandlerService } from 'src/app/services/handler.service';
import { StoreService } from 'src/app/services/store.service';
import { TaskService } from 'src/app/services/task.service';
import * as moment from 'moment';
import 'moment-timezone';
import { UserService } from 'src/app/services/user.service';
import { HelperService } from 'src/app/services/helper.service';
import { getCurrentTimezone, numPad } from 'src/app/helper';
import { TaskDeleteComponent } from '../task-delete/task-delete.component';
import { DealsService } from 'src/app/services/deals.service';
import { ToastrService } from 'ngx-toastr';

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
  task = new TaskDetail();

  timezone;
  type = '';
  deal = '';
  updating = false;
  updateSubscription: Subscription;

  constructor(
    private taskService: TaskService,
    private handlerService: HandlerService,
    private userService: UserService,
    private helperService: HelperService,
    private dealsService: DealsService,
    private dialog: MatDialog,
    private toastr: ToastrService,
    private dialogRef: MatDialogRef<TaskEditComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {
    const current = new Date();
    this.MIN_DATE = {
      year: current.getFullYear(),
      month: current.getMonth() + 1,
      day: current.getDate() - 1
    };
    this.userService.profile$.subscribe((user) => {
      try {
        this.timezone = JSON.parse(user.time_zone_info);
      } catch (err) {
        const timezone = getCurrentTimezone();
        this.timezone = { zone: user.time_zone || timezone };
      }
      console.log('timezone', this.timezone);
      if (this.task && this.task._id) {
        this.initTime();
      }
    });

    if (this.data) {
      if (this.data.type === 'deal') {
        this.type = 'deal';
        if (this.data.deal) {
          this.deal = this.data.deal;
        }
      }
      if (this.data.task) {
        this.task = this.task.deserialize(this.data.task);
        if (this.timezone) {
          this.initTime();
        }
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
    this.task.set_recurrence = !this.task.set_recurrence;
  }

  deleteTask(): void {
    const dialog = this.dialog.open(TaskDeleteComponent, {
      data: {
        ids: [this.task._id]
      }
    });

    dialog.afterClosed().subscribe((res) => {
      if (res && res.status) {
        this.handlerService.reload$('tasks');
        this.dialogRef.close();
      }
    });
  }

  submit(): void {
    let due_date = '';
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

    const data = {
      ...this.task,
      due_date
    };

    if (this.type === 'deal') {
      this.updating = true;
      this.updateSubscription && this.updateSubscription.unsubscribe();
      this.updateSubscription = this.dealsService
        .editFollowUp({
          ...data,
          followup: this.task._id,
          deal: this.deal,
          contact: undefined,
          _id: undefined
        })
        .subscribe((status) => {
          this.updating = false;
          if (status) {
            this.toastr.success('Task(s) successfully updated.');
            this.dialogRef.close({ status: true, data: data });
          }
        });
    } else {
      this.updating = true;
      this.updateSubscription && this.updateSubscription.unsubscribe();
      this.updateSubscription = this.taskService
        .update(this.task._id, data)
        .subscribe((res) => {
          this.updating = false;
          if (res) {
            this.dialogRef.close();
            this.toastr.success('Task(s) successfully updated.');
            this.handlerService.updateTasks$([this.task._id], data);
            this.handlerService.updateTaskInDetail$(res);
            // if (this.type === 'deal') {
            //   this.handlerService.updateLastActivities$(
            //     [this.task.contact._id],
            //     'task_update'
            //   );
            // } else {
            //   this.handlerService.updateLastActivities$(
            //     [this.task.contact._id],
            //     'task_update'
            //   );
            // }

            // this.handlerService.registerActivity$(res);
          }
        });
    }
  }
}
