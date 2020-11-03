import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { ErrorService } from './error.service';
import { HttpClient } from '@angular/common/http';
import { StoreService } from './store.service';
import { Observable } from 'rxjs';
import { CONTACT } from '../constants/api.constant';
import { Contact } from '../models/contact.model';
import { ActivityDetail } from '../models/activity.model';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ContactService extends HttpService {
  constructor(
    errorService: ErrorService,
    private httpClient: HttpClient,
    private storeService: StoreService
  ) {
    super(errorService);
  }

  create(contact: any): void {}
  read(_id: string): void {}
  update(_id: string): void {}
  delete(_id: string): void {}
  load() {}
  easySearch(keyword: string): Observable<Contact[]> {
    return this.httpClient
      .post(this.server + CONTACT.QUICK_SEARCH, { search: keyword })
      .pipe(
        map((res) =>
          (res['data'] || []).map((data) => new Contact().deserialize(data))
        ),
        catchError(this.handleError('SEARCH CONTACTS', []))
      );
  }
  latestContacts(_id: string): Observable<ActivityDetail[]> {
    return this.httpClient
      .get(this.server + CONTACT.LATEST_CONTACTS + _id)
      .pipe(
        map((res) => res['data'] || []),
        catchError(this.handleError('GET LATEST CONTACTS', []))
      );
  }
}
