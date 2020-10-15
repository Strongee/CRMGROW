import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ErrorService } from './error.service';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private server = environment.api;
  constructor(private errorService: ErrorService) {}

  handleError<T>(operation = 'Server Connection', result?: T) {
    return (error: any): Observable<T> => {
      // error message add to the Error Service
      this.errorService.addError(operation, error);
      // Inspect the error
      console.log(error);
      // default data observable
      return of(result as T);
      // TODO: return the error object to show the error result
    };
  }
}
