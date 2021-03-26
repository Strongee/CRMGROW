import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ErrorService } from './error.service';
import { HttpService } from './http.service';
import { Label } from '../models/label.model';
import { LABEL } from '../constants/api.constant';
import { moveItemInArray } from '@angular/cdk/drag-drop';

@Injectable({
  providedIn: 'root'
})
export class LabelService extends HttpService {
  labels: BehaviorSubject<Label[]> = new BehaviorSubject([]);
  labels$ = this.labels.asObservable();

  //Subscribe to open Manage Label Panel
  manageLabel: BehaviorSubject<boolean> = new BehaviorSubject(false);
  manageLabel$ = this.manageLabel.asObservable();

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
  createLabel(label: Label): Observable<Label> {
    return this.httpClient.post(this.server + LABEL.CREATE, label).pipe(
      map((res) => new Label().deserialize(res['data'])),
      catchError(this.handleError('CREATE LABEL', null))
    );
  }
  create$(label: Label): void {
    const labels = this.labels.getValue();
    labels.unshift(label);
    this.labels.next(labels);
  }
  updateLabel(id: string, label: any): Observable<boolean> {
    return this.httpClient.put(this.server + LABEL.PUT + id, label).pipe(
      map((res) => res['status'] || false),
      catchError(this.handleError('UPDATE LABEL', false))
    );
  }
  update$(label: Label): void {
    const labels = this.labels.getValue();
    labels.some((e) => {
      if (e._id === label._id) {
        e.deserialize({ ...label });
        return true;
      }
    });
    this.labels.next(labels);
  }
  deleteLabel(id: string): Observable<boolean> {
    return this.httpClient.delete(this.server + LABEL.DELETE + id).pipe(
      map((res) => res['status'] || false),
      catchError(this.handleError('DELETE LABEL', false))
    );
  }
  delete$(_id: string): void {
    const labels = this.labels.getValue();
    labels.some((e, index) => {
      if (e._id === _id) {
        labels.splice(index, 1);
        return true;
      }
    });
    this.labels.next(labels);
  }
  /**
   * Change the Order of the labels
   * @param prevIndex : Prev Index of the Priority
   * @param currentIndex : Current Index of the Priority
   */
  changeOrder(prevIndex: number, currentIndex: number): void {
    const labelList = this.labels.getValue();
    moveItemInArray(labelList, prevIndex, currentIndex);
    const data = [];
    labelList.forEach((e) => {
      if (e.role !== 'admin') {
        data.push({ _id: e._id, name: e.name });
      }
    });
    this.changeOrderImpl(data).subscribe((status) => {
      if (status) {
        this.labels.next(labelList);
      }
    });
  }

  changeOrderImpl(data: any[]): Observable<boolean> {
    return this.httpClient
      .post(this.server + LABEL.CHANGE_ORDER, { data: data.reverse() })
      .pipe(
        map((res) => res['status'] || false),
        catchError(this.handleError('UPDATE LABEL', false))
      );
  }

  clear$(): void {
    this.labels.next([]);
  }
}
