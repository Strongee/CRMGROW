import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { TaskEditComponent } from 'src/app/components/task-edit/task-edit.component';
import { DialogSettings, STATUS } from 'src/app/constants/variable.constants';
import { Task, TaskDetail } from 'src/app/models/task.model';
import { ContactService } from 'src/app/services/contact.service';
import { HandlerService } from 'src/app/services/handler.service';
import { StoreService } from 'src/app/services/store.service';
import { TaskService } from 'src/app/services/task.service';
@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent implements OnInit, OnDestroy {
  STATUS = STATUS;
  DISPLAY_COLUMNS = [
    'select',
    'status',
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
  isUpdating = false;
  updateSubscription: Subscription;

  selection = [];
  constructor(
    private handlerService: HandlerService,
    public taskService: TaskService,
    public storeService: StoreService,
    private contactService: ContactService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  ngOnDestroy(): void {
  }

  loadTasks(): void {
    this.taskService.loadToday();
  }

  isAllSelected(): boolean {
    return false;
  }

  /**
   * Do Action
   * @param action: Action Data (ActionItem | ActionSubItem)
   */
  doAction(action: any): void {}

  /**
   * Update the Label of the current contact or selected contacts.
   * @param label : Label to update
   * @param _id : id of contact to update
   */
  updateLabel(label: string, _id: string): void {
    const newLabel = label ? label : '';
    let ids = [];
    this.selection.forEach((e) => {
      ids.push(e.contact._id);
    });
    if (ids.indexOf(_id) === -1) {
      ids = [_id];
    }
    this.isUpdating = true;
    this.updateSubscription && this.updateSubscription.unsubscribe();
    this.updateSubscription = this.contactService
      .bulkUpdate(ids, { label: newLabel }, {})
      .subscribe((status) => {
        this.isUpdating = false;
        if (status) {
          this.handlerService.bulkContactUpdate$(ids, { label: newLabel }, {});
        }
      });
  }

  openEdit(element: Task): void {
    this.dialog
      .open(TaskEditComponent, {
        ...DialogSettings.TASK,
        data: element
      })
      .afterClosed()
      .subscribe((res) => {});
  }
}
