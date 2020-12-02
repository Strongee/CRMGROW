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
  tags: BehaviorSubject<string[]> = new BehaviorSubject([]);
  tags$ = this.tags.asObservable();

  sources: BehaviorSubject<string[]> = new BehaviorSubject([]);
  sources$ = this.sources.asObservable();

  companies: BehaviorSubject<string[]> = new BehaviorSubject([]);
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
    return this.httpClient.post(this.server + TAG.DELETe, data);
  }
}
