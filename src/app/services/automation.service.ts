import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AUTOMATION } from '../constants/api.constant';
import { STATUS } from '../constants/variable.constants';
import { Automation } from '../models/automation.model';
import { Contact } from '../models/contact.model';
import { ErrorService } from './error.service';
import { HttpService } from './http.service';
import { SearchOption } from '../models/searchOption.model';

@Injectable({
  providedIn: 'root'
})
export class AutomationService extends HttpService {
  automations: BehaviorSubject<Automation[]> = new BehaviorSubject([]);
  automations$ = this.automations.asObservable();
  loadStatus: BehaviorSubject<string> = new BehaviorSubject(STATUS.NONE);
  loading$ = this.loadStatus.asObservable();

  constructor(errorService: ErrorService, private httpClient: HttpClient) {
    super(errorService);
  }

  /**
   * Load All Automations
   * @param force Flag to load force
   */
  loadAll(force = false): void {
    if (!force) {
      const loadStatus = this.loadStatus.getValue();
      if (loadStatus != STATUS.NONE && loadStatus != STATUS.FAILURE) {
        return;
      }
    }
    this.loadStatus.next(STATUS.REQUEST);
    this.loadAllImpl().subscribe((automations) => {
      automations
        ? this.loadStatus.next(STATUS.SUCCESS)
        : this.loadStatus.next(STATUS.FAILURE);
      this.automations.next(automations || []);
    });
  }
  /**
   * Call Load API
   */
  loadAllImpl(): Observable<Automation[]> {
    return this.httpClient.get(this.server + AUTOMATION.LOAD_ALL).pipe(
      map((res) =>
        (res['data'] || []).map((e) => new Automation().deserialize(e))
      ),
      catchError(this.handleError('LOAD ALL AUTOMATION', null))
    );
  }

  reload(): void {
    this.loadAll(true);
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

  getByPage(page: string): Observable<any> {
    return this.httpClient.get(this.server + AUTOMATION.LOAD_PAGE).pipe(
      map((res) => res),
      catchError(this.handleError('GET AUTOMATION PAGE BY ID', []))
    );
  }
  getStatus(id, contacts): Observable<Automation[]> {
    return this.httpClient
      .post(this.server + AUTOMATION.DETAIL + id, { contacts })
      .pipe(
        map((res) => res['data'] || []),
        catchError(this.handleError('GET AUTOMATION STATUS', []))
      );
  }
  getAssignedContacts(id: string): Observable<Contact[]> {
    return this.httpClient.get(this.server + AUTOMATION.CONTACTS + id).pipe(
      map((res) =>
        (res['data'] || []).map((e) => new Contact().deserialize(e))
      ),
      catchError(this.handleError('GET AUTOMATION STATUS', []))
    );
  }
  getContactDetail(contact: string): Observable<any> {
    return this.httpClient
      .post(this.server + AUTOMATION.CONTACT_DETAIL, {
        contact
      })
      .pipe(
        map((res) => res['data']),
        catchError(this.handleError('GET CONTACT STATUS DETAIL', null))
      );
  }
  delete(id: string): Observable<Automation[]> {
    return this.httpClient.delete(this.server + AUTOMATION.DELETE + id).pipe(
      map((res) => res['status']),
      catchError(this.handleError('DELETE AUTOMATION', false))
    );
  }
  get(id: string, pageSize = 50, page = 0): Observable<Automation[]> {
    const data = {
      id: id,
      count: pageSize,
      skip: page
    };
    return this.httpClient.post(this.server + AUTOMATION.READ, data).pipe(
      map((res) => res['data'] || []),
      catchError(this.handleError('READ AUTOMATION', []))
    );
  }
  update(id, automation): Observable<Automation[]> {
    return this.httpClient
      .put(this.server + AUTOMATION.UPDATE + id, automation)
      .pipe(
        map((res) => res['data'] || []),
        catchError(this.handleError('UPDATE AUTOMATION', []))
      );
  }
  create(body): Observable<Automation[]> {
    return this.httpClient.post(this.server + AUTOMATION.CREATE, body).pipe(
      map((res) => res['data'] || []),
      catchError(this.handleError('GET AUTOMATION STATUS', []))
    );
  }

  bulkAssign(contacts: string[], automation: string): Observable<any> {
    return this.httpClient
      .post(this.server + AUTOMATION.ASSIGN, {
        contacts,
        automation_id: automation
      })
      .pipe(
        map((res) => res),
        catchError(this.handleError('AUTOMATION BULK ASSIGN', null))
      );
  }

  reAssign(contact: string, automation: string): Observable<boolean> {
    return this.httpClient
      .post(this.server + AUTOMATION.ASSIGN_NEW, {
        contact,
        automation_id: automation
      })
      .pipe(
        map((res) => res['status']),
        catchError(this.handleError('AUTOMATION ASSIGN', false))
      );
  }

  unAssign(contact: string): Observable<boolean> {
    return this.httpClient.get(this.server + AUTOMATION.CANCEL + contact).pipe(
      map((res) => res['status']),
      catchError(this.handleError('UNASSIGN AUTOMATION', false))
    );
  }

  loadOwn(): Observable<Automation[]> {
    return this.httpClient.get(this.server + AUTOMATION.LOAD_OWN).pipe(
      map((res) => res['data'] || []),
      catchError(this.handleError('LOAD OWN AUTOMATION', []))
    );
  }

  clear$(): void {
    this.loadStatus.next(STATUS.NONE);
    this.automations.next([]);
  }

  searchContact(id: string, keyword: string): Observable<Contact[]> {
    return this.httpClient
      .post(this.server + AUTOMATION.SEARCH_CONTACT, {
        automation: id,
        search: keyword
      })
      .pipe(
        map((res) =>
          (res['data'] || []).map((e) => new Contact().deserialize(e))
        ),
        catchError(this.handleError('SEARCH AUTOMATION CONTACT', []))
      );
  }
}
