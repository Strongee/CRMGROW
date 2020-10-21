import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { interval, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { TEMPLATE, GARBAGE } from '../constants/api.constant';
import { Template } from '../models/template.model';
import { ErrorService } from './error.service';
import { HttpService } from './http.service';
import { StoreService } from './store.service';

@Injectable({
  providedIn: 'root'
})
export class TemplatesService extends HttpService {
  constructor(
    errorService: ErrorService,
    private httpClient: HttpClient,
    private storeService: StoreService
  ) {
    super(errorService);
  }

  loadAll(): Observable<Template[]> {
    return this.httpClient.get(this.server + TEMPLATE.LOAD_ALL).pipe(
      map((res) => res['data'] || []),
      catchError(this.handleError('LOAD TEMPLATES', []))
    );
  }

  getByPage(page): Observable<Template[]> {
    return this.httpClient.post(this.server + TEMPLATE.LOAD + page, {}).pipe(
      map((res) => res['data'] || []),
      catchError(this.handleError('LOAD TEMPLATES BY PAGE', []))
    );
  }

  setDefault(garbage): Observable<Template[]> {
    return this.httpClient.put(this.server + GARBAGE.SET, garbage).pipe(
      map((res) => res['data'] || []),
      catchError(this.handleError('SET DEFAULT GARBAGE', []))
    );
  }

  delete(id): Observable<Template[]> {
    return this.httpClient.delete(this.server + TEMPLATE.DELETE + id).pipe(
      map((res) => res['data'] || []),
      catchError(this.handleError('DELETE TEMPLATE', []))
    );
  }

  create(template): Observable<Template[]> {
    return this.httpClient.post(this.server + TEMPLATE.CREATE, template).pipe(
      map((res) => res['data'] || []),
      catchError(this.handleError('CREATE TEMPLATE', []))
    );
  }

  update(id, template): Observable<Template[]> {
    return this.httpClient
      .put(this.server + TEMPLATE.UPDATE + id, template)
      .pipe(
        map((res) => res['data'] || []),
        catchError(this.handleError('CREATE TEMPLATE', []))
      );
  }

  read(id): Observable<Template> {
    return this.httpClient.get(this.server + TEMPLATE.READ + id).pipe(
      map((res) => res['data'] || []),
      catchError(this.handleError('READ TEMPLATES', []))
    );
  }
}
