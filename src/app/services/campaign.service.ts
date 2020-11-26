import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { interval, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ErrorService } from './error.service';
import { HttpService } from './http.service';
import { StoreService } from './store.service';
import { CAMPAIGN, MAILLIST, TEMPLATE } from '../constants/api.constant';
import { Campaign } from '../models/campaign.model';

@Injectable({
  providedIn: 'root'
})
export class CampaignService extends HttpService {
  constructor(
    errorService: ErrorService,
    private httpClient: HttpClient,
    private storeService: StoreService
  ) {
    super(errorService);
  }

  create(data): Observable<Campaign[]> {
    return this.httpClient.post(this.server + CAMPAIGN.CREATE, { ...data }).pipe(
      map((res) => res['data'] || []),
      catchError(this.handleError('CREATE CAMPAIGN', []))
    );
  }
}
