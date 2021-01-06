import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-social-profile',
  templateUrl: './social-profile.component.html',
  styleUrls: ['./social-profile.component.scss']
})
export class SocialProfileComponent implements OnInit {
  user: User = new User();
  socialProfileSaving = false;
  saveSocialProfileSubscription: Subscription;

  constructor(private userService: UserService) {
    this.userService.profile$.subscribe((profile) => {
      this.user = profile;
    });
  }

  ngOnInit(): void {}

  saveChange(): void {
    const social_link = this.user.social_link;
    this.socialProfileSaving = true;
    this.saveSocialProfileSubscription &&
      this.saveSocialProfileSubscription.unsubscribe();
    this.saveSocialProfileSubscription = this.userService
      .updateProfile({ social_link })
      .subscribe(
        () => {
          this.socialProfileSaving = false;
          this.userService.updateProfileImpl({ social_link });
        },
        () => {
          this.socialProfileSaving = false;
        }
      );
  }
}
