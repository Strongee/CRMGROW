import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { ErrorService } from './error.service';
import { HttpClient } from '@angular/common/http';
import { StoreService } from './store.service';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { CONTACT } from '../constants/api.constant';
import {
  Contact,
  ContactActivity,
  ContactDetail
} from '../models/contact.model';
import { ActivityDetail } from '../models/activityDetail.model';
import { map, catchError } from 'rxjs/operators';
import { STATUS } from '../constants/variable.constants';
import { SearchOption } from '../models/searchOption.model';

interface LoadResponse {
  contacts: ContactActivity[];
}
@Injectable({
  providedIn: 'root'
})
export class ContactService extends HttpService {
  loadStatus: BehaviorSubject<string> = new BehaviorSubject(STATUS.NONE);
  loading$ = this.loadStatus.asObservable();
  total: BehaviorSubject<number> = new BehaviorSubject(0);
  total$ = this.total.asObservable();
  searchOption: BehaviorSubject<SearchOption> = new BehaviorSubject(
    new SearchOption()
  );
  searchOption$ = this.searchOption.asObservable();
  searchStr: BehaviorSubject<string> = new BehaviorSubject('');
  searchStr$ = this.searchStr.asObservable();
  pageIndex: BehaviorSubject<number> = new BehaviorSubject(1);
  pageIndex$ = this.pageIndex.asObservable();

  loadSubscription: Subscription;

  constructor(
    errorService: ErrorService,
    private httpClient: HttpClient,
    private storeService: StoreService
  ) {
    super(errorService);
    this.searchOption$.subscribe(() => {
      this.loadPage();
    });

    this.searchStr$.subscribe(() => {
      this.loadPage();
    });
  }

  create(contact: any): void {}
  /**
   * Read the Detail information of the contact
   * @param _id: Contact Id to read the detail information
   * @param sortInfo: Page sort information for the next and prev contact
   */
  readImpl(_id: string, sortInfo = {}): Observable<ContactDetail> {
    return this.httpClient
      .post(this.server + CONTACT.READ + _id, sortInfo)
      .pipe(
        map((res) => new ContactDetail().deserialize(res['data'])),
        catchError(this.handleError('CONTACT DETAIL', null))
      );
  }
  /**
   * Read the Detail information of the contact and Emit the Behavior Subject
   * @param _id: Contact Id to read the detail information
   * @param sortInfo: Page sort information for the next and prev contact
   */
  read(_id: string, sortInfo = {}): void {
    this.readImpl(_id, sortInfo).subscribe((res) => {
      if (res) {
        this.storeService.selectedContact.next(res);
      }
    });
  }
  update(_id: string): void {}
  delete(_id: string): void {}

  loadPage(): void {
    const searchOption = this.searchOption.getValue();
    const searchStr = this.searchStr.getValue();
    if (searchOption.isEmpty()) {
      if (searchStr) {
        // Call Normal Search
        this.normalSearch(searchStr);
      } else {
        // Call Normal Load
        this.load(0);
      }
    } else {
      this.advancedSearch(searchStr);
    }
  }
  /**
   * Load Contacts and update the store
   * @param page : Contact Page Number
   */
  load(page: number): void {
    this.loadStatus.next(STATUS.REQUEST);
    this.loadSubscription && this.loadSubscription.unsubscribe();
    this.loadSubscription = this.loadImpl(page).subscribe((res) => {
      res
        ? this.loadStatus.next(STATUS.SUCCESS)
        : this.loadStatus.next(STATUS.FAILURE);
      if (res && res['contacts']) {
        this.storeService.pageContacts.next(res['contacts']);
        this.total.next(res['total']);
      }
    });
  }
  /**
   * Call API & Load Contacts
   * @param page
   */
  loadImpl(page: number): Observable<any> {
    this.loadStatus.next(STATUS.REQUEST);
    return this.httpClient
      .post(this.server + CONTACT.LOAD_PAGE + page, {
        field: 'name',
        dir: true
      })
      .pipe(
        map((res) => {
          const contacts = [];
          (res['data']['contacts'] || []).forEach((e) => {
            contacts.push(new ContactActivity().deserialize(e));
          });
          return {
            contacts,
            total: res['data']['count'] || 0
          };
        }),
        catchError(this.handleError('LOAD CONTACTS', null))
      );
  }

  /**
   * Advanced Search Call
   * @param str : keyword in the advanced search
   */
  advancedSearch(str: string): void {
    this.loadStatus.next(STATUS.REQUEST);
    this.loadSubscription && this.loadSubscription.unsubscribe();
    this.loadSubscription = this.advancedSearchImpl(str).subscribe(
      (contacts) => {
        contacts
          ? this.loadStatus.next(STATUS.SUCCESS)
          : this.loadStatus.next(STATUS.FAILURE);
        this.storeService.pageContacts.next(contacts || []);
        this.total.next(contacts.length);
      }
    );
  }
  advancedSearchImpl(str: string): Observable<ContactActivity[]> {
    const searchOption = this.searchOption.getValue();
    return this.httpClient
      .post(this.server + CONTACT.ADVANCE_SERACH, {
        ...searchOption,
        searchStr: str
      })
      .pipe(
        map((res) =>
          (res['data'] || []).map((e) => new ContactActivity().deserialize(e))
        ),
        catchError(this.handleError('ADVANCED FILTER', null))
      );
  }

  /**
   * Normal Search Call
   * @param str : keyword in the normal search
   */
  normalSearch(str: string): void {
    this.loadStatus.next(STATUS.REQUEST);
    this.loadSubscription && this.loadSubscription.unsubscribe();
    this.loadSubscription = this.normalSearchImpl(str).subscribe((contacts) => {
      contacts
        ? this.loadStatus.next(STATUS.SUCCESS)
        : this.loadStatus.next(STATUS.FAILURE);
      this.storeService.pageContacts.next(contacts || []);
      this.total.next(contacts.length);
    });
  }
  normalSearchImpl(str: string): Observable<ContactActivity[]> {
    return this.httpClient
      .post(this.server + CONTACT.NORMAL_SEARCH, {
        search: str
      })
      .pipe(
        map((res) =>
          (res['data']['contacts'] || []).map((e) =>
            new ContactActivity().deserialize(e)
          )
        ),
        catchError(this.handleError('FILTER', null))
      );
  }
  /**
   * Reduce the Page size
   * @param pageSize : New Page size of the Contacts
   */
  resizePage(pageSize: number): void {
    const contacts = this.storeService.pageContacts.getValue();
    const reduced = contacts.slice(0, pageSize);
    this.storeService.pageContacts.next(reduced);
  }
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
  getNormalSearch(str: string): any {
    return this.httpClient.post(this.server + CONTACT.NORMAL_SEARCH, {
      search: str
    });
  }
  getPageContacts(page, sort): Observable<any> {
    return this.httpClient
      .post(this.server + CONTACT.LOAD_PAGE + page, sort)
      .pipe(
        map((res) => res['data'] || []),
        catchError(this.handleError('LOAD CONTACTS', []))
      );
  }
  selectAll(): Observable<any> {
    return this.httpClient.get(this.server + CONTACT.SELECT_ALL).pipe(
      map((res) => res['data'] || []),
      catchError(this.handleError('SELECT ALL CONTACTS', []))
    );
  }
  // getSearchedContacts(query): Observable<any> {
  //   return this.httpClient.post(this.server + CONTACT.LOAD_SERACH, query).pipe(
  //     map((res) => res),
  //     catchError(this.handleError('SEARCH CONTACTS', []))
  //   );
  // }
  getContactsByIds(ids): Observable<any> {
    return this.httpClient
      .post(this.server + CONTACT.LOAD_BY_IDS, { ids })
      .pipe(
        map((res) => res['data'] || []),
        catchError(this.handleError('SEARCH CONTACTS', []))
      );
  }
  filter(query): Observable<Contact[]> {
    return this.httpClient.post(this.server + CONTACT.FILTER, query).pipe(
      map((res) => res['data'] || []),
      catchError(this.handleError('FILTER CONTACTS', []))
    );
  }
}
