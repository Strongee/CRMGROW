import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
import { ContactService } from 'src/app/services/contact.service';
import { UpgradePlanErrorComponent } from '../../components/upgrade-plan-error/upgrade-plan-error.component';
import { MatDialog } from '@angular/material/dialog';

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

  @ViewChild('serverFrame') serverWindow: ElementRef;

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private googleAuth: GoogleAuth,
    private router: Router,
    private toastr: ToastrService,
    private dialog: MatDialog
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
        this.goHome(res['data']);
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
      scopes: ['user.read'],
      prompt: 'select_account'
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
        this.goHome(res['data']);
      },
      (err) => {
        this.socialLoading = false;
        this.loading = false;
      }
    );
  }

  goHome(data: any): void {
    if (
      data.user &&
      data.user.subscription &&
      data.user.subscription.is_suspended
    ) {
      this.returnUrl = '/profile/billing';
      this.router.navigate([this.returnUrl]);
      this.dialog.open(UpgradePlanErrorComponent, {
        position: { top: '100px' },
        width: '100vw',
        maxWidth: '450px',
        disableClose: true
      });
    }
    this.userService.setToken(data['token']);
    this.userService.setProfile(data['user']);
    this.router.navigate([this.returnUrl]);
  }
}
