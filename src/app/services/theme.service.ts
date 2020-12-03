import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { THEME } from '../constants/api.constant';
import { Theme } from '../models/theme.model';
import { HttpService } from './http.service';
import { ErrorService } from './error.service';

@Injectable({
  providedIn: 'root'
})
export class ThemeService extends HttpService {
  constructor(private httpClient: HttpClient, errorService: ErrorService) {
    super(errorService);
  }

  getAllTheme(): Observable<Theme[]> {
    return this.httpClient.get(this.server + THEME.GET_THEME).pipe(
      map((res) => res['data'] || []),
      catchError(this.handleError('LOAD THEMES', []))
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

  deleteTheme(id: string): any {
    return this.httpClient.delete(this.server + THEME.GET_THEME + id);
  }
}
