import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { interval, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { TEAM, TEMPLATE } from '../constants/api.constant';
import { Team } from '../models/team.model';
import { ErrorService } from './error.service';
import { HttpService } from './http.service';
import { StoreService } from './store.service';
import { TeamCall } from '../models/team-call.moel';

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
  loadInvitedStatus(): Observable<Team[]> {
    return this.httpClient.get(this.server + TEAM.LOAD_INVITED).pipe(
      map((res) => res['data'] || []),
      catchError(this.handleError('LOAD INVITED TEAM', []))
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
  getInquiry(id): Observable<any> {
    return this.httpClient.get(this.server + TEAM.CALL + id).pipe(
      map((res) => res),
      catchError(this.handleError('LOAD INQUIRY CALL', []))
    );
  }
  getPageInquiries(page): Observable<any> {
    return this.httpClient.get(this.server + TEAM.INQUIRY + page).pipe(
      map((res) => res),
      catchError(this.handleError('LOAD PAGE INQUIRIES CALL', []))
    );
  }
  getPagePlanned(page): Observable<any> {
    return this.httpClient.get(this.server + TEAM.PLANNED + page).pipe(
      map((res) => res),
      catchError(this.handleError('LOAD PAGE PLANNED CALL', []))
    );
  }
  getPageFinished(page): Observable<any> {
    return this.httpClient.get(this.server + TEAM.FINISHED + page).pipe(
      map((res) => res),
      catchError(this.handleError('LOAD PAGE FINISHED CALL', []))
    );
  }
  updateCall(id, data): Observable<TeamCall[]> {
    return this.httpClient.put(this.server + TEAM.UPDATE_CALL + id, data).pipe(
      map((res) => res['data'] || []),
      catchError(this.handleError('UPDATE TEAM CALL', []))
    );
  }
  deleteCall(id): Observable<TeamCall[]> {
    return this.httpClient.delete(this.server + TEAM.DELETE_CALL + id).pipe(
      map((res) => res['data'] || []),
      catchError(this.handleError('DELETE TEAM CALL', []))
    );
  }
}
