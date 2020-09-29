import { Component, OnInit } from '@angular/core';
import { TabItem } from '../../utils/data.types';
@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent implements OnInit {
  tabs: TabItem[] = [
    { icon: 'icon-task', label: 'Tasks', id: 'tasks' },
    { icon: 'icon-activity', label: 'Activity', id: 'activities' }
  ];
  selectedTab: TabItem = this.tabs[0];

  constructor() {}

  ngOnInit(): void {}

  changeTab(event: TabItem): void {
    this.selectedTab = event;
  }
}
