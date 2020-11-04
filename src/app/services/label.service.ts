import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Team } from '../models/team.model';
import { ErrorService } from './error.service';
import { HttpService } from './http.service';
import { StoreService } from './store.service';
import { Label } from '../models/label.model';
import { LABEL } from '../constants/api.constant';

@Injectable({
  providedIn: 'root'
})
export class LabelService extends HttpService {
  constructor(
    errorService: ErrorService,
    private httpClient: HttpClient,
    private storeService: StoreService
  ) {
    super(errorService);
  }

  getLabels(): Observable<Label[]> {
    return this.httpClient.get(this.server + LABEL.GET).pipe(
      map((res) => res['data'] || []),
      catchError(this.handleError('GET LABELS', []))
    );
  }
}
