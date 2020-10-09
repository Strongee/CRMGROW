import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, pipe } from 'rxjs';
import { map, share } from 'rxjs/operators';
import { Task } from '../models/task.model';
import { ErrorService } from './error.service';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService extends HttpService {
  tasks: BehaviorSubject<Task[]> = new BehaviorSubject([]);
  tasks$ = this.tasks.asObservable();
  id = 1;
  taskload$ = this.loadTaskImpl();
  taskContent$ = this.taskload$.pipe(map((task) => task.avatar));
  taskEmail$ = this.taskload$.pipe(map((task) => task.email));
  taskAvatar$ = this.taskload$.pipe(map((task) => task.avatar));

 

  constructor(errorService: ErrorService, private http: HttpClient) {
    super(errorService);
  }

  loadData(): void {
    this.loadDataImpl().subscribe((data) => {
      this.tasks.next(data);
      return;
    });
  }

  loadDataImpl(): Observable<Task[]> {
    return this.http
      .get<any>('https://run.mocky.io/v3/de65b771-9bb4-4ffe-9432-eceb977c3933')
      .pipe(map((res) => res['data']));
  }

  loadTaskImpl(): Observable<any> {
    return this.http
      .get<any>(
        'https://5f80ae7f5b1f3f00161a6367.mockapi.io/api/v1/users/' + this.id
      )
      .pipe(share());
  }

  addTask(): Observable<any> {
    return this.http
      .get<any>('https://run.mocky.io/v3/de65b771-9bb4-4ffe-9432-eceb977c3933')
      .pipe(share());
  }
}
