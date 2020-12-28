import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { TaskEditComponent } from 'src/app/components/task-edit/task-edit.component';
import {
  BulkActions,
  DialogSettings,
  STATUS
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
import { ContactActivity } from '../../models/contact.model';
@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent implements OnInit, OnDestroy {
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

  page = 1;
  selection = [];
  pageSelection = [];
  pageTasks = [];

  timezone;
  constructor(
    private handlerService: HandlerService,
    public taskService: TaskService,
    public storeService: StoreService,
    private contactService: ContactService,
    private userService: UserService,
    private dialog: MatDialog
  ) {
    this.userService.profile$.subscribe((user) => {
      try {
        this.timezone = JSON.parse(user.time_zone_info);
      } catch (err) {
        const timezone = getCurrentTimezone();
        this.timezone = { zone: user.time_zone || timezone };
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
        console.log('page selection =============>', this.pageSelection);
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

  toggle(task): void {
    const selectedTask = task;
    const toggledSelection = _.xorBy(this.pageSelection, [selectedTask], '_id');
    this.pageSelection = toggledSelection;

    const toggledAllSelection = _.xorBy(this.selection, [selectedTask], '_id');
    this.selection = toggledAllSelection;
  }

  isSelected(task): boolean {
    return _.findIndex(this.pageSelection, task, '_id') !== -1;
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
      if (!this.isSelected(e)) {
        this.pageSelection.push(e);
        this.selection.push(e);
      }
    });
  }

  isAllSelected(): boolean {
    return this.pageSelection.length === this.pageTasks.length;
  }

  /**
   * Select All Tasks
   */
  selectAll(): void {
    this.storeService.tasks$.subscribe((res) =>
      console.log('select all ===========>', res)
    );
    // this.contactService.selectAll().subscribe((contacts) => {
    //   this.selection = _.unionBy(this.selection, contacts, '_id');
    //   this.pageSelection = _.intersectionBy(
    //     this.selection,
    //     this.pageContacts,
    //     '_id'
    //   );
    //   this.updateActionsStatus('select', false);
    // });
  }

  deselectAll(): void {
    this.pageSelection = [];
    this.selection = [];
  }
}
