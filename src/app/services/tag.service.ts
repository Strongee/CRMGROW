import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ErrorService } from './error.service';
import { HttpService } from './http.service';
import { TAG } from '../constants/api.constant';

@Injectable({
  providedIn: 'root'
})
export class TagService extends HttpService {
  constructor(errorService: ErrorService, private httpClient: HttpClient) {
    super(errorService);
  }

  public tagLoad(): any {
    return this.httpClient.get(this.server + TAG.GET);
  }

  public tagUpdate(oldTag: string, newTag: string): any {
    const data = {
      oldTag: oldTag,
      newTag: newTag
    };
    return this.httpClient.post(this.server + TAG.UPDATE, data);
  }

  public tagDelete(data: any): any {
    return this.httpClient.post(this.server + TAG.DELETe, data);
  }
}
