import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AUTH } from '../constants/api.constant';
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
  public login() {}
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
}
