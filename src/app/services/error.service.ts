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

  constructor(private router: Router, private toast: ToastrService) {}
  addError(operation: string, error: any) {
    const errorObj = {
      operation,
      message: (error.error && error.error.error) || 'Unknown Error',
      detail: error.message,
      statusText: error.statusText,
      status: error.status
    };
    switch (error.status) {
      case 0:
        // Network Error
        this.toast.error(
          Strings.NETWORK_ERROR_CONTENT,
          Strings.NETWORK_ERROR_TITLE,
          {
            positionClass: 'toast-top-center'
          }
        );
        break;
      case 401:
        // Authorization Error (Auth Page & Invalid Token)
        if (this.router.url.indexOf('/login') === 0) {
          this.toast.error(errorObj.message, Strings.LOGIN);
        } else {
          this.toast.error(errorObj.message, Strings.AUTHENTICATION);
          this.clearData();
          this.router.navigate(['/']);
        }
        break;
      default:
        this.errorSubject.next([errorObj, ...this.errorSubject.getValue()]);
    }
  }

  clearData(): void {
    localStorage.removeItem('token');
  }
}
