import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  private errorSubject: BehaviorSubject<any[]> = new BehaviorSubject([]);
  public errors$ = this.errorSubject.asObservable();
  constructor() {}
  addError(operation: string, error: any) {
    const errorObj = {
      operation,
      message: error.message,
      status: error.status
    };
    this.errorSubject.next([errorObj, ...this.errorSubject.getValue()]);
  }
}
