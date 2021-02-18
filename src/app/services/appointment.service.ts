import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpService } from './http.service';
import { ErrorService } from './error.service';
import { APPOINTMENT } from '../constants/api.constant';
import { catchError, map } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { STATUS } from '../constants/variable.constants';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService extends HttpService {
  constructor(errorService: ErrorService, private httpClient: HttpClient) {
    super(errorService);
    this.calendars$.subscribe((calendars) => {
      const subCalendars = {};
      if (calendars) {
        calendars.forEach((account) => {
          if (account.data) {
            account.data.forEach((e) => {
              subCalendars[e.id] = { ...e, account: account.email };
            });
          }
        });
        this.subCalendars.next(subCalendars);
      }
    });
  }

  loadCalendarsStatus: BehaviorSubject<string> = new BehaviorSubject(
    STATUS.NONE
  );
  loadingCalendars$ = this.loadCalendarsStatus.asObservable();
  calendars: BehaviorSubject<any[]> = new BehaviorSubject([]);
  calendars$ = this.calendars.asObservable();
  subCalendars: BehaviorSubject<any> = new BehaviorSubject(null);
  subCalendars$ = this.subCalendars.asObservable();

  public loadCalendars(force = false): void {
    if (!force) {
      const loadStatus = this.loadCalendarsStatus.getValue();
      if (loadStatus != STATUS.NONE && loadStatus != STATUS.FAILURE) {
        return;
      }
    }
    this.loadCalendarsStatus.next(STATUS.REQUEST);
    this.loadCalendarsImpl().subscribe((calendars) => {
      calendars
        ? this.loadCalendarsStatus.next(STATUS.SUCCESS)
        : this.loadCalendarsStatus.next(STATUS.FAILURE);
      this.calendars.next(calendars);
    });
  }

  public loadCalendarsImpl(): Observable<any> {
    return this.httpClient.get(this.server + APPOINTMENT.LOAD_CALENDARS).pipe(
      map((res) => res['data']),
      catchError(this.handleError('LOAD CALENDARS', null))
    );
  }

  public getEvents(date: string, mode: string): Observable<any> {
    return this.httpClient
      .get(
        this.server + APPOINTMENT.GET_EVENT + '?date=' + date + '&mode=' + mode
      )
      .pipe(
        map((res) => res['data']),
        catchError(this.handleError('LOAD EVENTS', null))
      );
  }
  public createEvents(event: any): any {
    return this.httpClient.post(this.server + APPOINTMENT.GET_EVENT, event);
  }
  public updateEvents(event: any, id: string): any {
    return this.httpClient.put(
      this.server + APPOINTMENT.UPDATE_EVENT + id,
      event
    );
  }
  public removeEvents(
    event_id: string,
    recurrence_id: string,
    calendar_id: string,
    connected_email: string
  ): any {
    const recurrence = {
      event_id: event_id,
      recurrence_id: recurrence_id,
      calendar_id: calendar_id,
      connected_email
    };
    return this.httpClient.post(
      this.server + APPOINTMENT.DELETE_EVENT,
      recurrence
    );
  }

  public acceptEvent(
    event_id: string,
    recurrence_id: string,
    calendar_id: string,
    connected_email: string
  ): Observable<boolean> {
    const event = {
      event_id,
      recurrence_id,
      calendar_id,
      connected_email
    };

    return this.httpClient.post(this.server + APPOINTMENT.ACCEPT, event).pipe(
      map((res) => res['status']),
      catchError(this.handleError('ACCEPT EVENT', false))
    );
  }
}
