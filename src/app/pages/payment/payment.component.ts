import { Component, OnInit } from '@angular/core';
import { MONTH, YEAR } from '../../constants/variable.constants';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit {
  // UI Variables;
  MONTHS = MONTH;
  YEARS = YEAR;
  loading = false;
  // New Card Information
  card = {
    name: '',
    number: '',
    cvc: '',
    exp_year: '',
    exp_month: '',
    card_brand: '',
    last4: ''
  };
  // Current Payment Information
  payment = {
    card_brand: '',
    exp_month: '',
    exp_year: '',
    last4: ''
  };
  // Card Number Length
  cardNumberLen = 16;
  // Card Number Input Setting
  creditCardInput = {
    creditCard: true,
    onCreditCardTypeChanged: (type) => {
      this.card.card_brand = type;
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
  // Card CVC Input Setting
  credCvcInput = {
    numeral: true,
    numeralThousandsGroupStyle: 'wan'
  };

  invoices = [
    {
      number: 'CRMgrow #124577',
      payment_date: '16.06.2020',
      issue_date: '02.06.2020',
      gross: '$ 5000'
    },
    {
      number: 'CRMgrow #163346',
      payment_date: '08.07.2020',
      issue_date: '22.06.2020',
      gross: '$ 6000'
    },
    {
      number: 'CRMgrow 02/06/2020',
      payment_date: '16.06.2020',
      issue_date: '22.06.2020',
      gross: '$ 6000'
    }
  ];

  constructor(private userService: UserService) {
    this.loading = true;
    this.userService.profile$.subscribe((profile) => {
      if (profile.payment) {
        this.userService.getPayment(profile.payment).subscribe(
          (res) => {
            this.loading = false;
            this.payment = res;
            this.card = {
              ...res,
              number: this.payment.last4
            };
          },
          () => {
            this.loading = false;
          }
        );
      } else {
        this.loading = false;
      }
    });
  }

  ngOnInit(): void {}

  changeLast4Code(): void {
    const number = this.card.number.replace(' ', '');
    this.card.last4 = number.substr(number.length - 4, 4);
  }
  createBill(): void {}

  cancelBill(): void {
    this.card.number = this.payment.last4;
    this.card.card_brand = this.payment.card_brand;
    this.card.exp_month = this.card.exp_month;
    this.card.exp_year = this.card.exp_year;
    this.card.cvc = '';
  }
}
