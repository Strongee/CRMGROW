import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit } from '@angular/core';
import { TaskStatus, TIMES } from 'src/app/constants/variable.constants';
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
  startDate;
  startTime;
  loading = false;
  selectedContact;

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

  /**
   * Apply Filter to the Task List
   */
  applyFilters(): void {}

  selectContact($event): void {
    this.selectedContact = $event;
    console.log("selected contact =============>", this.selectedContact);
  }

  clearFilters(): void {
    console.log("clear filter ===========>");
    this.selectedContact = null;
  }
}
