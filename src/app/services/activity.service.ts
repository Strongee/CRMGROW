import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ACTIVITY } from '../constants/api.constant';
import { STATUS } from '../constants/variable.constants';
import { Activity } from '../models/activity.model';
import { ActivityDetail } from '../models/activityDetail.model';
import { ErrorService } from './error.service';
import { HttpService } from './http.service';
import { StoreService } from './store.service';

@Injectable({
  providedIn: 'root'
})
export class ActivityService extends HttpService {
  loadStatus: BehaviorSubject<string> = new BehaviorSubject(STATUS.NONE);
  loading$ = this.loadStatus.asObservable();
  total: BehaviorSubject<number> = new BehaviorSubject(0);
  total$ = this.total.asObservable();
  loadSubscription: Subscription;
  page: BehaviorSubject<number> = new BehaviorSubject(1);
  page$ = this.page.asObservable();
  command: BehaviorSubject<any> = new BehaviorSubject(null);
  pageSize: BehaviorSubject<number> = new BehaviorSubject(20);
  pageSize$ = this.pageSize.asObservable();
  latest: BehaviorSubject<string> = new BehaviorSubject('');
  latest$ = this.latest.asObservable();

  constructor(
    errorService: ErrorService,
    private http: HttpClient,
    private storeService: StoreService
  ) {
    super(errorService);
  }

  load(command: any): void {
    this.loadStatus.next(STATUS.REQUEST);
    this.loadSubscription && this.loadSubscription.unsubscribe();
    this.loadSubscription = this.loadImpl(command).subscribe((res) => {
      res
        ? this.loadStatus.next(STATUS.SUCCESS)
        : this.loadStatus.next(STATUS.FAILURE);
      if (res && res['activities']) {
        this.storeService.activities.next(
          command['ending_before']
            ? res['activities'].reverse()
            : res['activities']
        );
        this.latest.next(res['latest'] ? res['latest']['_id'] : '');
        this.command.next(command);
      }
    });
  }

  // load(page: number): void {
  //   this.page.next(page);
  //   this.loadStatus.next(STATUS.REQUEST);
  //   this.loadSubscription && this.loadSubscription.unsubscribe();
  //   this.loadSubscription = this.loadImpl(page).subscribe((res) => {
  //     res
  //       ? this.loadStatus.next(STATUS.SUCCESS)
  //       : this.loadStatus.next(STATUS.FAILURE);
  //     if (res && res['activities']) {
  //       this.storeService.activities.next(res['activities']);
  //       this.skip.next(res['skip']);
  //     }
  //   });
  // }

  loadImpl(command: any): Observable<any> {
    const pageSize = this.pageSize.getValue();
    return this.http
      .post(this.server + ACTIVITY.LOAD, { ...command, size: pageSize })
      .pipe(
        map((res) => {
          return {
            activities: (res['data']['activity_list'] || [])
              .slice(0, pageSize)
              .map((e) => new Activity().deserialize(e)),
            latest: res['data']['latest']
          };
        }),
        catchError(this.handleError('LOAD ACTIVITY', null))
      );
  }

  reload(): void {
    const command = this.command.getValue();
    this.load(command);
  }

  clear$(): void {
    this.loadStatus.next(STATUS.NONE);
    this.total.next(0);
    this.page.next(1);
    this.pageSize.next(20);
  }
}
