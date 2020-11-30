import { Component, OnInit, NgZone } from '@angular/core';
import { TIMEZONE } from 'src/app/constants/variable.constants';
import { CountryISO } from 'ngx-intl-tel-input';
import { MatDialog } from '@angular/material/dialog';
import { HelperService } from '../../services/helper.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import {UserService} from "../../services/user.service";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  step = 2;
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
  confirm_password = '';
  payment = {
    name: '',
    number: '',
    cvc: '',
    exp_year: '',
    exp_month: ''
  };
  cardNumberLen = 16;
  termsChecked = false;

  // Constant Variables
  timezones = TIMEZONE;
  countries: CountryISO[] = [
    CountryISO.UnitedStates,
    CountryISO.UnitedKingdom,
    CountryISO.Canada,
    CountryISO.SouthAfrica
  ];
  CountryISO = CountryISO;
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

  existing = false;
  checkingUser = false;
  checkUserSubscription: Subscription;

  checkingPhone = false;
  phoneExisting = false;
  checkPhoneSubscription: Subscription;

  constructor(
    private dialog: MatDialog,
    private helperService: HelperService,
    private toast: ToastrService,
    private userService: UserService
  ) {}

  ngOnInit(): void {}

  fillBasic(): void {
    this.step = 2;
  }

  fillProfile(): void {
    this.step = 3;
  }

  fillBilling(): void {
    // Billing Information confirm and Register
  }

  confirmEmail(): void {
    this.existing = false;
    if (this.user.email) {
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

  confirmPhone(): void {
    this.phoneExisting = false;
    const cell_phone =
      (this.user.phone && this.user.phone['internationalNumber']) ||
      this.user.phone;
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
        this.helperService
          .loadBase64(file)
          .then((thumbnail) => {
            this.user.picture_profile = thumbnail;
          })
          .catch(() => {
            this.toast.warning('Cannot load the image file.');
          });
      })
      .catch((err) => {
        this.toast.error('File Select', err);
      });
  }
}
