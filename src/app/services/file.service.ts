import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { interval, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { FILE } from '../constants/api.constant';
import { ErrorService } from './error.service';
import { HttpService } from './http.service';
import { StoreService } from './store.service';
import { File } from '../models/file.model';

@Injectable({
  providedIn: 'root'
})
export class FileService extends HttpService {
  constructor(
    errorService: ErrorService,
    private httpClient: HttpClient,
    private storeService: StoreService
  ) {
    super(errorService);
  }

  attachImage(file): Observable<File> {
    const formData = new FormData();
    formData.append('file', file);
    return this.httpClient
      .post(this.server + FILE.UPLOAD_IMAGE, { formData })
      .pipe(
        map((res) => res['data'] || []),
        catchError(this.handleError('FILE UPLOAD', []))
      );
  }
}
