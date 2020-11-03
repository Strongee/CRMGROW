import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AUTOMATION } from '../constants/api.constant';
import { Automation } from '../models/automation.model';
import { ErrorService } from './error.service';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class AutomationService extends HttpService {
  constructor(errorService: ErrorService, private httpClient: HttpClient) {
    super(errorService);
  }

  search(keyword: string): Observable<Automation[]> {
    return this.httpClient
      .post(this.server + AUTOMATION.SEARCH, { search: keyword })
      .pipe(
        map((res) =>
          (res['data'] || []).map((e) => new Automation().deserialize(e))
        ),
        catchError(this.handleError('SEARCH AUTOMATION', []))
      );
  }
}
