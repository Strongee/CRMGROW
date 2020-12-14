import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, pipe } from 'rxjs';
import { catchError, filter, map, share } from 'rxjs/operators';
import { TASK } from '../constants/api.constant';
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

  loadToday(): void {
    this.loadTodayImpl().subscribe((tasks) => {
      this.storeService.tasks.next(tasks);
    });
  }

  loadTodayImpl(): Observable<TaskDetail[]> {
    return this.http.get(this.server + TASK.OVERDUE).pipe(
      map((res) =>
        (res['data'] || []).map((e) => new TaskDetail().deserialize(e))
      ),
      catchError(this.handleError('LOAD TODAY TASKS', []))
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
