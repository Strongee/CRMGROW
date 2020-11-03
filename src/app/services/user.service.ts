import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, filter, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AUTH, USER } from '../constants/api.constant';
import { Garbage } from '../models/garbage.model';
import { User } from '../models/user.model';
import { ErrorService } from './error.service';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class UserService extends HttpService {
  profile: BehaviorSubject<User> = new BehaviorSubject(new User());
  profile$: Observable<User> = this.profile.asObservable();

  garbage: BehaviorSubject<Garbage> = new BehaviorSubject(new Garbage());
  garbage$: Observable<Garbage> = this.garbage.asObservable();

  constructor(private httpClient: HttpClient, errorService: ErrorService) {
    super(errorService);
  }

  public register() {}
  public login(user): Observable<any> {
    const reqHeader = new HttpHeaders({
      'Content-Type': 'application/json',
      'No-Auth': 'True'
    });
    return this.httpClient
      .post(environment.api + AUTH.SIGNIN, JSON.stringify(user), {
        headers: reqHeader
      })
      .pipe(catchError(this.handleError('SIGNIN REQUEST')));
  }
  public requestOAuthUrl(type: string): Observable<any> {
    const reqHeader = new HttpHeaders({
      'Content-Type': 'application/json',
      'No-Auth': 'True'
    });
    return this.httpClient.get(environment.api + AUTH.OAUTH_REQUEST + type, {
      headers: reqHeader
    });
  }

  public requestOutlookProfile(code: string): Observable<any> {
    const reqHeader = new HttpHeaders({
      'Content-Type': 'application/json',
      'No-Auth': 'True'
    });
    return this.httpClient.get(
      environment.api + AUTH.OUTLOOK_PROFILE_REQUEST + code,
      { headers: reqHeader }
    );
  }

  public requestGoogleProfile(code: string): Observable<any> {
    const reqHeader = new HttpHeaders({
      'Content-Type': 'application/json',
      'No-Auth': 'True'
    });
    return this.httpClient.get(
      environment.api + AUTH.GOOGLE_PROFILE_REQUEST + code,
      { headers: reqHeader }
    );
  }
  public checkEmail() {}
  public checkNickName() {}
  public checkPhone() {}
  public isAuthenticated(): boolean {
    if (localStorage.getItem('token') != null) {
      return true;
    } else {
      return false;
    }
  }

  public loadProfile(): Observable<any> {
    return this.httpClient.get(environment.api + USER.PROFILE).pipe(
      map((res) => res['data']),
      catchError(this.handleError('GET PROFILE'))
    );
  }
  public updateProfile(profile: any): Observable<any> {
    return this.httpClient
      .put(environment.api + USER.UPDATE_PROFILE, profile)
      .pipe(
        map((res) => res['data']),
        catchError(this.handleError('UPDATE PROFILE'))
      );
  }
  public updateUser(field, value) {
    const user = JSON.parse(localStorage.getItem('user'));
    user[field] = value;
    localStorage.setItem('user', JSON.stringify(user));
  }
  public updatePassword(oldPwd: string, newPwd: string): Observable<any> {
    const data = {
      old_password: oldPwd,
      new_password: newPwd
    };
    return this.httpClient.post(
      this.server + USER.UPDATE_PASSWORD,
      JSON.stringify(data)
    );
  }
  public getPayment(id: string): Observable<any> {
    return this.httpClient.get(this.server + USER.PAYMENT + id);
  }
  public setToken(token: string): void {
    localStorage.setItem('token', token);
  }
  public getToken() {
    return localStorage.getItem('token');
  }
  public setProfile(profile: User): void {
    this.profile.next(profile);
  }
  public updateProfileImpl(data: any): void {
    const profile = this.profile.getValue();
    this.profile.next({ ...profile, ...data });
    return;
  }
  public setGarbage(garbage: Garbage): void {
    this.garbage.next(garbage);
    return;
  }
  public requestSyncUrl(type: string): Observable<any> {
    switch (type) {
      case 'gmail':
        return this.httpClient.get(environment.api + USER.SYNC_GMAIL);
      case 'outlook':
        return this.httpClient.get(environment.api + USER.SYNC_OUTLOOK);
    }
  }
  public loadAffiliate(): Observable<any> {
    return this.httpClient.get(environment.api + USER.LOAD_AFFILIATE).pipe(
      map((res) => res['data']),
      catchError(this.handleError('GET USER AFFILIATE'))
    );
  }
  public createAffiliate(): Observable<any> {
    return this.httpClient
      .post(environment.api + USER.CREATE_AFFILIATE, {})
      .pipe(
        map((res) => res['data']),
        catchError(this.handleError('CREATE AFFILIATE'))
      );
  }
}
