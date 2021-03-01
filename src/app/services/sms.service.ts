import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SMS } from '../constants/api.constant';
import { ErrorService } from './error.service';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class SmsService extends HttpService {
  constructor(errorService: ErrorService, private httpClient: HttpClient) {
    super(errorService);
  }

  getAllMessage(): any {
    return this.httpClient.get(this.server + SMS.GET);
  }
}
