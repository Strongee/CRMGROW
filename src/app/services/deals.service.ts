import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpService } from './http.service';
import { ErrorService } from './error.service';
import { HttpClient } from '@angular/common/http';
import { DEALSTAGE, DEAL } from '../constants/api.constant';
import { STATUS } from '../constants/variable.constants';
import { DealStage } from '../models/deal-stage.model';
import { Deal } from '../models/deal.model';
import { Email } from '../models/email.model';
import { Note } from '../models/note.model';
import { Activity } from '../models/activity.model';
import { DetailActivity } from '../models/activityDetail.model';

@Injectable({
  providedIn: 'root'
})
export class DealsService extends HttpService {
  constructor(errorService: ErrorService, private httpClient: HttpClient) {
    super(errorService);
  }

  stages: BehaviorSubject<DealStage[]> = new BehaviorSubject([]);
  stages$ = this.stages.asObservable();
  stageSummaries: BehaviorSubject<DealStage[]> = new BehaviorSubject([]);
  stageSummaries$ = this.stageSummaries.asObservable();
  deals: BehaviorSubject<Deal[]> = new BehaviorSubject([]);
  deals$ = this.deals.asObservable();
  loadStageStatus: BehaviorSubject<string> = new BehaviorSubject(STATUS.NONE);
  loadingStage$ = this.loadStageStatus.asObservable();
  loadDealStatus: BehaviorSubject<string> = new BehaviorSubject(STATUS.NONE);
  loadingDeal$ = this.loadDealStatus.asObservable();

  easyLoad(force = false): void {
    if (!force) {
      const loadStatus = this.loadStageStatus.getValue();
      if (loadStatus != STATUS.NONE && loadStatus != STATUS.FAILURE) {
        return;
      }
    }
    this.loadStageStatus.next(STATUS.REQUEST);
    this.easyLoadImpl().subscribe((dealStages) => {
      dealStages
        ? this.loadStageStatus.next(STATUS.SUCCESS)
        : this.loadStageStatus.next(STATUS.FAILURE);
      dealStages.forEach((e) => {
        e.deals = [];
      });
      if (!this.stages.getValue() || !this.stages.getValue().length) {
        this.stages.next(dealStages || []);
        this.stageSummaries.next(dealStages || []);
      } else {
        this.stageSummaries.next(dealStages || []);
      }
    });
  }

  easyLoadImpl(): Observable<DealStage[]> {
    return this.httpClient.get(this.server + DEALSTAGE.EASY_LOAD).pipe(
      map((res) =>
        (res['data'] || []).map((e) => new DealStage().deserialize(e))
      ),
      catchError(this.handleError('LOAD STAGES', null))
    );
  }

  /**
   * LOAD ALL DEAL STAGES
   * @param force Flag to load force
   */

  getStage(force = false): void {
    if (!force) {
      const loadStatus = this.loadStageStatus.getValue();
      if (loadStatus != STATUS.NONE && loadStatus != STATUS.FAILURE) {
        return;
      }
    }
    this.loadStageStatus.next(STATUS.REQUEST);
    this.getStageImpl().subscribe((dealStages) => {
      dealStages
        ? this.loadStageStatus.next(STATUS.SUCCESS)
        : this.loadStageStatus.next(STATUS.FAILURE);
      this.stages.next(dealStages || []);
    });
  }

  getStageImpl(): Observable<DealStage[]> {
    return this.httpClient.get(this.server + DEALSTAGE.GET).pipe(
      map((res) =>
        (res['data'] || []).map((e) => new DealStage().deserialize(e))
      ),
      catchError(this.handleError('LOAD STAGES', null))
    );
  }

  createStage(stage: any): Observable<any> {
    return this.httpClient.post(this.server + DEALSTAGE.GET, stage).pipe(
      map((res) => res['data']),
      catchError(this.handleError('CREATE STAGE', null))
    );
  }

  createStage$(stage: DealStage): void {
    const stages = this.stages.getValue();
    stages.push(stage);
    this.stages.next(stages);
  }

  deleteStage(sourceId: string, targetId: string): any {
    return this.httpClient
      .post(this.server + DEALSTAGE.DELETE, {
        remove_stage: sourceId,
        move_stage: targetId
      })
      .pipe(
        map((res) => res['status']),
        catchError(this.handleError('STAGE REMOVE', false))
      );
  }

  updateStage(id: string, title: string): any {
    return this.httpClient
      .put(this.server + DEALSTAGE.EDIT + id, { title })
      .pipe(
        map((res) => res['status']),
        catchError(this.handleError('UPDATE DEAL STAGE', false))
      );
  }

  changeStageOrder(data: any): Observable<boolean> {
    return this.httpClient
      .post(this.server + DEALSTAGE.CHANGE_ORDER, data)
      .pipe(
        map((res) => res['status']),
        catchError(this.handleError('CHANGE ORDER', false))
      );
  }

  getDeal(id: string): Observable<any> {
    return this.httpClient.get(this.server + DEAL.GET + id).pipe(
      map((res) => res['data']),
      catchError(this.handleError('GET DEAL', null))
    );
  }

  editDeal(id: string, deal: any): any {
    return this.httpClient.put(this.server + DEAL.GET + id, deal).pipe(
      map((res) => res['data'] || []),
      catchError(this.handleError('Edit DEAL', null))
    );
  }

  updateContact(
    dealId: string,
    action: string,
    ids: string[]
  ): Observable<boolean> {
    return this.httpClient
      .post(this.server + DEAL.UPDATE_CONTACT + dealId, {
        action,
        contacts: ids
      })
      .pipe(
        map((res) => res['status']),
        catchError(this.handleError('EDIT DEAL CONTACTS', false))
      );
  }

  createDeal(deal: any): any {
    return this.httpClient.post(this.server + DEAL.GET, deal);
  }

  deleteDeal(deal: string): Observable<boolean> {
    return this.httpClient.delete(this.server + DEAL.GET + deal).pipe(
      map((res) => !!res['status']),
      catchError(this.handleError('DELETE DEAL', false))
    );
  }

  moveDeal(data: any): any {
    return this.httpClient.post(this.server + DEAL.MOVE, data);
  }

  clear$(): void {
    this.loadStageStatus.next(STATUS.NONE);
    this.loadDealStatus.next(STATUS.NONE);
    this.stages.next([]);
    this.deals.next([]);
  }

  addNote(data: any): Observable<any> {
    return this.httpClient.post(this.server + DEAL.ADD_NOTE, data).pipe(
      map((res) => res),
      catchError(this.handleError('ADD DEAL NOTE', []))
    );
  }

  editNote(data: any): Observable<boolean> {
    return this.httpClient.post(this.server + DEAL.EDIT_NOTE, data).pipe(
      map((res) => res['status']),
      catchError(this.handleError('EDIT DEAL NOTE', false))
    );
  }

  removeNote(data: any): Observable<boolean> {
    return this.httpClient.post(this.server + DEAL.REMOVE_NOTE, data).pipe(
      map((res) => res['status']),
      catchError(this.handleError('REMOVE DEAL NOTE', false))
    );
  }

  getNotes(data: any): Observable<Note[]> {
    return this.httpClient.post(this.server + DEAL.GET_NOTES, data).pipe(
      map((res) => res['data'] || []),
      catchError(this.handleError('GET DEAL NOTE', []))
    );
  }

  sendEmail(data: any): Observable<any> {
    return this.httpClient.post(this.server + DEAL.SEND_EMAIL, data).pipe(
      map((res) => res),
      catchError(this.handleError('DEAL SEND EMAIL', [], true))
    );
  }

  getEmails(data: any): Observable<Email[]> {
    return this.httpClient.post(this.server + DEAL.GET_EMAILS, data).pipe(
      map((res) => res['data'] || []),
      catchError(this.handleError('GET DEAL EMAILS', []))
    );
  }

  addFollowUp(data: any): Observable<any> {
    return this.httpClient.post(this.server + DEAL.ADD_FOLLOWUP, data).pipe(
      map((res) => res),
      catchError(this.handleError('ADD DEAL FOLLOWUP', []))
    );
  }

  editFollowUp(data: any): Observable<boolean> {
    return this.httpClient.post(this.server + DEAL.EDIT_FOLLOWUP, data).pipe(
      map((res) => res['status']),
      catchError(this.handleError('EDIT DEAL FOLLOWUP', false))
    );
  }

  completeFollowUp(data: any): Observable<boolean> {
    return this.httpClient
      .post(this.server + DEAL.COMPLETE_FOLLOWUP, data)
      .pipe(
        map((res) => res['status']),
        catchError(this.handleError('COMPLETE DEAL FOLLOWUP', false))
      );
  }

  removeFollowUp(data: any): Observable<boolean> {
    return this.httpClient.post(this.server + DEAL.REMOVE_FOLLOWUP, data).pipe(
      map((res) => res['status']),
      catchError(this.handleError('REMOVE DEAL FOLLOWUP', false))
    );
  }

  getFollowUp(data: any): Observable<any[]> {
    return this.httpClient.post(this.server + DEAL.GET_FOLLOWUP, data).pipe(
      map((res) => res['data'] || []),
      catchError(this.handleError('GET DEAL FOLLOWUP', []))
    );
  }

  getActivity(data: any): Observable<DetailActivity[]> {
    return this.httpClient.post(this.server + DEAL.GET_ACTIVITY, data).pipe(
      map((res) => res['data'] || []),
      catchError(this.handleError('GET DEAL ACTIVITY', []))
    );
  }

  addAppointment(data: any): Observable<any> {
    return this.httpClient.post(this.server + DEAL.ADD_APPOINTMENT, data).pipe(
      map((res) => res),
      catchError(this.handleError('ADD DEAL APPOINTMENT', []))
    );
  }

  updateAppointment(data: any): Observable<boolean> {
    return this.httpClient
      .post(this.server + DEAL.UPDATE_APPOINTMENT, data)
      .pipe(
        map((res) => res['status']),
        catchError(this.handleError('REMOVE DEAL APPOINTMENT', false))
      );
  }

  removeAppointment(data: any): Observable<boolean> {
    return this.httpClient
      .post(this.server + DEAL.REMOVE_APPOINTMENT, data)
      .pipe(
        map((res) => res['status']),
        catchError(this.handleError('REMOVE DEAL APPOINTMENT', false))
      );
  }

  getAppointments(data: any): Observable<any[]> {
    return this.httpClient.post(this.server + DEAL.GET_APPOINTMENT, data).pipe(
      map((res) => res['data'] || []),
      catchError(this.handleError('GET DEAL APPOINTMENT', []))
    );
  }

  addGroupCall(data: any): Observable<any> {
    return this.httpClient.post(this.server + DEAL.ADD_GROUP_CALL, data).pipe(
      map((res) => res),
      catchError(this.handleError('ADD DEAL GROUP CALL', []))
    );
  }

  getGroupCalls(data: any): Observable<any[]> {
    return this.httpClient.post(this.server + DEAL.GET_GROUP_CALL, data).pipe(
      map((res) => res['data'] || []),
      catchError(this.handleError('GET DEAL GROUP CALL', []))
    );
  }

  updateGroupCall(data: any): Observable<boolean> {
    return this.httpClient
      .post(this.server + DEAL.UPDAGE_GROUP_CALL, data)
      .pipe(
        map((res) => res['status']),
        catchError(this.handleError('EDIT DEAL GROUP CALL', false))
      );
  }

  removeGroupCall(data: any): Observable<boolean> {
    return this.httpClient
      .post(this.server + DEAL.REMOVE_GROUP_CALL, data)
      .pipe(
        map((res) => res['status']),
        catchError(this.handleError('REMOVE DEAL GROUP CALL', false))
      );
  }

  sendText(data: any): Observable<any> {
    return this.httpClient.post(this.server + DEAL.SEND_TEXT, data).pipe(
      map((res) => res),
      catchError(this.handleError('SEND DEAL TEXT', false, true))
    );
  }

  getStageWithContact(): Observable<any> {
    return this.httpClient.get(this.server + DEALSTAGE.WITHCONTACT).pipe(
      map((res) => {
        return res['data'];
      }),
      catchError(this.handleError('GET STAGE WITH CONTACT', false))
    );
  }
}
