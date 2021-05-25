import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ErrorService } from './error.service';
import { HttpService } from './http.service';
import { STAGE, TAG } from '../constants/api.constant';
import { catchError, map } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class StageService extends HttpService {
  constructor(errorService: ErrorService, private httpClient: HttpClient) {
    super(errorService);
  }
  stages: BehaviorSubject<any[]> = new BehaviorSubject([]);
  stages$ = this.stages.asObservable();

  sources: BehaviorSubject<any[]> = new BehaviorSubject([]);
  sources$ = this.sources.asObservable();

  companies: BehaviorSubject<any[]> = new BehaviorSubject([]);
  companies$ = this.companies.asObservable();

  /**
   * Get All Stages
   */
  public getAllStagesImpl(): Observable<string[]> {
    return this.httpClient.get(this.server + STAGE.GET).pipe(
      map((res) => res['data'] || []),
      catchError(this.handleError('LOAD ALL STAGES', []))
    );
  }

  /**
   * Get All Stages and Set the Observable Data
   */
  public getAllStages(): void {
    this.getAllStagesImpl().subscribe((stages) => {
      this.stages.next(stages);
    });
  }

  /**
   * Get All Sources
   */
  public getAllSourcesImpl(): Observable<string[]> {
    return this.httpClient.get(this.server + TAG.LOAD_SOURCES).pipe(
      map((res) => res['data'] || []),
      catchError(this.handleError('LOAD ALL SOURCES', []))
    );
  }

  /**
   * Get All Sources and Set the Observable Data
   */
  public getAllSources(): void {
    this.getAllSourcesImpl().subscribe((tags) => {
      this.sources.next(tags);
    });
  }

  /**
   * Get All Brokerage
   */
  public getAllCompaniesImpl(): Observable<string[]> {
    return this.httpClient.get(this.server + TAG.LOAD_COMPANIES).pipe(
      map((res) => res['data'] || []),
      catchError(this.handleError('LOAD ALL COMPANIES', []))
    );
  }

  /**
   * Get All Tags and Set the Observable Data
   */
  public getAllCompanies(): void {
    this.getAllCompaniesImpl().subscribe((tags) => {
      this.companies.next(tags);
    });
  }

  /**
   * Update the List with New Tags List
   */
  public mergeList(stages: string[]): void {
    const existings = this.stages.getValue();
    const news = _.difference(stages, existings);
    const newJoined = _.concat(existings, news);
    this.stages.next(newJoined);
  }

  public stageLoad(): any {
    return this.httpClient.get(this.server + STAGE.GET);
  }

  /**
   * Tag Update
   * @param oldTag : Old Tag Name(String)
   * @param newTag : New Tag Name(String)
   */
  public tagUpdate(oldTag: string, newTag: string): any {
    const data = {
      oldTag: oldTag,
      newTag: newTag
    };
    return this.httpClient.post(this.server + TAG.UPDATE, data);
  }

  /**
   * Delte the Tag
   * @param tagName : Tag Name to Delete (string)
   */
  public tagDelete(tagName: string): any {
    const data = {
      tag: tagName
    };
    return this.httpClient.post(this.server + TAG.DELETE, data);
  }

  public tagContactDelete(tagName: string, contactId: string): any {
    const data = {
      tag: tagName,
      contact: contactId
    };
    return this.httpClient.post(this.server + TAG.DELETE, data);
  }

  clear$(): void {
    this.stages.next([]);
    this.sources.next([]);
    this.companies.next([]);
  }
}
