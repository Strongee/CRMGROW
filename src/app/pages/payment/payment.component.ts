import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { PaymentCardComponent } from 'src/app/components/payment-card/payment-card.component';
import {CANCEL_ACCOUNT_REASON, PACKAGE_LEVEL} from '../../constants/variable.constants';
import { getUserLevel } from '../../utils/functions';

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
    plan_id: '',
    card_id: '',
    token: ''
  };

  @Input('selectedStep') selectedStep = 1;
  invoices = [];
  saving = false;

  profileSubscription: Subscription;
  currentPackage = PACKAGE_LEVEL.pro;
  selectedPackage = PACKAGE_LEVEL.pro;
  litePackage = PACKAGE_LEVEL.lite;
  proPackage = PACKAGE_LEVEL.pro;
  elitePackage = PACKAGE_LEVEL.elite;
  customPackage = PACKAGE_LEVEL.custom;

  packageLevel = '';
  step = 1;
  isShowAll = false;

  previewCardNumber = '';
  reasonButtons = CANCEL_ACCOUNT_REASON;
  selectedReason = this.reasonButtons[0];
  reasonFeedback = '';

  constructor(private userService: UserService, private dialog: MatDialog) {
    this.loading = true;
    // this.step = this.selectedStep;
    this.profileSubscription && this.profileSubscription.unsubscribe();
    this.profileSubscription = this.userService.profile$.subscribe(
      (profile) => {
        if (profile.payment) {
          this.packageLevel = profile.package_level;
          this.currentPackage = PACKAGE_LEVEL[getUserLevel(this.packageLevel)];
          this.selectedPackage = PACKAGE_LEVEL[getUserLevel(this.packageLevel)];
          this.userService.getPayment(profile.payment).subscribe(
            (res) => {
              this.card = {
                ...res,
                number: res.last4
              };
              this.previewCardNumber = '•••• •••• •••• ' + this.card.number;
              this.getInvoice();
            },
            () => {
              this.loading = false;
            }
          );
        }
      }
    );
  }

  ngOnInit(): void {
    this.step = this.selectedStep;
  }

  ngOnDestroy(): void {
    this.profileSubscription && this.profileSubscription.unsubscribe();
  }

  getUserLevel(): string {
    return getUserLevel(this.packageLevel);
  }

  getInvoice(): void {
    this.userService.getInvoice().subscribe(
      (res) => {
        this.loading = false;
        if (res && res['status']) {
          this.invoices = res['data'];
        }
      },
      () => {
        this.loading = false;
      }
    );
  }

  editCard(): void {
    this.dialog
      .open(PaymentCardComponent, {
        position: { top: '100px' },
        width: '100vw',
        maxWidth: '550px',
        data: {
          card: this.card
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res && res.data) {
          const card = res.data.card;
          this.card = {
            ...this.card,
            card_brand: card.brand,
            card_id: card.id,
            exp_month: card.exp_month,
            exp_year: card.exp_year,
            last4: card.last4,
            token: res.data.id,
            number: card.last4
          };

          this.previewCardNumber = '•••• •••• •••• ' + this.card.number;
        }
      });
  }

  changePlan(): void {
    this.step = 2;
  }

  onBack(): void {
    this.step -= 1;
  }

  onBackFirst(): void {
    this.step = 1;
  }

  cancelAccount(): void {
    this.step = 4;
  }

  selectPlan(level): void {
    for (const item in PACKAGE_LEVEL) {
      if (PACKAGE_LEVEL[item].package === level) {
        this.currentPackage = PACKAGE_LEVEL[item];
      }
    }
    this.step = 3;
  }

  clickPackage(level): void {
    this.selectedPackage = level;
  }

  planButtonLabel(level): string {
    if (level === this.currentPackage.package) {
      return 'Your Plan';
    } else {
      if (level === PACKAGE_LEVEL.lite.package) {
        if (this.currentPackage.package === PACKAGE_LEVEL.custom.package) {
          return 'Get Lite';
        } else {
          return 'Downgrade';
        }
      } else if (level === PACKAGE_LEVEL.pro.package) {
        if (
          this.currentPackage.package === PACKAGE_LEVEL.lite.package ||
          this.currentPackage.package === PACKAGE_LEVEL.custom.package
        ) {
          return 'Get Pro';
        } else {
          return 'Downgrade';
        }
      } else if (level === PACKAGE_LEVEL.elite.package) {
        return 'Get Elite';
      } else if (level === PACKAGE_LEVEL.custom.package) {
        return 'Contact us';
      }
    }
  }

  showAllFeatures(): void {
    this.isShowAll = !this.isShowAll;
  }

  selectReason(reason): void {
    this.selectedReason = reason;
    this.step = 5;
  }
}
