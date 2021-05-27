import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { catchError, filter, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AUTH, GARBAGE, USER } from '../constants/api.constant';
import { Garbage } from '../models/garbage.model';
import { Template } from '../models/template.model';
import { User } from '../models/user.model';
import { ErrorService } from './error.service';
import { HttpService } from './http.service';
import { Payment } from '../models/payment.model';
import { Invoice } from '../models/invoice.model';
import { Material } from '../models/material.model';

@Injectable({
  providedIn: 'root'
})
export class UserService extends HttpService {
  profile: BehaviorSubject<User> = new BehaviorSubject(new User());
  profile$: Observable<User> = this.profile.asObservable();

  garbage: BehaviorSubject<Garbage> = new BehaviorSubject(new Garbage());
  garbage$: Observable<Garbage> = this.garbage.asObservable();

  invoice: BehaviorSubject<any> = new BehaviorSubject(null);
  invoice$ = this.invoice.asObservable();
  loadInvoiceSubscription: Subscription;

  payment: BehaviorSubject<any> = new BehaviorSubject(null);
  payment$ = this.payment.asObservable();
  loadPaymentSubscription: Subscription;

  sms: BehaviorSubject<Template> = new BehaviorSubject(new Template());
  email: BehaviorSubject<Template> = new BehaviorSubject(new Template());

  constructor(private httpClient: HttpClient, errorService: ErrorService) {
    super(errorService);
  }

  public register(): any {}
  public login(user: { email: string; password: string }): Observable<any> {
    const reqHeader = new HttpHeaders({
      'Content-Type': 'application/json',
      'No-Auth': 'True'
    });
    return this.httpClient
      .post(this.server + AUTH.SIGNIN, JSON.stringify(user), {
        headers: reqHeader
      })
      .pipe(catchError(this.handleError('SIGNIN REQUEST')));
  }

  public socialSignIn(user): Observable<any> {
    const reqHeader = new HttpHeaders({
      'Content-Type': 'application/json',
      'No-Auth': 'True'
    });
    return this.httpClient
      .post(this.server + AUTH.SOCIAL_SIGNIN, JSON.stringify(user), {
        headers: reqHeader
      })
      .pipe(catchError(this.handleError('SOCIAL SIGNIN REQUEST')));
  }

  public socialSignUp(user): Observable<any> {
    const reqHeader = new HttpHeaders({
      'Content-Type': 'application/json',
      'No-Auth': 'True'
    });
    return this.httpClient
      .post(this.server + AUTH.SOCIAL_SIGNUP, JSON.stringify(user), {
        headers: reqHeader
      })
      .pipe(catchError(this.handleError('SOCIAL SIGNUP REQUEST')));
  }

  public signup(user: any): any {
    const reqHeader = new HttpHeaders({
      'Content-Type': 'application/json',
      'No-Auth': 'True'
    });
    return this.httpClient
      .post(this.server + AUTH.SIGNUP, JSON.stringify(user), {
        headers: reqHeader
      })
      .pipe(catchError(this.handleError('SIGNUP REQUEST')));
  }

  /**
   * LOG OUT -> CALL API
   */
  public logout(): Observable<boolean> {
    return this.httpClient.post(this.server + AUTH.LOG_OUT, {}).pipe(
      map((res) => res['status']),
      catchError(this.handleError('LOG OUT', false))
    );
  }
  /**
   * LOG OUT -> Clear Token And profile Informations
   */
  public logoutImpl(): void {
    localStorage.removeItem('token');
    this.profile.next(new User());
    this.garbage.next(new Garbage());
  }
  public requestOAuthUrl(type: string): Observable<any> {
    const reqHeader = new HttpHeaders({
      'Content-Type': 'application/json',
      'No-Auth': 'True'
    });
    return this.httpClient.get(this.server + AUTH.OAUTH_REQUEST + type, {
      headers: reqHeader
    });
  }

  public requestOutlookProfile(code: string): Observable<any> {
    const reqHeader = new HttpHeaders({
      'Content-Type': 'application/json',
      'No-Auth': 'True'
    });
    return this.httpClient.get(
      this.server + AUTH.OUTLOOK_PROFILE_REQUEST + code,
      { headers: reqHeader }
    );
  }

  public requestGoogleProfile(code: string): Observable<any> {
    const reqHeader = new HttpHeaders({
      'Content-Type': 'application/json',
      'No-Auth': 'True'
    });
    return this.httpClient.get(
      this.server + AUTH.GOOGLE_PROFILE_REQUEST + code,
      { headers: reqHeader }
    );
  }
  public checkEmail(email): Observable<any> {
    const reqHeader = new HttpHeaders({
      'Content-Type': 'application/json',
      'No-Auth': 'True'
    });
    return this.httpClient
      .post(this.server + AUTH.CHECK_EMAIL, JSON.stringify({ email }), {
        headers: reqHeader
      })
      .pipe(catchError(this.handleError('CHECK EMAIL')));
  }
  public checkPhone(cell_phone): Observable<any> {
    const reqHeader = new HttpHeaders({
      'Content-Type': 'application/json',
      'No-Auth': 'True'
    });
    return this.httpClient
      .post(this.server + AUTH.CHECK_PHONE, JSON.stringify({ cell_phone }), {
        headers: reqHeader
      })
      .pipe(catchError(this.handleError('CHECK PHONE')));
  }

  public authorizeOutlook(code: string): Observable<any> {
    return this.httpClient.get(
      this.server + USER.AUTH_OUTLOOK + '?code=' + code
    );
  }
  public authorizeGoogle(code: string): Observable<any> {
    return this.httpClient.get(
      this.server + USER.AUTH_GOOGLE + '?code=' + code
    );
  }
  public authorizeOutlookCalendar(code: string): Observable<any> {
    return this.httpClient.get(
      this.server + USER.AUTH_OUTLOOK_CALENDAR + '?code=' + code
    );
  }
  public authorizeGoogleCalendar(code: string): Observable<any> {
    return this.httpClient.get(
      this.server + USER.AUTH_GOOGLE_CALENDAR + '?code=' + code
    );
  }
  public requestResetPassword(email): Observable<boolean> {
    const reqHeader = new HttpHeaders({
      'Content-Type': 'application/json',
      'No-Auth': 'True'
    });
    return this.httpClient
      .post(
        this.server + AUTH.FORGOT_PASSWORD,
        { email: email },
        {
          headers: reqHeader
        }
      )
      .pipe(
        map((res) => res['status']),
        catchError(this.handleError('REQUEST RESET PASSWORD', false))
      );
  }
  public resetPassword(requestData): Observable<boolean> {
    const reqHeader = new HttpHeaders({
      'Content-Type': 'application/json',
      'No-Auth': 'True'
    });
    return this.httpClient
      .post(this.server + AUTH.RESET_PASSWORD, JSON.stringify(requestData), {
        headers: reqHeader
      })
      .pipe(
        map((res) => res['status']),
        catchError(this.handleError('RESET PASSWORD', false))
      );
  }
  public isAuthenticated(): boolean {
    if (localStorage.getItem('token') != null) {
      return true;
    } else {
      return false;
    }
  }

  public loadProfile(): Observable<any> {
    return this.httpClient.get(this.server + USER.PROFILE).pipe(
      map((res) => res['data']),
      catchError(this.handleError('GET PROFILE'))
    );
  }
  public loadDefaults(): Observable<any> {
    return this.httpClient.get(this.server + GARBAGE.LOAD_DEFAULT).pipe(
      map((res) => res['data']),
      catchError(this.handleError('LOAD DEFAULT TEMPLATES', null))
    );
  }
  public updateProfile(profile: any): Observable<any> {
    return this.httpClient.put(this.server + USER.UPDATE_PROFILE, profile).pipe(
      map((res) => res['data']),
      catchError(this.handleError('UPDATE PROFILE'))
    );
  }
  public enableDesktopNotification(
    subscription: any,
    option: any
  ): Observable<boolean> {
    return this.httpClient
      .post(this.server + USER.ENABLE_DESKTOP_NOTIFICATION, {
        subscription,
        option
      })
      .pipe(
        map((res) => res['status']),
        catchError(this.handleError('ENABLE DESKTOP NOTIFICATION', false))
      );
  }
  public updateUser(field, value): void {
    const user = JSON.parse(localStorage.getItem('user'));
    user[field] = value;
    localStorage.setItem('user', JSON.stringify(user));
  }
  public updatePassword(oldPwd: string, newPwd: string): Observable<boolean> {
    const data = {
      old_password: oldPwd,
      new_password: newPwd
    };
    return this.httpClient
      .post(this.server + USER.UPDATE_PASSWORD, JSON.stringify(data))
      .pipe(
        map((res) => res['status']),
        catchError(this.handleError('Password Change', false))
      );
  }
  public createPassword(password: string): Observable<boolean> {
    const data = {
      password: password
    };
    return this.httpClient
      .post(this.server + USER.CREATE_PASSWORD, JSON.stringify(data))
      .pipe(
        map((res) => res['status']),
        catchError(this.handleError('CREATE PASSWORD', false))
      );
  }
  /**
   * Load the User Payment Information
   * @param id : Payment Information Id
   */

  public loadPayment(id: string): void {
    this.loadPaymentSubscription && this.loadPaymentSubscription.unsubscribe();
    this.loadPaymentSubscription = this.loadPaymentImpl(id).subscribe((res) => {
      if (res) {
        this.payment.next(res);
      }
    });
  }

  public loadPaymentImpl(id: string): Observable<any> {
    return this.httpClient.get(this.server + USER.PAYMENT + id).pipe(
      map((res) => res['data']),
      catchError(this.handleError('LOAD PAYMENT'))
    );
  }

  public updatePayment(payment: any): any {
    return this.httpClient
      .post(this.server + USER.UPDATE_PAYMENT, payment)
      .pipe(
        map((res) => res),
        catchError(this.handleError('UPDATE PAYMENT', false))
      );
  }

  public loadInvoice(): void {
    this.loadInvoiceSubscription && this.loadInvoiceSubscription.unsubscribe();
    this.loadInvoiceSubscription = this.loadInvoiceImpl().subscribe((res) => {
      if (res) {
        this.invoice.next(res);
      }
    });
  }

  public loadInvoiceImpl(): any {
    return this.httpClient.get(this.server + USER.GET_INVOICE);
  }

  public setToken(token: string): void {
    localStorage.setItem('token', token);
  }
  public getToken(): any {
    return localStorage.getItem('token');
  }

  /**
   * Init the User data from API call
   * @param profile: User
   */
  public setProfile(profile: User): void {
    this.profile.next(profile);
  }
  /**
   * Update the profile and submit the subject
   * @param data: Update Profile Imple
   */
  public updateProfileImpl(data: any): void {
    const profile = this.profile.getValue();
    this.profile.next({ ...profile, ...data });
    return;
  }
  /**
   * Init the Garbage from API call
   * @param garbage: Garbage
   */
  public setGarbage(garbage: Garbage): void {
    this.garbage.next(garbage);
    return;
  }
  public updateGarbage(garbage: any): Observable<boolean> {
    return this.httpClient.put(this.server + USER.UPDATE_GARBAGE, garbage).pipe(
      map((res) => res['status']),
      catchError(this.handleError('UPDATE GARBAGE', false))
    );
  }
  /**
   * Update the Garbage
   * @param garbage : Garbage
   */
  public updateGarbageImpl(data: any): void {
    const garbage = this.garbage.getValue();
    this.garbage.next({ ...garbage, ...data });
    return;
  }
  public requestSyncUrl(type: string): Observable<any> {
    switch (type) {
      case 'gmail':
        return this.httpClient.get(this.server + USER.SYNC_GMAIL);
      case 'outlook':
        return this.httpClient.get(this.server + USER.SYNC_OUTLOOK);
    }
  }
  public connectAnotherService(): Observable<any> {
    return this.httpClient.get(this.server + USER.SET_ANOTHER_MAIL);
  }
  public requestCalendarSyncUrl(type: string): Observable<any> {
    switch (type) {
      case 'gmail':
        return this.httpClient.get(this.server + USER.CALENDAR_SYNC_GMAIL).pipe(
          map((res) => res),
          catchError(this.handleError('REQUEST GOOGLE CALENDAR SYNC'))
        );
      case 'outlook':
        return this.httpClient
          .get(this.server + USER.CALENDAR_SYNC_OUTLOOK)
          .pipe(
            map((res) => res),
            catchError(this.handleError('REQUEST OUTLOOK CALENDAR SYNC'))
          );
    }
  }
  public disconnectMail(): any {
    return this.httpClient.get(this.server + USER.DISCONNECT_MAIL);
  }
  public disconnectCalendar(email: string): any {
    const data = {
      connected_email: email
    };
    return this.httpClient.post(this.server + USER.DISCONNECT_CALENDAR, data);
  }
  public requestZoomSyncUrl(): Observable<any> {
    return this.httpClient.get(this.server + USER.SYNC_ZOOM);
  }
  public loadAffiliate(): Observable<any> {
    return this.httpClient.get(this.server + USER.LOAD_AFFILIATE).pipe(
      map((res) => res),
      catchError(this.handleError('GET USER AFFILIATE'))
    );
  }
  public createAffiliate(): Observable<any> {
    return this.httpClient.post(this.server + USER.CREATE_AFFILIATE, {}).pipe(
      map((res) => res),
      catchError(this.handleError('CREATE AFFILIATE'))
    );
  }
  public loadReferrals(page): Observable<any> {
    return this.httpClient.get(this.server + USER.LOAD_REFERRALS).pipe(
      map((res) => res),
      catchError(this.handleError('GET USER REFERRALS'))
    );
  }
  public updateAffiliate(data): Observable<any> {
    return this.httpClient.put(this.server + USER.CREATE_AFFILIATE, data).pipe(
      map((res) => res['data']),
      catchError(this.handleError('UPDATE PROFILE'))
    );
  }
  public connectSMTP(data): Observable<any> {
    return this.httpClient
      .post(this.server + USER.CONNECT_SMTP, { ...data })
      .pipe(
        map((res) => res),
        catchError(this.handleError('CONNECT SMTP'))
      );
  }

  public cancelAccount(data): Observable<any> {
    return this.httpClient
      .post(this.server + USER.CANCEL_ACCOUNT, { ...data })
      .pipe(
        map((res) => res),
        catchError(this.handleError('CANCEL ACCOUNT'))
      );
  }

  public updatePackage(data): Observable<any> {
    return this.httpClient
      .post(this.server + USER.UPDATE_PACKAGE, { ...data })
      .pipe(
        map((res) => res),
        catchError(this.handleError('UPDATE PACKAGE'))
      );
  }

  public checkDowngrade(selectedPackage): Observable<any> {
    return this.httpClient
      .post(this.server + USER.CHECK_DOWNGRADE, { selectedPackage })
      .pipe(
        map((res) => res),
        catchError(this.handleError('CHECK DOWNGRADE PACKAGE'))
      );
  }

  public getUserInfo(id): Observable<any> {
    return this.httpClient.get(this.server + USER.INFO + id).pipe(
      map((res) => res),
      catchError(this.handleError('GET USER INFO'))
    );
  }

  public getUserInfoItem(type: string): any {
    const user = this.getUser();
    return user[type];
  }
  public getUser(): any {
    const user = localStorage.getItem('user');
    if (user) {
      return JSON.parse(localStorage.getItem('user'));
    } else {
      return {};
    }
  }
  public setUser(user: User): any {
    localStorage.setItem('user', JSON.stringify(user));
  }
}
