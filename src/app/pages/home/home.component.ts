import { Component, OnInit } from '@angular/core';
import { TabItem } from 'src/app/utils/data.types';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  tabs: TabItem[] = [
    { icon: 'i-icon i-task', label: 'Tasks', id: 'tasks' },
    { icon: 'i-icon i-notification', label: 'Activity', id: 'activities' }
  ];
  selectedTab: TabItem = this.tabs[0];

  constructor() {}

  ngOnInit(): void {}
}
