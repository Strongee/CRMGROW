import { Component, OnInit } from '@angular/core';
import { TabItem, TabOption } from '../../utils/data.types';
@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent implements OnInit {
  tabs: TabItem[] = [
    { icon: 'i-icon i-task', label: 'Tasks', id: 'tasks' },
    { icon: 'i-icon i-notification', label: 'Activity', id: 'activities' }
  ];
  selectedTab: TabItem = this.tabs[0];

  options: TabOption[] = [
    { label: 'Set Date', value: 'date' },
    { label: 'Set Duration', value: 'duration' }
  ];
  selectedOption = this.options[0].value;

  constructor() {}

  ngOnInit(): void {}

  changeTab(event: TabItem): void {
    this.selectedTab = event;
  }
  changeOption(event: string): void {
    console.log('select option', event);
  }
}
