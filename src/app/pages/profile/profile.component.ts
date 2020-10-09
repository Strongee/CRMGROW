import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profile: string;

  constructor(private userService: UserService) {
    this.userService.profile.subscribe(res => {
      console.log('profile', res);
    });
    const observe = this.userService.profile.asObservable();
    observe.subscribe(res => {
      console.log('profile111', res);
    });
    observe.subscribe(res => {
      console.log('profile222', res);
    });
    this.userService.profile.subscribe(res => {
      console.log('profile333', res);
    });
  }

  ngOnInit(): void {}

  updateProfile() {
    const v = this.userService.profile.getValue();
    v.picture_profile = this.profile;
    this.userService.profile.next(v);
    console.log(JSON.stringify(v));
  }
}
