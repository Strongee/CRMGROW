import { Component, OnInit, NgZone, ViewChild } from '@angular/core';
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

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  // Constant Variables
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
    picture_profile: '',
    time_zone_info: ''
  };
  password_type = false;
  confirm_password = '';
  payment = {
    name: '',
    number: '',
    cvc: '',
    exp_year: '',
    exp_month: '',
    last4: ''
  };
  cardNumberLen = 16;
  termsChecked = false;

  existing = false;
  checkingUser = false;
  checkUserSubscription: Subscription;

  checkingPhone = false;
  phoneExisting = false;
  checkPhoneSubscription: Subscription;

  socialLoading = '';
  isSocialUser = false;
  fullNameRequire = false;

  creditCardInput = {
    creditCard: true,
    onCreditCardTypeChanged: (type) => {
      switch (type) {
        case 'amex':
          this.cardNumberLen = 15;
          break;
        case 'visa':
        case 'mastercard':
        case 'jcb':
        case 'discover':
          this.cardNumberLen = 16;
          break;
        case 'diners':
          this.cardNumberLen = 14;
          break;
        default:
          this.cardNumberLen = 16;
      }
    }
  };
  credCvcInput = {
    numeral: true,
    numeralThousandsGroupStyle: 'wan'
  };

  @ViewChild('phoneControl') phoneControl: PhoneInputComponent;

  constructor(
    private dialog: MatDialog,
    private helperService: HelperService,
    private toast: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private userService: UserService
  ) {}

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
    if (!this.checkingPhone && this.phoneExisting) {
      return;
    }
    if (this.checkPhoneRequired() || !this.checkPhoneValid()) {
      return;
    }
  }

  changeLast4Code(): void {
    const number = this.payment.number.replace(' ', '');
    this.payment.last4 = number.substr(number.length - 4, 4);
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

  openProfilePhoto(): void {
    this.helperService
      .promptForFiles('image/jpg, image/png, image/jpeg, image/webp, image/bmp')
      .then((files) => {
        const file: File = files[0];
        const type = file.type;
        const validTypes = [
          'image/jpg',
          'image/png',
          'image/jpeg',
          'image/webp',
          'image/bmp'
        ];
        if (validTypes.indexOf(type) === -1) {
          this.toast.warning('Unsupported File Selected.');
          return;
        }
        const imageEditor = this.dialog.open(AvatarEditorComponent, {
          width: '98vw',
          maxWidth: '400px',
          data: {
            fileInput: file
          }
        });
        imageEditor.afterClosed().subscribe((res) => {
          if (res) {
            this.user.picture_profile = res;
          }
        });
      })
      .catch((err) => {
        this.toast.error('File Select', err);
      });
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
