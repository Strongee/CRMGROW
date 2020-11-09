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
  user: User = new User();
  card = {
    name: '',
    number: '',
    cvc: '',
    exp_year: '',
    exp_month: ''
  };
  payment = {
    card_brand: '',
    exp_month: '',
    exp_year: '',
    last4: ''
  };
  cardNumberLen = 16;
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

  paymentSubmitted = false;
  months = MONTH;
  years = YEAR;
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
    this.userService.profile$.subscribe((profile) => {
      this.user = profile;
      if (this.user.payment) {
        this.userService.getPayment(this.user.payment).subscribe(
          (res) => {
            if (res['status']) {
              this.payment = res['data'];
            }
          },
          (err) => {}
        );
      }
    });
  }

  ngOnInit(): void {}

  createBill(): void {}
}
