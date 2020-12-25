import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, pipe, Subscription } from 'rxjs';
import { catchError, filter, map, share } from 'rxjs/operators';
import { TASK } from '../constants/api.constant';
import { STATUS } from '../constants/variable.constants';
import {
  TaskDurationOption,
  TaskSearchOption
} from '../models/searchOption.model';
import { Task, TaskDetail } from '../models/task.model';
import { ErrorService } from './error.service';
import { HttpService } from './http.service';
import { StoreService } from './store.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService extends HttpService {
  constructor(
    errorService: ErrorService,
    private http: HttpClient,
    private storeService: StoreService
  ) {
    super(errorService);
  }

  loadStatus: BehaviorSubject<string> = new BehaviorSubject(STATUS.NONE);
  loading$ = this.loadStatus.asObservable();
  loadSubscription: Subscription;
  searchOption: BehaviorSubject<TaskSearchOption> = new BehaviorSubject(
    new TaskSearchOption()
  );
  durationOption: BehaviorSubject<TaskDurationOption> = new BehaviorSubject(
    new TaskDurationOption()
  );
  total: BehaviorSubject<number> = new BehaviorSubject(0);
  page: BehaviorSubject<number> = new BehaviorSubject(1);
  pageSize: BehaviorSubject<number> = new BehaviorSubject(20);
  searchOption$ = this.searchOption.asObservable();
  durationOption$ = this.durationOption.asObservable();
  total$ = this.total.asObservable();
  page$ = this.page.asObservable();
  pageSize$ = this.pageSize.asObservable();

  changeDuration(duration: TaskDurationOption): void {
    this.durationOption.next(duration);
    const searchOption = this.searchOption.getValue();
    searchOption.deserialize(duration);
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
    return this.http
      .post(this.server + TASK.LOAD, { skip, pageSize, searchOption })
      .pipe(
        map((res) => {
          return {
            tasks: (res['data']['tasks'] || []).map((e) =>
              new TaskDetail().deserialize(e)
            ),
            count: res['data']['count'] || 0
          };
        }),
        catchError(this.handleError('LOAD TASKS', null))
      );
  }

  loadToday(): void {
    this.loadTodayImpl().subscribe((tasks) => {
      this.storeService.tasks.next(tasks);
    });
  }

  loadTodayImpl(): Observable<TaskDetail[]> {
    return this.http.get(this.server + TASK.NEXT_WEEK).pipe(
      map((res) =>
        (res['data'] || []).map((e) => new TaskDetail().deserialize(e))
      ),
      catchError(this.handleError('LOAD TODAY TASKS', []))
    );
  }

  selectAll(): Observable<string[]> {
    const searchOption = this.searchOption.getValue();
    return this.http.post(this.server + TASK.SELECT, searchOption).pipe(
      map((res) => res['data'] || []),
      catchError(this.handleError('SELECT ALL TASKS', null))
    );
  }

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
      map((res) => res['data']),
      catchError(this.handleError('BULK TASK CREATE', null))
    );
  }
}
