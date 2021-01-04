import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { THEME } from '../constants/api.constant';
import { Theme } from '../models/theme.model';
import { STATUS } from '../constants/variable.constants';
import { HttpService } from './http.service';
import { ErrorService } from './error.service';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class ThemeService extends HttpService {
  constructor(private httpClient: HttpClient, errorService: ErrorService) {
    super(errorService);
  }

  themes: BehaviorSubject<Theme[]> = new BehaviorSubject([]);
  themes$ = this.themes.asObservable();
  loadStatus: BehaviorSubject<string> = new BehaviorSubject(STATUS.NONE);
  loading$ = this.loadStatus.asObservable();

  /**
   * LOAD ALL THEMES
   * @param force Flag to load force
   */

  getAllTheme(force = false): Observable<Theme[]> {
    if (!force) {
      const loadStatus = this.loadStatus.getValue();
      if (loadStatus != STATUS.NONE && loadStatus != STATUS.FAILURE) {
        return;
      }
    }
    this.loadStatus.next(STATUS.REQUEST);
    this.getAllThemeImpl().subscribe((themes) => {
      themes
        ? this.loadStatus.next(STATUS.SUCCESS)
        : this.loadStatus.next(STATUS.FAILURE);
      this.themes.next(themes || []);
    });
  }

  getAllThemeImpl(): Observable<Theme[]> {
    return this.httpClient.get(this.server + THEME.GET_THEME).pipe(
      map((res) => (res['data'] || []).map((e) => new Theme().deserialize(e))),
      catchError(this.handleError('LOAD THEMES', null))
    );
  }

  getTheme(id: string): any {
    return this.httpClient.get(this.server + THEME.GET_THEME + id);
  }

  saveTheme(theme: any): any {
    return this.httpClient.post(this.server + THEME.GET_THEME, theme);
  }

  updateTheme(id: string, data: any): any {
    return this.httpClient.put(this.server + THEME.GET_THEME + id, data);
  }

  deleteTheme(id: string): void {
    this.deleteImpl(id).subscribe((status) => {
      if (status === null) {
        return;
      }
      if (!status) {
        return;
      }
      const themes = this.themes.getValue();
      _.remove(themes, (e) => {
        return e._id === id;
      });
      this.themes.next(themes);
    });
  }

  deleteImpl(id: string): Observable<Theme[]> {
    return this.httpClient.delete(this.server + THEME.GET_THEME + id).pipe(
      map((res) => res['status'] || false),
      catchError(this.handleError('DELETE THEME', null))
    );
  }

  clear$(): void {
    this.themes.next([]);
    this.loadStatus.next(STATUS.NONE);
  }
}
