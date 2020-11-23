import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Team } from '../models/team.model';
import { ErrorService } from './error.service';
import { HttpService } from './http.service';
import { StoreService } from './store.service';
import { Label } from '../models/label.model';
import {LABEL, TEAM, VIDEO} from '../constants/api.constant';

@Injectable({
  providedIn: 'root'
})
export class LabelService extends HttpService {
  labels: BehaviorSubject<Label[]> = new BehaviorSubject([]);
  labels$ = this.labels.asObservable();
  constructor(errorService: ErrorService, private httpClient: HttpClient) {
    super(errorService);
  }

  loadLabels(): void {
    this.getLabels().subscribe((labels) => {
      this.labels.next(labels);
    });
  }

  getLabels(): Observable<Label[]> {
    return this.httpClient.get(this.server + LABEL.GET).pipe(
      map((res) => (res['data'] || []).map((e) => new Label().deserialize(e))),
      catchError(this.handleError('GET LABELS', []))
    );
  }
  createLabel(label): Observable<Label[]> {
    return this.httpClient.post(this.server + LABEL.CREATE, label).pipe(
      map((res) => res['data'] || []),
      catchError(this.handleError('CREATE LABEL', []))
    );
  }
  updateLabel(id: string, label: any): Observable<any> {
    return this.httpClient.put(this.server + LABEL.PUT + id, label).pipe(
      map((res) => res['data'] || []),
      catchError(this.handleError('UPDATE LABEL', []))
    );
  }
  deleteLabel(id): Observable<Label[]> {
    return this.httpClient.delete(this.server + LABEL.DELETE + id).pipe(
      map((res) => res['data'] || []),
      catchError(this.handleError('DELETE LABEL', []))
    );
  }
}
