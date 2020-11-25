import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { interval, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ErrorService } from './error.service';
import { HttpService } from './http.service';
import { StoreService } from './store.service';
import { MAILLIST, TEMPLATE } from '../constants/api.constant';
import { MailList } from '../models/maillist.model';

@Injectable({
  providedIn: 'root'
})
export class MailListService extends HttpService {
  constructor(
    errorService: ErrorService,
    private httpClient: HttpClient,
    private storeService: StoreService
  ) {
    super(errorService);
  }

  getList(): Observable<MailList[]> {
    return this.httpClient.get(this.server + MAILLIST.GET).pipe(
      map((res) => res['data'] || []),
      catchError(this.handleError('GET MAILLIST', []))
    );
  }
  createList(title, contacts): Observable<MailList[]> {
    return this.httpClient
      .post(this.server + MAILLIST.CREATE, { title, contacts })
      .pipe(
        map((res) => res['data'] || []),
        catchError(this.handleError('CREATE MAILLIST', []))
      );
  }
  search(keyword): Observable<MailList[]> {
    return this.httpClient
      .post(`${this.server + TEMPLATE.SEARCH}?q=${keyword}`, {})
      .pipe(
        map((res) =>
          (res['data'] || []).map((e) => new MailList().deserialize(e))
        ),
        catchError(this.handleError('SEARCH MAILLIST', []))
      );
  }
  addContacts(mail_list, contacts): Observable<any[]> {
    return this.httpClient
      .post(this.server + MAILLIST.ADD_CONTACTS, { mail_list, contacts })
      .pipe(
        map((res) => res['data'] || []),
        catchError(this.handleError('ADD CONTACTS', []))
      );
  }
}
