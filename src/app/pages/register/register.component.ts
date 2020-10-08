import { Component, OnInit } from '@angular/core';
import { TIMEZONE } from 'src/app/constants/variable.constants';
import { CountryISO } from 'ngx-intl-tel-input';
import { MatDialog } from '@angular/material/dialog';
import { AvatarEditorComponent } from 'src/app/components/avatar-editor/avatar-editor.component';

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
    phone: {}
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

  constructor(private dialog: MatDialog) {}

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

  confirmEmail(): void {}

  confirmPhone(): void {}

  openProfilePhoto(): void {
    console.log('OPEN PROFILE VOAO');
    this.dialog.open(AvatarEditorComponent);
  }
}
