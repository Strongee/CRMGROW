import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { USER } from '../constants/api.constant';

@Injectable({
  providedIn: 'root'
})
export class ConnectService {
  logoutSignal = new Subject<any>();
  constructor(private httpClient: HttpClient) {}

  public requestSyncUrl(type: string): Observable<any> {
    switch (type) {
      case 'gmail':
        return this.httpClient.get(environment.api + USER.SYNC_GMAIL);
      case 'outlook':
        return this.httpClient.get(environment.api + USER.SYNC_OUTLOOK);
    }
  }

  public connectAnotherService(): Observable<any> {
    return this.httpClient.get(environment.api + USER.SET_ANOTHER_MAIL);
  }

  public sendLogout(): void {
    this.logoutSignal.next(new Date());
  }

  public receiveLogout(): Observable<any> {
    return this.logoutSignal.asObservable();
  }
}
