import { Component, OnInit } from '@angular/core';
import { MONTH, YEAR, INVOICES } from '../../constants/variable.constants';
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
  invoices = INVOICES;

  constructor(private userService: UserService) {
    this.userService.profile$.subscribe((profile) => {
      this.user = profile;
      if (this.user.payment) {
        this.userService.getPayment(this.user.payment).subscribe(
          (res) => {
            if (res['status']) {
              this.payment = res['data'];
              console.log('##', this.payment);
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
