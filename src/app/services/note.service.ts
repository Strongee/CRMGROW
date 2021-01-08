import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { NOTE } from '../constants/api.constant';
import { ErrorService } from './error.service';
import { HttpService } from './http.service';
import { StoreService } from './store.service';

@Injectable({
  providedIn: 'root'
})
export class NoteService extends HttpService {
  constructor(
    errorService: ErrorService,
    private httpClient: HttpClient,
    private storeService: StoreService
  ) {
    super(errorService);
  }

  create(data: any): Observable<any> {
    return this.httpClient.post(this.server + NOTE.CREATE, data).pipe(
      map((res) => res['data']),
      catchError(this.handleError('NOTE CREATE', null))
    );
  }

  /**
   * Create the notes for bulk contacts
   * @param data : {title: string, content: string, contacts: contact ids array}
   */
  bulkCreate(data: any): Observable<any> {
    return this.httpClient.post(this.server + NOTE.BULK_CREATE, data).pipe(
      map((res) => res['status']),
      catchError(this.handleError('BULK NOTE CREATE', false))
    );
  }

  update(id: string, data: any): Observable<boolean> {
    return this.httpClient.put(this.server + NOTE.UPDATE + id, data).pipe(
      map((res) => res['status']),
      catchError(this.handleError('NOTE UPDATE', false))
    );
  }

  delete(id: string): Observable<boolean> {
    return this.httpClient.delete(this.server + NOTE.UPDATE + id).pipe(
      map((res) => res['status']),
      catchError(this.handleError('NOTE DELETE', false))
    );
  }
}
