import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { ErrorService } from './error.service';
import { HttpClient } from '@angular/common/http';
import { DEALSTAGE, DEAL } from '../constants/api.constant';

@Injectable({
  providedIn: 'root'
})
export class DealsService extends HttpService {
  constructor(errorService: ErrorService, private httpClient: HttpClient) {
    super(errorService);
  }

  public getStage(): any {
    return this.httpClient.get(this.server + DEALSTAGE.GET);
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
