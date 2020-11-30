import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ACTIVITY } from '../constants/api.constant';
import { Activity } from '../models/activity.model';
import { ActivityDetail } from '../models/activityDetail.model';
import { ErrorService } from './error.service';
import { HttpService } from './http.service';
import { StoreService } from './store.service';

@Injectable({
  providedIn: 'root'
})
export class ActivityService extends HttpService {
  constructor(
    errorService: ErrorService,
    private http: HttpClient,
    private storeService: StoreService
  ) {
    super(errorService);
  }

  load(page: number): void {
    this.loadImpl(page).subscribe((activities) => {
      this.storeService.activities.next(activities);
    });
  }

  loadImpl(page: number): Observable<Activity[]> {
    const skip = (page - 1) * 20;
    return this.http.get(this.server + ACTIVITY.LOAD + skip).pipe(
      map((res) =>
        (res['data']['activity'] || []).map((e) =>
          new Activity().deserialize(e)
        )
      ),
      catchError(this.handleError('LOAD ACTIVITY', []))
    );
  }
}
