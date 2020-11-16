import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { ErrorService } from './error.service';
import { HttpClient } from '@angular/common/http';
import { StoreService } from './store.service';
import { Observable } from 'rxjs';
import { SEND } from '../constants/api.constant';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EmailService extends HttpService {
  constructor(
    errorService: ErrorService,
    private httpClient: HttpClient,
    private storeService: StoreService
  ) {
    super(errorService);
  }

  send(mail, mailType= 'email'): Observable<any[]> {
    const type = mailType.toUpperCase();
    return this.httpClient.post(this.server + SEND[type], mail).pipe(
      map((res) => res['data'] || []),
      catchError(this.handleError('SEND EMAIL OF AFFILIATE', []))
    );
  }

  shareUrl(body): Observable<any[]> {
    return this.httpClient.post(this.server + SEND.SHARE, body).pipe(
      map((res) => res['data'] || []),
      catchError(this.handleError('SHARE URL OF AFFILIATE', []))
    );
  }

  sendMaterial( materials, materialType, mediaType, media, contacts, team) {
    let materialsArray = [];
    if (materialType === 'video') {
      materials.forEach((e) => {
        materialsArray.push(e._id);
      });
    } else {
      materialsArray = materials;
    }
    const apiName = (materialType + '_' + mediaType).toUpperCase();
    const materialParamName = materialType + 's';
    const api = SEND[apiName];
    const param = {
      subject: media.subject,
      content: media.content,
      contacts,
      [materialParamName]: materialsArray,
      team
    };
    return this.httpClient.post(this.server + api, param).pipe(
      map((res) => res['data'] || []),
      catchError(this.handleError('SEND MATERIAL OF AFFILIATE', []))
    );
  }
}