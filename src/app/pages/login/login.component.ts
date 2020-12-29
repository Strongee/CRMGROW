import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';
import {
  AuthService as GoogleAuth,
  GoogleLoginProvider
} from 'angularx-social-login';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UserAgentApplication } from 'msal';

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
  socialLoading = false;
  loading = false;
  loginSubscription: Subscription;

  msalConfig = {
    auth: {
      clientId: environment.ClientId.Outlook,
      redirectUri: environment.RedirectUri.Outlook
    }
  };
  msalInstance = new UserAgentApplication(this.msalConfig);

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private googleAuth: GoogleAuth,
    private router: Router,
    private toastr: ToastrService
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
        this.router.navigate([this.returnUrl]);
      }
    });
  }

  signInGoogle(): void {
    this.socialLoading = true;
    this.googleAuth
      .signIn(GoogleLoginProvider.PROVIDER_ID)
      .then((userData) => {
        const user = {
          social_id: userData.id
        };
        this.signWithSocial(user);
      })
      .catch((err) => {
        this.socialLoading = false;
        this.toastr.error(
          `Google authentication is failed with error (${
            err.message || err.error || err || ''
          })`,
          'Google SignIn',
          {
            timeOut: 3000
          }
        );
      });
  }

  signInOutlook(): void {
    const loginRequest = {
      scopes: ['user.read']
    };

    this.socialLoading = true;
    this.msalInstance
      .loginPopup(loginRequest)
      .then((userData) => {
        const user = {
          social_id: userData.account.accountIdentifier
        };
        this.signWithSocial(user);
      })
      .catch((err) => {
        this.socialLoading = false;
        this.toastr.error(
          `Outlook authentication is failed with error (${
            err.message || err.error || ''
          })`,
          'Outlook Signin',
          {
            timeOut: 3000
          }
        );
      });
  }

  signWithSocial(user): void {
    this.loading = true;
    this.loginSubscription = this.userService.socialSignIn(user).subscribe(
      (res) => {
        this.socialLoading = false;
        this.userService.setToken(res['data']['token']);
        this.userService.setProfile(res['data']['user']);
        this.router.navigate([this.returnUrl]);
      },
      (err) => {
        this.socialLoading = false;
        this.loading = false;
      }
    );
  }
}
