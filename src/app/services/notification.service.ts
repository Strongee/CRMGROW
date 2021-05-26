import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { NOTIFICATION } from '../constants/api.constant';
import { ErrorService } from './error.service';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService extends HttpService {
  notifications: BehaviorSubject<any[]> = new BehaviorSubject([]);
  systemAlerts: BehaviorSubject<any[]> = new BehaviorSubject([]);
  notifications$ = this.notifications.asObservable();
  systemAlerts$ = this.systemAlerts.asObservable();

  lastTextSend: BehaviorSubject<number> = new BehaviorSubject(0);
  lastTextSend$ = this.lastTextSend.asObservable();

  lastEmailSend: BehaviorSubject<number> = new BehaviorSubject(0);
  lastEmailSend$ = this.lastEmailSend.asObservable();

  constructor(errorService: ErrorService, private httpClient: HttpClient) {
    super(errorService);
  }

  loadNotifications(): void {
    this.loadNotificationsImpl().subscribe((res) => {
      if (res['status']) {
        this.notifications.next(res['personal_notifications'] || []);
        this.systemAlerts.next(res['system_notifications'] || []);
      }
    });
  }

  loadNotificationsImpl(): Observable<any> {
    return this.httpClient
      .get(this.server + NOTIFICATION.GET + `?limit=${5}`)
      .pipe(
        map((res) => res),
        catchError(this.handleError('RECENT NOTIFICATIONS', null))
      );
  }

  getByPage(page: number): Observable<any> {
    return this.httpClient.get(this.server + NOTIFICATION.LOAD_PAGE + page);
  }

  setAsRead(ids: string[]): Observable<boolean> {
    return this.httpClient
      .post(this.server + NOTIFICATION.READ_MARK, { ids })
      .pipe(
        map((res) => res['status']),
        catchError(this.handleError('MARK AS READ', false))
      );
  }

  setAsUnread(ids: string[]): Observable<boolean> {
    return this.httpClient
      .post(this.server + NOTIFICATION.UNREAD_MARK, { ids })
      .pipe(
        map((res) => res['status']),
        catchError(this.handleError('MARK AS UNREAD', false))
      );
  }

  delete(ids: string[]): Observable<boolean> {
    return this.httpClient
      .post(this.server + NOTIFICATION.DELETE, { ids })
      .pipe(
        map((res) => res['status']),
        catchError(this.handleError('DELETE NOTIFICATIONS', false))
      );
  }

  getTextDeliverStatus(): Observable<any> {
    return this.httpClient.get(this.server + NOTIFICATION.TEXT_DELIVERY).pipe(
      map((res) => res['notification']),
      catchError(this.handleError('GET TEXT DELIVERY STATUS', null))
    );
  }

  getEmailDeliverStatus(): void {}

  getNotificationStatus(): Observable<any> {
    return this.httpClient.get(this.server + NOTIFICATION.STATUS).pipe(
      map((res) => res),
      catchError(this.handleError('GET NOTIFICATION DELIVERY STATUS', null))
    );
  }
}
