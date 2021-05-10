import { Component, OnDestroy, OnInit } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { PaymentCardComponent } from 'src/app/components/payment-card/payment-card.component';
import { PACKAGE_LEVEL } from '../../constants/variable.constants';
import {getUserLevel} from "../../utils/functions";

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

  invoices = [];
  saving = false;

  profileSubscription: Subscription;
  package = PACKAGE_LEVEL.pro;
  packageLevel = '';

  constructor(private userService: UserService, private dialog: MatDialog) {
    this.loading = true;
    this.profileSubscription && this.profileSubscription.unsubscribe();
    this.profileSubscription = this.userService.profile$.subscribe(
      (profile) => {
        if (profile.payment) {
          this.packageLevel = profile.package_level;
          this.package = PACKAGE_LEVEL[getUserLevel(this.packageLevel)];
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

  getUserLevel(): string {
    return getUserLevel(this.packageLevel);
  }

  getInvoice(): void {
    this.userService.getInvoice().subscribe((res) => {
      if (res && res['status']) {
        this.invoices = res['data'];
      }
    });
  }

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
