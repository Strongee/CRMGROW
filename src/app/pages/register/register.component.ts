import {
  Component,
  OnInit,
  NgZone,
  ViewChild,
  ElementRef
} from '@angular/core';
import {
  PACKAGE_LEVEL,
  PHONE_COUNTRIES,
  STRIPE_KEY,
  TIMEZONE
} from 'src/app/constants/variable.constants';
import { CountryISO } from 'ngx-intl-tel-input';
import { MatDialog } from '@angular/material/dialog';
import { HelperService } from '../../services/helper.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { AvatarEditorComponent } from '../../components/avatar-editor/avatar-editor.component';
import { UserService } from '../../services/user.service';
import { validateEmail } from 'src/app/utils/functions';
import { Strings } from '../../constants/strings.constant';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { PhoneInputComponent } from 'src/app/components/phone-input/phone-input.component';
import { StripeScriptTag, StripeCard } from 'stripe-angular';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  // Constant Variables
  defaultTimeZone = true;
  timezones = TIMEZONE;
  countries: CountryISO[] = PHONE_COUNTRIES;
  CountryISO = CountryISO;

  step = 1;

  package_level = PACKAGE_LEVEL.PRO.package;
  is_trial = true;

  user = {
    user_name: '',
    email: '',
    password: '',
    cell_phone: '',
    phone: {},
    time_zone_info: '',
    level: '',
    is_trial: true
  };

  password_type = false;
  termsChecked = false;

  submitted = false;
  saving = false;
  existing = false;
  checkingUser = false;
  checkUserSubscription: Subscription;

  checkingPhone = false;
  phoneExisting = false;
  checkPhoneSubscription: Subscription;

  socialLoading = '';
  isSocialUser = false;
  fullNameRequire = false;

  token = '';
  currentUser = null;

  stripeOptions = {
    classes: {
      base: 'stripe-card form-control',
      complete: '',
      empty: '',
      focus: '',
      invalid: '',
      webkitAutofill: ''
    },
    hidePostalCode: true,
    hideIcon: false,
    iconStyle: 'solid',
    style: {},
    value: {
      postalCode: ''
    },
    disabled: false
  };
  invalidError = 'require';

  @ViewChild('phoneControl') phoneControl: PhoneInputComponent;
  @ViewChild('stripeCard') card: StripeCard;

  constructor(
    private dialog: MatDialog,
    private helperService: HelperService,
    private toast: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private userService: UserService,
    private stripeScriptTag: StripeScriptTag
  ) {
    if (!this.stripeScriptTag.StripeInstance) {
      this.stripeScriptTag.setPublishableKey(STRIPE_KEY);
    }
  }

  ngOnInit(): void {
    this.socialHandle();
    this.route.queryParams.subscribe((params) => {
      if (params) {
        if (params.email) {
          this.user.email = params.email;
          this.step = 2;
        }
        if (params.level) {
          this.package_level = params.level;
        }
        if (params.is_trial === 'false') {
          this.is_trial = false;
        }
      }
    });
  }

  socialHandle(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['code']) {
        const socialType = this.route.snapshot.params['social'];
        switch (socialType) {
          case 'outlook':
            this.socialLoading = socialType;
            this.userService.requestOutlookProfile(params['code']).subscribe(
              (res) => {
                this.socialLoading = '';
                this.location.replaceState('/signup');
                this.user = {
                  ...this.user,
                  ...res['data']
                };
                this.isSocialUser = true;
                if (!this.user.user_name) {
                  this.fullNameRequire = true;
                }
                this.step = 2;
              },
              (err) => {
                this.socialLoading = '';
                this.location.replaceState('/signup');
                this.toast.error(
                  `Error: ${
                    err.message || err.error || err.code || err || 'Unknown'
                  }`,
                  Strings.SOCIAL_SIGNUP_ERROR,
                  { timeOut: 3000 }
                );
              }
            );
            break;
          case 'gmail':
            this.socialLoading = socialType;
            this.userService.requestGoogleProfile(params['code']).subscribe(
              (res) => {
                this.socialLoading = '';
                this.location.replaceState('/signup');
                this.user = {
                  ...this.user,
                  ...res['data']
                };
                console.log(
                  'gmail auth ==========>',
                  this.isSocialUser,
                  this.user
                );
                this.isSocialUser = true;
                if (!this.user.user_name) {
                  this.fullNameRequire = true;
                }
                this.step = 2;
              },
              (err) => {
                this.socialLoading = '';
                this.location.replaceState('/signup');
                this.toast.error(
                  `Error: ${
                    err.message || err.error || err.code || err || 'Unknown'
                  }`,
                  Strings.SOCIAL_SIGNUP_ERROR,
                  { timeOut: 3000 }
                );
              }
            );
            break;
          default:
            this.step = 1;
        }
      }
    });
  }

  gotoBasic(): void {
    this.step = 2;
  }

  fillBasic(): any {
    if (!this.checkingUser && this.existing) {
      return;
    }

    this.step = 3;
  }

  fillProfile(): void {
    if (this.user.phone == '' || this.user.time_zone_info == '') {
      return;
    }
    if (!this.checkingPhone && this.phoneExisting) {
      return;
    }
    if (this.checkPhoneRequired() || !this.checkPhoneValid()) {
      return;
    }
    if (this.invalidError != '') {
      return;
    } else {
      this.card.createToken({}).then((res) => {
        if (res) {
          this.user['token'] = {
            ...res,
            card_name: res.card.brand
          };
          this.saving = true;
          this.signUp();
        } else {
          this.invalidError = 'require';
          return;
        }
      });
    }
  }

  cardInvalid(evt: any): void {
    if (evt && evt?.type === 'validation_error') {
      this.invalidError = 'invalid';
    } else {
      this.invalidError = '';
    }
  }

  cardComplete(evt: any): void {
    if (evt) {
      this.invalidError = '';
    } else {
      this.invalidError = 'invalid';
    }
  }

  signUp(): void {
    this.user = {
      ...this.user,
      level: this.package_level,
      is_trial: this.is_trial
    };
    if (this.user['picture_profile']) {
      this.user['email_signature'] =
        '<div>' +
        this.user.user_name +
        '<br></div><div>' +
        'eXp Realty, LLC' +
        '<br></div><div>' +
        this.user.email +
        '<br></div><div>' +
        this.user.cell_phone +
        '<br></div>' +
        "<div><img src='" +
        this.user['picture_profile'] +
        '-resize' +
        "' alt='' " +
        "style='width: 100px; height: 100px; border-radius: 50%; object-fit: cover;' /></div>";
    } else {
      this.user['email_signature'] =
        '<div>' +
        this.user.user_name +
        '<br></div><div>' +
        'eXp Realty, LLC' +
        '<br></div><div>' +
        this.user.email +
        '<br></div><div>' +
        this.user.cell_phone +
        '<br></div>' +
        '<div></div>';
    }
    if (window['Rewardful'] && window['Rewardful'].affiliate) {
      this.user['parent_affiliate'] = window['Rewardful'].affiliate;
    }
    if (window['Rewardful'] && window['Rewardful'].referral) {
      this.user['referral'] = window['Rewardful'].referral;
    }
    if (this.isSocialUser) {
      this.userService.socialSignUp(this.user).subscribe((res) => {
        if (res && res.status) {
          this.token = res['data']['token'];
          this.currentUser = res['data']['user'];
          if (this.token) {
            this.saving = false;
            this.toast.success('Social Sign Up has been successfully!');
            this.userService.setToken(this.token);
            this.userService.setUser(this.currentUser);
            this.router.navigate(['/home']);
            window.location.reload();
          } else {
            this.saving = false;
          }
        } else {
          this.toast.error(res.error);
          this.saving = false;
        }
      });
    } else {
      this.userService.signup(this.user).subscribe((res) => {
        this.token = res['data']['token'];
        this.currentUser = res['data']['user'];
        if (this.token) {
          this.saving = false;
          this.toast.success('Sign Up has been successfully!');
          this.userService.setToken(this.token);
          this.userService.setUser(this.currentUser);
          this.router.navigate(['/home']);
          window.location.reload();
        } else {
          this.saving = false;
        }
      });
    }
  }

  confirmEmail(): void {
    this.existing = false;
    if (this.user.email && validateEmail(this.user.email)) {
      this.checkingUser = true;
      this.checkUserSubscription && this.checkUserSubscription.unsubscribe();
      this.checkUserSubscription = this.userService
        .checkEmail(this.user.email)
        .subscribe(
          (res) => {
            this.checkingUser = false;
            if (res['status']) {
              this.existing = false;
            } else {
              this.existing = true;
            }
          },
          (err) => {
            this.checkingUser = false;
          }
        );
    }
  }

  confirmPhone(event): void {
    this.phoneExisting = false;
    const cell_phone = (event && event['internationalNumber']) || event;
    if (cell_phone) {
      this.checkingPhone = true;
      this.checkPhoneSubscription && this.checkPhoneSubscription.unsubscribe();
      this.checkPhoneSubscription = this.userService
        .checkPhone(cell_phone)
        .subscribe(
          (res) => {
            this.checkingPhone = false;
            if (res['status']) {
              this.phoneExisting = false;
              this.user.cell_phone = cell_phone;
            } else {
              this.phoneExisting = true;
            }
          },
          (err) => {
            this.checkingPhone = false;
          }
        );
    }
  }

  connectService(type): void {
    this.socialLoading = type;
    this.userService.requestOAuthUrl(type).subscribe(
      (res) => {
        this.socialLoading = '';
        location.href = res['data'];
      },
      (err) => {
        this.socialLoading = '';
        this.toast.error(
          `Error: ${err.message || err.error || err.code || err || 'Unknown'}`,
          Strings.REQUEST_OAUTH_URL,
          { timeOut: 3000 }
        );
      }
    );
  }

  checkPhoneRequired(): boolean {
    if (!this.user.phone || !this.phoneControl) {
      return true;
    }
    if (!Object.keys(this.user.phone)) {
      return true;
    }
    return false;
  }
  checkPhoneValid(): boolean {
    if (!this.user.phone || !this.phoneControl) {
      return true;
    }
    if (Object.keys(this.user.phone).length && !this.phoneControl.valid) {
      return false;
    }
    return true;
  }
}
