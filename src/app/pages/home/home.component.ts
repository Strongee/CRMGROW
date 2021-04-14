import { Location } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TaskCreateComponent } from 'src/app/components/task-create/task-create.component';
import {
  DialogSettings,
  STATISTICS_DURATION
} from 'src/app/constants/variable.constants';
import { HandlerService } from 'src/app/services/handler.service';
import { TabItem } from 'src/app/utils/data.types';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  STATISTICS_DURATION = STATISTICS_DURATION;
  tabs: TabItem[] = [
    { label: 'Tasks', id: 'tasks', icon: '' },
    { label: 'Activity', id: 'activities', icon: '' }
  ];
  selectedTab: TabItem = this.tabs[0];
  // Statistics
  duration = STATISTICS_DURATION[0];

  constructor(
    private location: Location,
    private handlerService: HandlerService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.handlerService.pageName.next('dashboard');
    // Load the Last Tab Variable from Storage
    const page = localStorage.getItem('homeTab');
    if (page === 'activities') {
      this.selectedTab = this.tabs[1];
    }
  }

  ngOnDestroy(): void {
    this.handlerService.pageName.next('');
  }

  /**
   * Change the Tab -> This will change the view
   * @param tab : TabItem for the Task and Activity
   */
  changeTab(tab: TabItem): void {
    this.selectedTab = tab;
    this.location.replaceState(tab.id);
    // Set the storage for the active tab
    localStorage.setItem('homeTab', tab.id);
  }
  /**
   * Change Duration
   * @param value : Duration Value -> monthly | weekly | yearly
   */
  changeDuration(value: string): void {
    this.duration = value;
  }

  /**
   * Open the create task dialog
   */
  createTask(): void {
    this.dialog.open(TaskCreateComponent, DialogSettings.TASK);
  }
}
