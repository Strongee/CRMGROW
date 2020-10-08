import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AUTH } from '../constants/api.constant';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  data = {
    profile: {},
    garbage: {}
  };

  constructor(private httpClient: HttpClient) {}

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
