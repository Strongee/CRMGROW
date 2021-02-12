import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, pipe, Subscription } from 'rxjs';
import { catchError, filter, map, share } from 'rxjs/operators';
import { GUEST, TASK } from '../constants/api.constant';
import { STATUS } from '../constants/variable.constants';
import {
  TaskDurationOption,
  TaskSearchOption
} from '../models/searchOption.model';
import { Task, TaskDetail } from '../models/task.model';
import { ErrorService } from './error.service';
import { HttpService } from './http.service';
import { StoreService } from './store.service';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class TaskService extends HttpService {
  loadStatus: BehaviorSubject<string> = new BehaviorSubject(STATUS.NONE);
  loading$ = this.loadStatus.asObservable();
  loadSubscription: Subscription;
  searchOption: BehaviorSubject<TaskSearchOption> = new BehaviorSubject(
    new TaskSearchOption()
  );
  durationOption: BehaviorSubject<TaskDurationOption> = new BehaviorSubject(
    new TaskDurationOption()
  );
  sortOption: BehaviorSubject<number> = new BehaviorSubject(-1);
  total: BehaviorSubject<number> = new BehaviorSubject(0);
  page: BehaviorSubject<number> = new BehaviorSubject(1);
  pageSize: BehaviorSubject<number> = new BehaviorSubject(20);
  searchOption$ = this.searchOption.asObservable();
  durationOption$ = this.durationOption.asObservable();
  total$ = this.total.asObservable();
  page$ = this.page.asObservable();
  pageSize$ = this.pageSize.asObservable();
  sortOption$ = this.sortOption.asObservable();

  constructor(
    errorService: ErrorService,
    private http: HttpClient,
    private storeService: StoreService
  ) {
    super(errorService);

    this.sortOption$.subscribe(() => {
      this.reload();
    });
  }

  changeDuration(duration: TaskDurationOption): void {
    this.durationOption.next(duration);
    const searchOption = this.searchOption.getValue();
    searchOption.deserialize(duration);
    if (duration.status === undefined) {
      delete searchOption.status;
    }
    this.searchOption.next(searchOption);
    this.load(1);
  }

  changeSearchOption(searchOption: TaskSearchOption): void {
    // Change the Duration Option
    this.searchOption.next(searchOption);
    this.load(1);
  }

  clearSearchOption(): void {
    const duration = this.durationOption.getValue();
    const searchOption = new TaskSearchOption();
    searchOption.deserialize(duration);
    this.searchOption.next(searchOption);
    this.load(1);
  }

  resetOption(): void {
    const duration = this.durationOption.getValue();
    const searchOption = new TaskSearchOption();
    searchOption.deserialize(duration);
    this.searchOption.next(searchOption);
  }

  loadPage(page: number): void {
    this.page.next(page);
    this.load(page);
  }
  reload(): void {
    const page = this.page.getValue();
    this.load(page);
  }
  load(page: number): void {
    this.loadStatus.next(STATUS.REQUEST);
    this.loadSubscription && this.loadSubscription.unsubscribe();
    this.loadSubscription = this.loadImpl(page).subscribe((res) => {
      res
        ? this.loadStatus.next(STATUS.SUCCESS)
        : this.loadStatus.next(STATUS.FAILURE);
      if (res && res['tasks']) {
        this.storeService.tasks.next(res['tasks']);
        this.total.next(res['count']);
      }
    });
  }
  loadImpl(page: number): Observable<any> {
    const pageSize = this.pageSize.getValue();
    const skip = (page - 1) * pageSize;
    const searchOption = this.searchOption.getValue();
    const sortDir = this.sortOption.getValue();
    const option = { ...searchOption, sortDir };
    return this.http
      .post(this.server + TASK.LOAD, { skip, pageSize, searchOption: option })
      .pipe(
        map((res) => {
          return {
            tasks: (res['data']['tasks'] || []).map((e) =>
              new TaskDetail().deserialize(e)
            ),
            count: res['data']['count'] || 0
          };
        }),
        catchError(this.handleError('LOAD TASKS', { tasks: [], count: 0 }))
      );
  }

  /**
   * Select All tasks for the current search option
   */
  selectAll(): Observable<string[]> {
    const searchOption = this.searchOption.getValue();
    return this.http.post(this.server + TASK.SELECT, searchOption).pipe(
      map((res) => res['data'] || []),
      catchError(this.handleError('SELECT ALL TASKS', null))
    );
  }

  /**
   * Create One Task
   * @param data : Task Data
   */
  create(data: any): Observable<any> {
    return this.http.post(this.server + TASK.CREATE, data).pipe(
      map((res) => res['data']),
      catchError(this.handleError('TASK CREATE', null))
    );
  }

  /**
   * Create Tasks to Bulk Contacts
   * @param data : {type: string, content: string, due_date: date, contacts: contact ids array}
   */
  bulkCreate(data: any): Observable<any> {
    return this.http.post(this.server + TASK.BULK_CREATE, data).pipe(
      map((res) => res['status']),
      catchError(this.handleError('BULK TASK CREATE', null))
    );
  }

  /**
   * Update the specified task
   * @param id : Id of task to update
   * @param data: data of task to update
   */
  update(id: string, data: any): Observable<any> {
    return this.http.put(this.server + TASK.UPDATE + id, data).pipe(
      map((res) => res['data']),
      catchError(this.handleError('UPDATE TASK', false))
    );
  }

  /**
   * update the bulk tasks
   * @param data : data of task to update -> contains the id array
   */
  bulkUpdate(data: any): Observable<boolean> {
    return this.http.post(this.server + TASK.BULK_UPDATE, data).pipe(
      map((res) => res['status']),
      catchError(this.handleError('BULK TASK UPDATE', false))
    );
  }

  /**
   * Remove tasks
   * @param ids : id array of tasks to remove
   */
  archive(ids: string[]): Observable<any> {
    return this.http
      .post(this.server + TASK.BULK_ARCHIVE, { follow_ups: ids })
      .pipe(
        map((res) => res['status']),
        catchError(this.handleError('BULK TASK ARCHIVE', false))
      );
  }

  /**
   * complete one task
   * @param id : id of task to complete
   */
  complete(id: string): Observable<any> {
    return this.http.post(this.server + TASK.COMPLETE, { follow_up: id }).pipe(
      map((res) => res['data']),
      catchError(this.handleError('TASK COMPLETE', null))
    );
  }

  /**
   * complete bulk tasks
   * @param ids : id array of tasks to complete
   */
  bulkComplete(ids: string[]): Observable<any> {
    return this.http
      .post(this.server + TASK.BULK_COMPLETE, { follow_ups: ids })
      .pipe(
        map((res) => res),
        catchError(this.handleError('BULK TASK COMPLETE', null))
      );
  }

  removeTask$(ids: string[], pageSize: number): void {
    const tasks = this.storeService.tasks.getValue();
    const taskObjects = [];
    ids.forEach((id) => {
      taskObjects.push({ _id: id });
    });
    _.pullAllBy(tasks, taskObjects, '_id');
    this.storeService.tasks.next([...tasks]);

    const currentTotal = this.total.getValue();
    if (currentTotal <= pageSize) {
      return;
    }
    if (tasks.length < (pageSize * 2) / 3) {
      this.reload();
    }
  }

  clear$(): void {
    this.loadStatus.next(STATUS.NONE);
    this.searchOption.next(new TaskSearchOption());
    this.durationOption.next(new TaskDurationOption());
    this.total.next(0);
    this.page.next(1);
    this.pageSize.next(20);
  }
}
