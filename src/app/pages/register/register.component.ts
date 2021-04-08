import {
  Component,
  OnInit,
  NgZone,
  ViewChild,
  ElementRef
} from '@angular/core';
import {
  PHONE_COUNTRIES,
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
  user = {
    user_name: '',
    email: '',
    password: '',
    learn_more: '',
    cell_phone: '',
    phone: {},
    time_zone_info: ''
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
      this.stripeScriptTag.setPublishableKey(
        'pk_test_Fiq3VFU3LvZBSJpKGtD0paMK0005Q6E2Q2'
      );
    }
  }

  ngOnInit(): void {
    this.socialHandle();
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
    if (
      this.user.learn_more == '' ||
      this.user.phone == '' ||
      this.user.time_zone_info == ''
    ) {
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
    if (evt && evt?.type == 'validation_error') {
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
    if (this.isSocialUser) {
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
