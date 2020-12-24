import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit } from '@angular/core';
import { TaskStatus, TIMES } from 'src/app/constants/variable.constants';
import { Contact } from 'src/app/models/contact.model';
import { TaskSearchOption } from 'src/app/models/searchOption.model';
import { LabelService } from 'src/app/services/label.service';
import { TabOption } from 'src/app/utils/data.types';

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

  search = '';
  types = [];
  status = this.STATUS_OPTIONS[1];
  selectedLabels = new SelectionModel<string>(true, []);
  contact;
  startDate;
  startTime;
  endDate;
  endTime;
  loading = false;

  constructor(public labelService: LabelService) {}

  ngOnInit(): void {}

  toggleTypes(type: string): void {
    const pos = this.types.indexOf(type);
    if (pos !== -1) {
      this.types.splice(pos, 1);
    } else {
      this.types.push(type);
    }
  }

  selectContact(event: Contact): void {
    this.contact = event._id;
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
  }
}
