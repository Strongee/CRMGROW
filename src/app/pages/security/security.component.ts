import { Component, OnInit } from '@angular/core';
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
  passwordSaving = false;

  constructor(private userService: UserService) {}

  ngOnInit(): void {}

  saveChange(): void {
    this.passwordSaving = true;
    this.userService
      .updatePassword(this.old_password, this.new_password)
      .subscribe(
        (res) => {
          this.passwordSaving = false;
          this.old_password = '';
          this.new_password = '';
          this.confirm_password = '';
        },
        (err) => {
          this.passwordSaving = false;
        }
      );
  }
}
