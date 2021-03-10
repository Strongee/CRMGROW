import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { TEMPLATE, GARBAGE } from '../constants/api.constant';
import { STATUS } from '../constants/variable.constants';
import { Template } from '../models/template.model';
import { ErrorService } from './error.service';
import { HttpService } from './http.service';
import * as _ from 'lodash';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class TemplatesService extends HttpService {
  constructor(
    errorService: ErrorService,
    private httpClient: HttpClient,
    private toastr: ToastrService
  ) {
    super(errorService);
  }

  templates: BehaviorSubject<Template[]> = new BehaviorSubject([]);
  templates$ = this.templates.asObservable();
  loadStatus: BehaviorSubject<string> = new BehaviorSubject(STATUS.NONE);
  loading$ = this.loadStatus.asObservable();

  /**
   * LOAD ALL TEMPLATES
   * @param force Flag to load force
   */
  loadAll(force = false): void {
    if (!force) {
      const loadStatus = this.loadStatus.getValue();
      if (loadStatus != STATUS.NONE && loadStatus != STATUS.FAILURE) {
        return;
      }
    }
    this.loadStatus.next(STATUS.REQUEST);
    this.loadAllImpl().subscribe((templates) => {
      templates
        ? this.loadStatus.next(STATUS.SUCCESS)
        : this.loadStatus.next(STATUS.FAILURE);
      this.templates.next(templates || []);
    });
  }
  /**
   * CALL LOAD API
   */
  loadAllImpl(): Observable<Template[]> {
    return this.httpClient.get(this.server + TEMPLATE.LOAD_ALL).pipe(
      map((res) =>
        (res['data'] || []).map((e) => new Template().deserialize(e))
      ),
      catchError(this.handleError('LOAD TEMPLATES', null))
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

  delete(id: string): void {
    this.deleteImpl(id).subscribe((status) => {
      if (status === null) {
        return;
      }
      if (!status) {
        return;
      }
      const templates = this.templates.getValue();
      _.remove(templates, (e) => {
        return e._id === id;
      });
      this.templates.next(templates);
    });
  }

  deleteImpl(id: string): Observable<Template[]> {
    return this.httpClient.delete(this.server + TEMPLATE.DELETE + id).pipe(
      map((res) => res['status'] || false),
      catchError(this.handleError('DELETE TEMPLATE', null))
    );
  }

  create(template: Template): Observable<Template[]> {
    return this.httpClient.post(this.server + TEMPLATE.CREATE, template).pipe(
      map((res) => res['data']),
      catchError(this.handleError('CREATE TEMPLATE', null))
    );
  }

  /**
   * Push new template to the subject
   * @param template New Template
   */
  pushNew(template: Template): void {
    const templates = this.templates.getValue();
    templates.unshift(template);
    this.templates.next(templates);
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

  search(keyword: string, option: any): Observable<Template[]> {
    const optionData = {};
    for (const key in option) {
      if (option[key]) {
        optionData[key] = option[key];
      }
    }
    return this.httpClient
      .post(`${this.server + TEMPLATE.SEARCH}?q=${keyword}`, optionData)
      .pipe(
        map((res) =>
          (res['data'] || []).map((e) => new Template().deserialize(e))
        ),
        catchError(this.handleError('SEARCH TEMPLATES', []))
      );
  }

  loadOwn(): Observable<Template[]> {
    return this.httpClient.post(this.server + TEMPLATE.LOAD_OWN, {}).pipe(
      map((res) => res['data'] || []),
      catchError(this.handleError('LOAD OWN TEMPLATE', []))
    );
  }

  create$(template): void {
    const templates = this.templates.getValue();
    templates.push(template);
    this.templates.next([...templates]);
  }

  clear$(): void {
    this.loadStatus.next(STATUS.NONE);
    this.templates.next([]);
  }
}
