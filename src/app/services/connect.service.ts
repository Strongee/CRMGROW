import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { INTEGRATION, USER } from '../constants/api.constant';

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

  public connectCalendly(apiKey: any): any {
    return this.httpClient.post(
      environment.api + INTEGRATION.CHECK_CALENDLY,
      apiKey
    );
  }

  public disconnectCalendly(): any {
    return this.httpClient.get(
      environment.api + INTEGRATION.DISCONNECT_CALENDLY
    );
  }

  public getToken(): any {
    return this.httpClient.get(environment.api + INTEGRATION.GET_TOKEN);
  }

  public getEvent(): any {
    return this.httpClient.get(environment.api + INTEGRATION.GET_CALENDLY);
  }

  public setEvent(event: any): any {
    return this.httpClient.post(environment.api + INTEGRATION.SET_EVENT, event);
  }

  public sendLogout(): void {
    this.logoutSignal.next(new Date());
  }

  public receiveLogout(): Observable<any> {
    return this.logoutSignal.asObservable();
  }
}
