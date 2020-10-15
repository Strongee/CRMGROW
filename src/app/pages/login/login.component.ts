import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  user = {
    email: '',
    password: ''
  };
  submitting = false;
  returnUrl = '';

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
  }

  login(): void {
    // Login
    this.submitting = true;
    this.userService.login(this.user).subscribe((res) => {
      this.submitting = false;
      if (!res) {
        return;
      }
      if (res['code']) {
        // SOCIAL USER LOGIN ACTION
      } else {
        // Save the user token and profile information
        this.userService.setToken(res['data']['token']);
        this.userService.setProfile(res['data']['user']);
        this.router.navigate([this.returnUrl]);
      }
    });
  }
}
