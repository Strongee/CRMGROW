import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-security',
  templateUrl: './security.component.html',
  styleUrls: ['./security.component.scss']
})
export class SecurityComponent implements OnInit {
  old_password = '';
  new_password = '';
  confirm_password = '';

  saving = false;
  saveSubscription: Subscription;

  constructor(public userService: UserService) {}

  ngOnInit(): void {}

  saveChange(): void {
    const hasPassword = this.userService.profile.getValue().hasPassword;
    if (hasPassword) {
      this.saving = true;
      this.saveSubscription && this.saveSubscription.unsubscribe();
      this.userService
        .updatePassword(this.old_password, this.new_password)
        .subscribe(
          (res) => {
            this.saving = false;
            this.old_password = '';
            this.new_password = '';
            this.confirm_password = '';
          },
          (err) => {
            this.saving = false;
          }
        );
    } else {
      this.saving = true;
      this.saveSubscription && this.saveSubscription.unsubscribe();
      this.userService.createPassword(this.new_password).subscribe((status) => {
        this.saving = false;
        this.old_password = '';
        this.new_password = '';
        this.confirm_password = '';
        if (status) {
          this.userService.updateProfileImpl({ hasPassword: true });
        }
      });
    }
  }
}
