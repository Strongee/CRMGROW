import { Component, Inject, NgZone, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MONTH, YEAR } from 'src/app/constants/variable.constants';
import { UserService } from 'src/app/services/user.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-payment-card',
  templateUrl: './payment-card.component.html',
  styleUrls: ['./payment-card.component.scss']
})
export class PaymentCardComponent implements OnInit {
  saving = false;
  MONTHS = MONTH;
  YEARS = YEAR;
  card = {
    card_name: '',
    number: '',
    cvc: '',
    exp_year: '',
    exp_month: '',
    card_brand: '',
    last4: '',
    plan_id: ''
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

  constructor(
    private dialogRef: MatDialogRef<PaymentCardComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private userService: UserService,
    private ngZone: NgZone,
    private toast: ToastrService
  ) {
    if (this.data && this.data.card) {
      this.card = { ...this.data.card };
    }
  }

  ngOnInit(): void {}

  changeLast4Code(): void {
    const number = this.card.number.replace(' ', '');
    this.card.last4 = number.substr(number.length - 4, 4);
  }

  editPayment(): void {
    this.saving = true;
    (<any>window).Stripe.card.createToken(
      {
        name: this.card.card_name,
        number: this.card.number,
        cvc: this.card.cvc,
        exp_year: this.card.exp_year,
        exp_month: this.card.exp_month
      },
      (status: number, response: any) => {
        if (status === 200) {
          this.ngZone.run(() => {
            this.userService
              .updatePayment({
                token: { ...response, card_name: this.card.card_name },
                plan_id: this.card.plan_id
              })
              .subscribe(
                () => {
                  this.saving = false;
                  this.toast.success(
                    'Your Billing Information is updated successfully.'
                  );
                  this.dialogRef.close(this.card);
                },
                () => {
                  this.saving = false;
                  this.dialogRef.close();
                }
              );
          });
        } else {
          this.ngZone.run(() => {
            this.saving = false;
            this.toast.error(
              'Your card information is not correct. Please try again.'
            );
            this.dialogRef.close();
          });
        }
      }
    );
  }
}
