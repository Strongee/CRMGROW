import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ErrorService } from './error.service';
import { HttpService } from './http.service';
import { TAG } from '../constants/api.constant';
import { catchError, map } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class TagService extends HttpService {
  constructor(errorService: ErrorService, private httpClient: HttpClient) {
    super(errorService);
  }
  tags: BehaviorSubject<any[]> = new BehaviorSubject([]);
  tags$ = this.tags.asObservable();

  sources: BehaviorSubject<any[]> = new BehaviorSubject([]);
  sources$ = this.sources.asObservable();

  companies: BehaviorSubject<any[]> = new BehaviorSubject([]);
  companies$ = this.companies.asObservable();

  /**
   * Get All Tags
   */
  public getAllTagsImpl(): Observable<string[]> {
    return this.httpClient.get(this.server + TAG.ALL).pipe(
      map((res) => res['data'] || []),
      catchError(this.handleError('LOAD ALL TAGES', []))
    );
  }

  /**
   * Get All Tags and Set the Observable Data
   */
  public getAllTags(): void {
    this.getAllTagsImpl().subscribe((tags) => {
      this.tags.next(tags);
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
  public mergeList(tags: string[]): void {
    const existings = this.tags.getValue();
    const news = _.difference(tags, existings);
    const newJoined = _.concat(existings, news);
    this.tags.next(newJoined);
  }

  public tagLoad(): any {
    return this.httpClient.get(this.server + TAG.GET);
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
    this.tags.next([]);
    this.sources.next([]);
    this.companies.next([]);
  }
}
