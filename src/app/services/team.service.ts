import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { interval, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { TEAM, TEMPLATE } from '../constants/api.constant';
import { Team } from '../models/team.model';
import { ErrorService } from './error.service';
import { HttpService } from './http.service';
import { StoreService } from './store.service';
import { Template } from '../models/template.model';

@Injectable({
  providedIn: 'root'
})
export class TeamService extends HttpService {
  constructor(
    errorService: ErrorService,
    private httpClient: HttpClient,
    private storeService: StoreService
  ) {
    super(errorService);
  }

  loadAll(): Observable<Team[]> {
    return this.httpClient.get(this.server + TEAM.LOAD).pipe(
      map((res) => res['data'] || []),
      catchError(this.handleError('LOAD TEAM', []))
    );
  }
  update(id, data): Observable<Team[]> {
    return this.httpClient.put(this.server + TEAM.UPDATE + id, data).pipe(
      map((res) => res['data'] || []),
      catchError(this.handleError('UPDATE TEAM NAME', []))
    );
  }
  delete(id): Observable<Team[]> {
    return this.httpClient.delete(this.server + TEAM.DELETE + id).pipe(
      map((res) => res['data'] || []),
      catchError(this.handleError('DELETE TEAM', []))
    );
  }
  acceptInvitation(teamId): Observable<any> {
    return this.httpClient
      .post(this.server + TEAM.ACCEPT_INVITATION + teamId, {})
      .pipe(
        map((res) => res['data'] || []),
        catchError(this.handleError('ACCEPT TEAM INVITATION', []))
      );
  }
  read(id): Observable<Team[]> {
    return this.httpClient.get(this.server + TEAM.READ + id).pipe(
      map((res) => res['data'] || []),
      catchError(this.handleError('READ TEAM', []))
    );
  }
  shareVideos(teamId, videoIds): Observable<any> {
    return this.httpClient
      .post(this.server + TEAM.SHARE_VIDEOS, {
        team_id: teamId,
        video_ids: videoIds
      })
      .pipe(
        map((res) => res['data'] || []),
        catchError(this.handleError('TEAM SHARE VIDEOS', []))
      );
  }
  sharePdfs(teamId, pdfIds): Observable<any> {
    return this.httpClient
      .post(this.server + TEAM.SHARE_PDFS, {
        team_id: teamId,
        pdf_ids: pdfIds
      })
      .pipe(
        map((res) => res['data'] || []),
        catchError(this.handleError('TEAM SHARE PDFS', []))
      );
  }
  shareImages(teamId, imageIds): Observable<any> {
    return this.httpClient
      .post(this.server + TEAM.SHARE_IMAGES, {
        team_id: teamId,
        image_ids: imageIds
      })
      .pipe(
        map((res) => res['data'] || []),
        catchError(this.handleError('TEAM SHARE IMAGES', []))
      );
  }
  removeVideo(id): Observable<any> {
    return this.httpClient.post(this.server + TEAM.REMOVE_VIDEO + id, {}).pipe(
      map((res) => res['data'] || []),
      catchError(this.handleError('TEAM REMOVE VIDEO', []))
    );
  }
  removePdf(id): Observable<any> {
    return this.httpClient.post(this.server + TEAM.REMOVE_PDF + id, {}).pipe(
      map((res) => res['data'] || []),
      catchError(this.handleError('TEAM REMOVE PDF', []))
    );
  }
  removeImage(id): Observable<any> {
    return this.httpClient.post(this.server + TEAM.REMOVE_IMAGE + id, {}).pipe(
      map((res) => res['data'] || []),
      catchError(this.handleError('TEAM REMOVE IMAGE', []))
    );
  }
  removeTemplate(id): Observable<any> {
    return this.httpClient
      .post(this.server + TEAM.REMOVE_TEMPLATE + id, {})
      .pipe(
        map((res) => res['data'] || []),
        catchError(this.handleError('TEAM REMOVE TEMPLATE', []))
      );
  }
  updateTeam(teamId, data): Observable<any> {
    return this.httpClient
      .post(this.server + TEAM.UPDATE_TEAM, {
        team_id: teamId,
        data
      })
      .pipe(
        map((res) => res['data'] || []),
        catchError(this.handleError('UPDATE TEAM', []))
      );
  }
  acceptRequest(teamId, memberId): Observable<any> {
    return this.httpClient
      .post(this.server + TEAM.ACCEPT_REQUEST, {
        team_id: teamId,
        request_id: memberId
      })
      .pipe(
        map((res) => res['data'] || []),
        catchError(this.handleError('UPDATE TEAM', []))
      );
  }

}
