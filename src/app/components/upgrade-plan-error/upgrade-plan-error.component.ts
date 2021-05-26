import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PaymentCardComponent } from '../payment-card/payment-card.component';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-upgrade-plan-error',
  templateUrl: './upgrade-plan-error.component.html',
  styleUrls: ['./upgrade-plan-error.component.scss']
})
export class UpgradePlanErrorComponent implements OnInit {
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
  constructor(
    public dialogRef: MatDialogRef<UpgradePlanErrorComponent>,
    private router: Router,
    private dialog: MatDialog,
    private userService: UserService
  ) {
    this.userService.payment$.subscribe((res) => {
      if (res) {
        this.card = {
          ...res,
          number: res.last4
        };
      }
    });
  }

  ngOnInit(): void {}

  goToBilling(): void {
    // this.router.navigate([`/profile/billing`]);
    this.dialog
      .open(PaymentCardComponent, {
        position: { top: '100px' },
        width: '100vw',
        maxWidth: '550px',
        disableClose: true,
        data: {
          card: this.card
        }
      })
      .afterClosed()
      .subscribe((res) => {
        this.dialogRef.close();
        if (res.data) {
          window.location.reload();
        }
      });
  }
}
