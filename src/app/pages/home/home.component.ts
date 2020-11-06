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
          label: 'Editor',
          command: 'editor'
        },
        {
          class: 'text-blue',
          label: 'Viewer',
          command: 'editor'
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
    },
    {
      icon: 'i-message',
      label: 'Lead Capture',
      type: 'button'
    },
    {
      icon: 'i-message',
      label: 'Add tasks',
      type: 'button'
    },
    {
      icon: 'i-message',
      label: 'Send messages',
      type: 'button'
    },
    {
      icon: 'i-message',
      label: 'Add Automation',
      type: 'button'
    },
    {
      spliter: true,
      label: 'Select All',
      type: 'button'
    },
    {
      label: 'Deselect',
      type: 'button'
    }
  ];
  selected = 1;
  increase(): void {
    this.selected++;
  }
  decrease(): void {
    this.selected--;
  }
  reset(): void {
    this.selected = 0;
  }
  /**
   * Do Action
   * @param action: Action Data (ActionItem | ActionSubItem)
   */
  doAction(action: any): void {
    console.log('action', action);
  }
}
