import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { TaskEditComponent } from 'src/app/components/task-edit/task-edit.component';
import {
  BulkActions,
  DialogSettings,
  STATUS,
  TaskStatus
} from 'src/app/constants/variable.constants';
import { getCurrentTimezone } from 'src/app/helper';
import { TaskDurationOption } from 'src/app/models/searchOption.model';
import { Task, TaskDetail } from 'src/app/models/task.model';
import { ContactService } from 'src/app/services/contact.service';
import { HandlerService } from 'src/app/services/handler.service';
import { StoreService } from 'src/app/services/store.service';
import { TaskService } from 'src/app/services/task.service';
import { UserService } from 'src/app/services/user.service';
import * as moment from 'moment';
import * as _ from 'lodash';
import 'moment-timezone';
import { ConfirmComponent } from '../../components/confirm/confirm.component';
import { TaskDeleteComponent } from '../../components/task-delete/task-delete.component';
import { TaskBulkComponent } from '../../components/task-bulk/task-bulk.component';
import { ActivityService } from '../../services/activity.service';
import { NotifyComponent } from 'src/app/components/notify/notify.component';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent implements OnInit, OnDestroy {
  TASK_STATUS = TaskStatus;
  STATUS = STATUS;
  ACTIONS = BulkActions.Tasks;
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
  DEADLINE_TYPES = [
    { id: 'all', label: 'All tasks' },
    { id: 'overdue', label: 'Overdue' },
    { id: 'today', label: 'Today' },
    { id: 'tomorrow', label: 'Tomorrow' },
    { id: 'this week', label: 'This week' },
    { id: 'next week', label: 'Next week' }
  ];
  PAGE_COUNTS = [
    { id: 8, label: '8' },
    { id: 10, label: '10' },
    { id: 20, label: '20' },
    { id: 50, label: '50' }
  ];
  pageSize = this.PAGE_COUNTS[2];
  // Task Filter Type
  deadline = this.DEADLINE_TYPES[0];
  isUpdating = false;
  updateSubscription: Subscription;
  isLoading = false;
  loadSubscription: Subscription;

  selecting = false;
  selectSubscription: Subscription;
  selectSource = '';
  page = 1;
  selection = [];
  pageSelection = [];
  pageTasks = [];

  timezone;
  constructor(
    private handlerService: HandlerService,
    public taskService: TaskService,
    public activityService: ActivityService,
    public storeService: StoreService,
    private contactService: ContactService,
    private userService: UserService,
    private dialog: MatDialog,
    private toast: ToastrService
  ) {
    this.userService.profile$.subscribe((user) => {
      try {
        this.timezone = JSON.parse(user.time_zone_info);
      } catch (err) {
        const timezone = getCurrentTimezone();
        this.timezone = { zone: user.time_zone || timezone };
      }
    });

    this.storeService.tasks$.subscribe((tasks) => {
      if (tasks) {
        this.pageTasks = tasks;
        const ids = tasks.map((e) => e._id);
        this.pageSelection = _.intersection(this.selection, ids);
      }
    });
  }

  ngOnInit(): void {
    this.loadTasks();
  }

  ngOnDestroy(): void {
    this.taskService.resetOption();
  }

  loadTasks(): void {
    const page = this.taskService.page.getValue();
    const pageSize = this.taskService.pageSize.getValue();
    this.changePage(page || 1);
    this.PAGE_COUNTS.some((e) => {
      if (e.id === pageSize) {
        this.pageSize = e;
        return true;
      }
    });
  }

  /**
   * Change the Task Deadline
   * @param value : Deadline Type -> {label: '', id: ''}
   */
  changeDeadlineType(value: any): void {
    this.deadline = value;

    const durationOption = new TaskDurationOption();
    durationOption.name = value.id;
    let today;
    let weekDay;
    if (this.timezone.tz_name) {
      today = moment().tz(this.timezone.tz_name).startOf('day');
      weekDay = moment().tz(this.timezone.tz_name).startOf('week');
    } else {
      today = moment().utcOffset(this.timezone.zone).startOf('day');
      weekDay = moment().utcOffset(this.timezone.zone).startOf('week');
    }
    let start_date = '';
    let end_date = '';
    switch (value.id) {
      case 'all':
        break;
      case 'overdue':
        end_date = today.format();
        durationOption.status = 0;
        break;
      case 'today':
        start_date = today.format();
        end_date = today.add('day', 1).format();
        break;
      case 'tomorrow':
        start_date = today.add('day', 1).format();
        end_date = today.add('day', 2).format();
        break;
      case 'this week':
        start_date = weekDay.format();
        end_date = weekDay.add('week', 1).format();
        break;
      case 'next week':
        start_date = weekDay.add('week', 1).format();
        end_date = weekDay.add('week', 2).format();
        break;
      case 'future':
        start_date = weekDay.add('week', 2).format();
        break;
      default:
    }
    durationOption.start_date = start_date;
    durationOption.end_date = end_date;

    this.taskService.page.next(1);
    this.taskService.changeDuration(durationOption);

    this.selection = [];
    this.pageSelection = [];
  }

  changePage(page: number): void {
    this.page = page;
    this.taskService.loadPage(page);
    this.storeService.tasks$.subscribe((res) => {
      if (res) {
        this.pageTasks = res;
        this.pageSelection = _.intersectionBy(
          this.selection,
          this.pageTasks,
          '_id'
        );
      }
    });
  }

  onOverPages(page: number): void {
    this.changePage(page);
  }

  changePageSize(size: any): void {
    const newPage =
      Math.floor((this.pageSize.id * (this.page - 1)) / size.id) + 1;

    this.pageSize = size;
    this.taskService.pageSize.next(size.id);
    this.changePage(newPage);
  }
  /**
   * Open Filter Panel
   */
  openFilter(): void {}

  /**
   * Do Action
   * @param action: Action Data (ActionItem | ActionSubItem)
   */
  doAction(action: any): void {
    if (action.command === 'edit') {
      this.editTasks();
    } else if (action.command === 'complete') {
      this.completeTasks();
    } else if (action.command === 'delete') {
      this.deleteTasks();
    } else if (action.command === 'select') {
      this.selectAll(true);
    } else if (action.command === 'deselect') {
      this.deselectAll();
    }
  }

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

  openEdit(element: TaskDetail): void {
    this.dialog.open(TaskEditComponent, {
      ...DialogSettings.TASK,
      data: element
    });
  }

  toggle(task: TaskDetail): void {
    const toggledPageSelection = _.xorBy(
      this.pageSelection,
      [{ _id: task._id, status: task.status }],
      '_id'
    );
    this.pageSelection = toggledPageSelection;

    const toggledSelection = _.xorBy(
      this.selection,
      [{ _id: task._id, status: task.status }],
      '_id'
    );
    this.selection = toggledSelection;
    // const pagePosition = this.pageSelection.indexOf(task_id);
    // const pos = this.selection.indexOf(task_id);
    // if (pos !== -1) {
    //   this.selection.splice(pos, 1);
    // } else {
    //   this.selection.push(task_id);
    // }
    // if (pagePosition !== -1) {
    //   this.pageSelection.splice(pagePosition, 1);
    // } else {
    //   this.pageSelection.push(task_id);
    // }
  }

  isSelected(task_id: string): boolean {
    return _.findIndex(this.pageSelection, { _id: task_id }, '_id') !== -1;
  }

  masterToggle(): void {
    if (this.isAllSelected()) {
      this.selection = _.differenceBy(
        this.selection,
        this.pageSelection,
        '_id'
      );
      this.pageSelection = [];
      return;
    }
    this.pageTasks.forEach((e) => {
      if (!this.isSelected(e._id)) {
        this.pageSelection.push({ _id: e._id, status: e.status });
        this.selection.push({ _id: e._id, status: e.status });
      }
    });
  }

  isAllSelected(): boolean {
    return this.pageSelection.length === this.pageTasks.length;
  }

  /**
   * Select All Tasks
   */
  selectAll(source = false): void {
    if (source) {
      // Update the Actions Header
      for (let i = this.ACTIONS.length - 1; i >= 0; i--) {
        if (this.ACTIONS[i].command === 'select') {
          this.ACTIONS[i]['loading'] = true;
        }
      }
      this.selectSource = 'header';
    } else {
      this.selectSource = 'page';
    }
    this.selecting = true;
    this.selectSubscription && this.selectSubscription.unsubscribe();
    this.selectSubscription = this.taskService
      .selectAll()
      .subscribe((tasks) => {
        this.selecting = false;
        this.selection = tasks;
        this.pageSelection = this.pageTasks.map((e) => ({
          _id: e._id,
          status: e.status
        }));
        for (let i = this.ACTIONS.length - 1; i >= 0; i--) {
          if (this.ACTIONS[i].command === 'select') {
            this.ACTIONS[i]['loading'] = false;
          }
        }
      });
  }

  deselectAll(): void {
    this.pageSelection = [];
    this.selection = [];
  }

  changeSort(): void {
    const sortDir = this.taskService.sortOption.getValue();
    this.taskService.sortOption.next(sortDir * -1);
  }

  taskComplete(task: TaskDetail): void {
    if (task.status == 1) {
      this.dialog.open(NotifyComponent, {
        width: '98vw',
        maxWidth: '390px',
        data: {
          title: 'Complete Task',
          message: 'This task is completed already.'
        }
      });
      return;
    } else {
      const dialog = this.dialog.open(ConfirmComponent, {
        width: '98vw',
        maxWidth: '390px',
        data: {
          title: 'Complete task',
          message: 'Are you sure to complete this task?',
          confirmLabel: 'Complete'
        }
      });
      dialog.afterClosed().subscribe((answer) => {
        if (answer) {
          this.taskService.complete(task._id).subscribe((res) => {
            if (res && res['status']) {
              this.handlerService.updateTasks$([task._id], {
                status: 1
              });
            }
          });
        }
      });
    }
  }

  deleteTasks(): void {
    if (this.selection.length) {
      const selected = this.selection.map((e) => e._id);
      const dialog = this.dialog.open(TaskDeleteComponent, {
        data: {
          ids: selected
        }
      });

      dialog.afterClosed().subscribe((res) => {
        if (res && res.status) {
          this.selection = [];
          this.pageSelection = [];
          this.taskService.reload();
        }
      });
    }
  }

  completeTasks(): void {
    const selected = [];
    this.selection.forEach((e) => {
      if (e.status !== 1) {
        selected.push(e._id);
      }
    });
    if (selected.length) {
      const dialog = this.dialog.open(ConfirmComponent, {
        data: {
          title: 'Complete tasks',
          message: 'Are you sure to complete selected task(s)?',
          confirmLabel: 'Complete'
        }
      });
      dialog.afterClosed().subscribe((answer) => {
        if (answer) {
          this.taskService.bulkComplete(selected).subscribe((res) => {
            this.handlerService.updateTasks$(selected, { status: 1 });
            this.toast.success(
              '',
              'Selected tasks are completed successfully.',
              { closeButton: true }
            );
          });
        }
      });
    } else {
      // TODO: Show the Alert
      this.dialog.open(NotifyComponent, {
        ...DialogSettings.ALERT,
        data: {
          message: 'Selected Tasks are completed already!',
          label: 'OK'
        }
      });
    }
  }

  editTasks(): void {
    const selected = [];
    this.selection.forEach((e) => {
      if (e.status !== 1) {
        selected.push(e._id);
      }
    });
    if (selected.length) {
      this.dialog.open(TaskBulkComponent, {
        width: '100vw',
        maxWidth: '450px',
        data: {
          ids: selected
        }
      });
    } else {
      // TODO: Show the Alert
    }
  }
}
