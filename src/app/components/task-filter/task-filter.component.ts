import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit } from '@angular/core';
import { TaskStatus, TIMES } from 'src/app/constants/variable.constants';
import {
  convertTimetoObj,
  convertTimetoTz,
  getCurrentTimezone
} from 'src/app/helper';
import { Contact } from 'src/app/models/contact.model';
import { TaskSearchOption } from 'src/app/models/searchOption.model';
import { LabelService } from 'src/app/services/label.service';
import { UserService } from 'src/app/services/user.service';
import { TabOption } from 'src/app/utils/data.types';
import * as moment from 'moment';
import 'moment-timezone';
import { TaskService } from 'src/app/services/task.service';

@Component({
  selector: 'app-task-filter',
  templateUrl: './task-filter.component.html',
  styleUrls: ['./task-filter.component.scss']
})
export class TaskFilterComponent implements OnInit {
  STATUS_OPTIONS: TabOption[] = [
    { label: 'TODO', value: TaskStatus.TODO },
    { label: 'ALL', value: TaskStatus.ALL },
    { label: 'COMPLETED', value: TaskStatus.COMPLETED }
  ];
  TIMES = TIMES;
  timezone;

  search = '';
  types = [];
  status = this.STATUS_OPTIONS[1];
  selectedLabels = new SelectionModel<string>(true, []);
  contact: string;
  startDate;
  startTime = '00:00:00.000';
  endDate;
  endTime = '23:30:00.000';
  loading = false;

  constructor(
    public labelService: LabelService,
    private userService: UserService,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    this.userService.profile$.subscribe((user) => {
      try {
        this.timezone = JSON.parse(user.time_zone_info);
      } catch (err) {
        const timezone = getCurrentTimezone();
        this.timezone = { zone: user.time_zone || timezone };
      }
    });

    this.taskService.durationOption$.subscribe((option) => {
      switch (option.status) {
        case 0:
          this.status = this.STATUS_OPTIONS[0];
          break;
        case 1:
          this.status = this.STATUS_OPTIONS[2];
          break;
        default:
          this.status = this.STATUS_OPTIONS[1];
      }

      if (option.start_date) {
        const timeObj = convertTimetoObj(option.start_date, this.timezone);
        console.log(timeObj);
        this.startDate = { ...timeObj, time: undefined };
        this.startTime = timeObj.time;
      }
      if (option.end_date) {
        const timeObj = convertTimetoObj(option.end_date, this.timezone);
        console.log(timeObj);
        this.endDate = { ...timeObj, time: undefined };
        this.endTime = timeObj.time;
      }
    });
  }

  toggleTypes(type: string): void {
    const pos = this.types.indexOf(type);
    if (pos !== -1) {
      this.types.splice(pos, 1);
    } else {
      this.types.push(type);
    }
  }

  selectContact(event: Contact): void {
    if (event && event._id) {
      this.contact = event._id;
    } else {
      this.contact = null;
    }
  }

  /**
   * Apply Filter to the Task List
   */
  applyFilters(): void {
    const searchOption = new TaskSearchOption();
    searchOption.str = this.search;
    let status;
    if (this.status.value === TaskStatus.TODO) {
      status = 0;
    } else if (this.status.value == TaskStatus.COMPLETED) {
      status = 1;
    }
    searchOption.status = status;
    searchOption.contact = this.contact;
    searchOption.types = this.types;
    searchOption.labels = this.selectedLabels.selected;

    // Timezone
    if (this.startDate) {
      const start_date = convertTimetoTz(
        this.startDate,
        this.startTime,
        this.timezone
      );
      searchOption.start_date = start_date;
    }
    if (this.endDate) {
      const end_date = convertTimetoTz(
        this.endDate,
        this.endTime,
        this.timezone
      );
      searchOption.end_date = end_date;
    }
    this.taskService.changeSearchOption(searchOption);
  }

  clearFilter(): void {
    this.types = [];
    this.search = '';
    this.status = this.STATUS_OPTIONS[1];
    this.selectedLabels.clear();
    this.contact = null;
    this.taskService.clearSearchOption();
  }
}
