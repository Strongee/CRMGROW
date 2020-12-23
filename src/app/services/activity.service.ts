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
  pageSize: BehaviorSubject<number> = new BehaviorSubject(20);
  pageSize$ = this.pageSize.asObservable();

  constructor(
    errorService: ErrorService,
    private http: HttpClient,
    private storeService: StoreService
  ) {
    super(errorService);
  }

  load(page: number): void {
    this.page.next(page);
    this.loadStatus.next(STATUS.REQUEST);
    this.loadSubscription && this.loadSubscription.unsubscribe();
    this.loadSubscription = this.loadImpl(page).subscribe((res) => {
      res
        ? this.loadStatus.next(STATUS.SUCCESS)
        : this.loadStatus.next(STATUS.FAILURE);
      if (res && res['activities']) {
        this.storeService.activities.next(res['activities']);
        this.total.next(res['count']);
      }
    });
  }

  loadImpl(page: number): Observable<any> {
    const pageSize = this.pageSize.getValue();
    const skip = (page - 1) * pageSize;
    // return this.http
    //   .post(this.server + ACTIVITY.LOAD, { skip, size: pageSize })
    //   .pipe(
    //     map((res) => {
    //       return {
    //         activities: (res['data']['activity'] || []).map((e) =>
    //           new Activity().deserialize(e)
    //         ),
    //         count: res['data']['count'] || 0
    //       };
    //     }),
    //     catchError(this.handleError('LOAD ACTIVITY', null))
    //   );
    return this.http.get(this.server + ACTIVITY.LOAD + page).pipe(
      map((res) => {
        return {
          activities: (res['data']['activity'] || []).map((e) =>
            new Activity().deserialize(e)
          ),
          count: res['data']['count'] || 0
        };
      }),
      catchError(this.handleError('LOAD ACTIVITY', null))
    );
  }

  reload(): void {
    const page = this.page.getValue();
    this.loadStatus.next(STATUS.REQUEST);
    this.loadSubscription && this.loadSubscription.unsubscribe();
    this.loadSubscription = this.loadImpl(page).subscribe((res) => {
      res
        ? this.loadStatus.next(STATUS.SUCCESS)
        : this.loadStatus.next(STATUS.FAILURE);
      if (res && res['activities']) {
        this.storeService.activities.next(res['activities']);
        this.total.next(res['count']);
      }
    });
  }
}
