import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit } from '@angular/core';
import { Task, TaskDetail } from 'src/app/models/task.model';
import { StoreService } from 'src/app/services/store.service';
import { TaskService } from 'src/app/services/task.service';
@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent implements OnInit {
  DISPLAY_COLUMNS = [
    'select',
    'contact_name',
    'contact_label',
    'subject',
    'contact_phone',
    'deadline',
    'action'
  ];
  TASK_ICONS = {
    task: 'i-task',
    call: 'i-phone',
    meeting: 'i-lunch',
    email: 'i-message',
    material: 'i-video'
  };

  selection = new SelectionModel<TaskDetail>(true, []);
  constructor(
    public taskService: TaskService,
    public storeService: StoreService
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.taskService.loadToday();
  }
  /**
   * Do Action
   * @param action: Action Data (ActionItem | ActionSubItem)
   */
  doAction(action: any): void {}
}
