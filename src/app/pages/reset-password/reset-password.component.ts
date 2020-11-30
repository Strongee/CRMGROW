import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  newData = {
    email: '',
    code: '',
    password: ''
  };

  confirm_password = '';

  loading = false;

  submitted = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.newData.email = this.route.snapshot.queryParams['email'];
  }

  resetPassword(): void {
    this.loading = true;
    const code = this.newData.code.trim();
    this.userService.resetPassword({ ...this.newData, code }).subscribe(
      (res) => {
        this.loading = false;
        this.router.navigate(['/login']);
      },
      (err) => {
        this.loading = false;
      }
    );
  }
}
