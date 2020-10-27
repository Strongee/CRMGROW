import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpService } from './http.service';
import { ErrorService } from './error.service';
import { APPOINTMENT } from '../constants/api.constant';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService extends HttpService {
  constructor(errorService: ErrorService, private httpClient: HttpClient) {
    super(errorService);
  }

  public getEvents(date: string, mode: string): any {
    return this.httpClient.get(
      this.server + APPOINTMENT.GET_EVENT + '?date=' + date + '&mode=' + mode
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
    calendar_id: string
  ): any {
    const recurrence = {
      event_id: event_id,
      recurrence_id: recurrence_id,
      calendar_id: calendar_id
    };
    return this.httpClient.post(
      this.server + APPOINTMENT.DELETE_EVENT,
      recurrence
    );
  }
}
