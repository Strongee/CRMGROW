import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SMS, TASK } from '../constants/api.constant';
import { Contact } from '../models/contact.model';
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
    return this.httpClient.get(this.server + SMS.GET).pipe(
      map((res) => res['data']),
      catchError(this.handleError('SMS GET ALL', null))
    );
  }

  getMessage(contact: Contact): any {
    return this.httpClient
      .post(this.server + SMS.GET_MESSAGE, { contact: contact })
      .pipe(
        map((res) => res['data']),
        catchError(this.handleError('SMS GET MESSAGE', null))
      );
  }

  searchNumbers(data: any): Observable<any> {
    return this.httpClient.post(this.server + SMS.SEARCH_NUMBER, data).pipe(
      map((res) => res['data']),
      catchError(this.handleError('SMS SEARCH NUMBER', null))
    );
  }
}
