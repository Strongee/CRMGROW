import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  sharedData = {name: 'KKK'};

  constructor() {}

  changeShareData(event: any): void {
    this.sharedData['event'] = event;
  }
}
