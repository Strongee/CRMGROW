import { Component, OnDestroy, OnInit } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { PaymentCardComponent } from 'src/app/components/payment-card/payment-card.component';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit, OnDestroy {
  // UI Variables;
  loading = false;
  // New Card Information
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
  saving = false;

  profileSubscription: Subscription;

  constructor(private userService: UserService, private dialog: MatDialog) {
    this.loading = true;
    this.profileSubscription && this.profileSubscription.unsubscribe();
    this.profileSubscription = this.userService.profile$.subscribe(
      (profile) => {
        if (profile.payment) {
          this.userService.getPayment(profile.payment).subscribe(
            (res) => {
              this.loading = false;
              this.card = {
                ...res,
                number: res.last4
              };
              this.getInvoice();
            },
            () => {
              this.loading = false;
            }
          );
        } else {
          this.loading = false;
        }
      }
    );
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.profileSubscription && this.profileSubscription.unsubscribe();
  }

  getInvoice(): void {
    this.userService.getInvoice().subscribe((res) => {
      console.log('###', res);
    });
  }

  // cancelBill(): void {
  //   this.card.number = this.payment.last4;
  //   this.card.card_brand = this.payment.card_brand;
  //   this.card.exp_month = this.card.exp_month;
  //   this.card.exp_year = this.card.exp_year;
  //   this.card.cvc = '';
  // }

  editCard(): void {
    this.dialog
      .open(PaymentCardComponent, {
        position: { top: '100px' },
        width: '100vw',
        maxWidth: '450px',
        data: {
          card: this.card
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.card = res;
        }
      });
  }
}
