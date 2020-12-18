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
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class DealsService extends HttpService {
  constructor(errorService: ErrorService, private httpClient: HttpClient) {
    super(errorService);
  }

  stages: BehaviorSubject<DealStage[]> = new BehaviorSubject([]);
  stages$ = this.stages.asObservable();
  deals: BehaviorSubject<Deal[]> = new BehaviorSubject([]);
  deals$ = this.deals.asObservable();
  loadStageStatus: BehaviorSubject<string> = new BehaviorSubject(STATUS.NONE);
  loadingStage$ = this.loadStageStatus.asObservable();
  loadDealStatus: BehaviorSubject<string> = new BehaviorSubject(STATUS.NONE);
  loadingDeal$ = this.loadDealStatus.asObservable();

  /**
   * LOAD ALL DEAL STAGES
   * @param force Flag to load force
   */

  getStage(force = false): Observable<DealStage[]> {
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

  public createStage(stage: any): any {
    return this.httpClient.post(this.server + DEALSTAGE.GET, stage);
  }

  public getDeal(): any {
    return this.httpClient.get(this.server + DEAL.GET);
  }

  public createDeal(deal: any): any {
    return this.httpClient.post(this.server + DEAL.GET, deal);
  }

  public moveDeal(data: any): any {
    return this.httpClient.post(this.server + DEAL.MOVE, data);
  }
}
