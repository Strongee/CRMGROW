import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActionItem, TabItem } from 'src/app/utils/data.types';

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

  constructor(private location: Location) {}

  ngOnInit(): void {}

  changeTab(tab: TabItem): void {
    this.selectedTab = tab;
    this.location.replaceState(tab.id);
  }

  actions: ActionItem[] = [
    {
      label: 'Bulk status set',
      type: 'dropdown',
      items: [
        {
          class: 'text-green',
          label: 'Editor'
        },
        {
          class: 'text-blue',
          label: 'Viewer'
        }
      ]
    },
    {
      label: 'Remove member',
      type: 'button',
      icon: 'i-trash'
    },
    {
      label: 'Lead Capture',
      type: 'toggle'
    }
  ];
}
