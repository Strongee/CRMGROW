import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, pipe } from 'rxjs';
import { filter, map, share } from 'rxjs/operators';
import { Task } from '../models/task.model';
import { ErrorService } from './error.service';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService extends HttpService {
  tasks: BehaviorSubject<Task[]> = new BehaviorSubject([]);
  tasks$ = this.tasks.asObservable();

  constructor(errorService: ErrorService, private http: HttpClient) {
    super(errorService);
  }

  loadData(): void {
    this.loadDataImpl().subscribe((data) => {
      console.log(data);
      this.tasks.next(data);
      return;
    });
  }

  loadDataImpl(): Observable<Task[]> {
    return this.http
      .get<any>('https://run.mocky.io/v3/de65b771-9bb4-4ffe-9432-eceb977c3933')
      .pipe(
        filter((res) => res['status']),
        map((res) => res['data'])
      );
  }
}
