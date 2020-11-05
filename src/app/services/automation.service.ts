import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AUTOMATION } from '../constants/api.constant';
import { Automation } from '../models/automation.model';
import { ErrorService } from './error.service';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class AutomationService extends HttpService {
  constructor(errorService: ErrorService, private httpClient: HttpClient) {
    super(errorService);
  }

  search(keyword: string): Observable<Automation[]> {
    return this.httpClient
      .post(this.server + AUTOMATION.SEARCH, { search: keyword })
      .pipe(
        map((res) =>
          (res['data'] || []).map((e) => new Automation().deserialize(e))
        ),
        catchError(this.handleError('SEARCH AUTOMATION', []))
      );
  }
  getByPage(page: string): Observable<any> {
    return this.httpClient.get(this.server + AUTOMATION.LOAD_PAGE).pipe(
      map((res) => res),
      catchError(this.handleError('GET AUTOMATION PAGE BY ID', []))
    );
  }
  loadAll(): Observable<Automation[]> {
    return this.httpClient.get(this.server + AUTOMATION.LOAD_ALL).pipe(
      map((res) => res['data'] || []),
      catchError(this.handleError('LOAD ALL AUTOMATION', []))
    );
  }
  getStatus(id, contacts): Observable<Automation[]> {
    return this.httpClient
      .post(this.server + AUTOMATION.DETAIL + id, { contacts })
      .pipe(
        map((res) => res['data'] || []),
        catchError(this.handleError('GET AUTOMATION STATUS', []))
      );
  }
  delete(id): Observable<Automation[]> {
    return this.httpClient.delete(this.server + AUTOMATION.DELETE + id).pipe(
      map((res) => res['data'] || []),
      catchError(this.handleError('DELETE AUTOMATION', []))
    );
  }
  get(id): Observable<Automation[]> {
    return this.httpClient.get(this.server + AUTOMATION.READ + id).pipe(
      map((res) => res['data'] || []),
      catchError(this.handleError('READ AUTOMATION', []))
    );
  }
  update(id, automation): Observable<Automation[]> {
    return this.httpClient
      .put(this.server + AUTOMATION.UPDATE + id, automation)
      .pipe(
        map((res) => res['data'] || []),
        catchError(this.handleError('UPDATE AUTOMATION', []))
      );
  }
  create(body): Observable<Automation[]> {
    return this.httpClient
      .post(this.server + AUTOMATION.CREATE, body)
      .pipe(
        map((res) => res['data'] || []),
        catchError(this.handleError('GET AUTOMATION STATUS', []))
      );
  }
}
