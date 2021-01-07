import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbToast } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject } from 'rxjs';
import { Strings } from '../constants/strings.constant';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  private errorSubject: BehaviorSubject<any[]> = new BehaviorSubject([]);
  public errors$ = this.errorSubject.asObservable();

  lastError = {
    operation: 'Ready',
    message: 'Unknown Error',
    detail: '',
    statusText: '',
    status: 200
  };
  lastTime = new Date().getTime();

  constructor(private router: Router, private toast: ToastrService) {}
  addError(operation: string, error: any) {
    const errorObj = {
      operation,
      message: (error.error && error.error.error) || 'Unknown Error',
      detail: error.message,
      statusText: error.statusText,
      status: error.status
    };

    const diffTime = new Date().getTime() - this.lastTime;
    if (
      this.lastError.operation === errorObj.operation &&
      this.lastError.status === errorObj.status &&
      this.lastError.detail === errorObj.detail &&
      diffTime < 2000
    ) {
      return;
    }
    if (
      this.lastError.status === 0 &&
      errorObj.status === 0 &&
      diffTime < 3000
    ) {
      return;
    }

    switch (error.status) {
      case 0:
        // Network Error
        this.toast.error(
          Strings.NETWORK_ERROR_CONTENT,
          Strings.NETWORK_ERROR_TITLE,
          {
            positionClass: 'toast-top-center',
            timeOut: 360000
          }
        );
        break;
      case 401:
        // Authorization Error (Auth Page & Invalid Token)
        if (this.router.url.indexOf('/login') === 0) {
          this.toast.error(errorObj.message, Strings.LOGIN, {
            closeButton: true
          });
        } else {
          this.toast.error(errorObj.message, Strings.AUTHENTICATION, {
            closeButton: true
          });
          this.clearData();
          this.router.navigate(['/']);
        }
        break;
      default:
        this.toast.error(errorObj.message, errorObj.operation, {
          closeButton: true
        });
        this.errorSubject.next([errorObj, ...this.errorSubject.getValue()]);
    }

    this.lastError = errorObj;
    this.lastTime = new Date().getTime();
  }

  clearData(): void {
    localStorage.removeItem('token');
  }

  clear$(): void {
    this.errorSubject.next([]);
  }
}
