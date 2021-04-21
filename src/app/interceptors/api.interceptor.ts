import {
  HttpInterceptor,
  HttpHandler,
  HttpEvent,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { Observable, throwError, pipe } from 'rxjs';
import { UserService } from '../services/user.service';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  private role = '';
  constructor(private userService: UserService) {
    this.userService.profile$.subscribe((user) => {
      this.role = user.role ? 'guest' : '';
    });
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (
      req.url.indexOf('https://api.vimeo.com/videos') !== -1 ||
      req.url.indexOf('https://www.googleapis.com/youtube') !== -1
    ) {
      return next.handle(req);
    } else {
      if (req.url.indexOf('/assets/i18n') !== -1) {
        return next.handle(req);
      }
      if (!req.headers.has('Content-Type')) {
        req = req.clone({
          headers: req.headers.set('Content-Type', 'application/json')
        });
      }
      if (!req.headers.has('No-Auth')) {
        req = req.clone({
          setHeaders: {
            Authorization: localStorage.getItem('token'),
            Role: this.role
          }
        });
      }
      return next.handle(req).pipe(
        map((event: HttpEvent<any>) => {
          return event;
        }),
        catchError((error: HttpErrorResponse) => {
          return throwError(error);
        })
      );
    }
  }
}

/**
 * Error: code (400 - 500)
 * {
 *    message:
 *    code:
 *    error: string | array | object
 *    status: false
 * }
 */
