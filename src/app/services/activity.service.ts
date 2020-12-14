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
  constructor(
    errorService: ErrorService,
    private http: HttpClient,
    private storeService: StoreService
  ) {
    super(errorService);
  }

  load(page: number): void {
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
    const skip = (page - 1) * 20;
    return this.http.get(this.server + ACTIVITY.LOAD + skip).pipe(
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
}
