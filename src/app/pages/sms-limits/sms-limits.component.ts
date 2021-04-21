import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { PlanSelectComponent } from 'src/app/components/plan-select/plan-select.component';
import { PurchaseMessageComponent } from '../../components/purchase-message/purchase-message.component';
import { AddPhoneComponent } from '../../components/add-phone/add-phone.component';

@Component({
  selector: 'app-sms-limits',
  templateUrl: './sms-limits.component.html',
  styleUrls: ['./sms-limits.component.scss']
})
export class SmsLimitsComponent implements OnInit {
  user: User = new User();
  smsType = '';
  smsPercent = 0;
  subTitle = '';
  totalSms = 200;
  leftSms = 150;
  profileSubscription: Subscription;

  constructor(private userService: UserService, private dialog: MatDialog) {
    this.profileSubscription && this.profileSubscription.unsubscribe();
    this.profileSubscription = this.userService.profile$.subscribe(
      (profile) => {
        if (profile) {
          console.log('###', profile);
          this.user = profile;
          if (this.user.proxy_number != '') {
            this.smsType = 'signal';
          } else if (this.user.twilio_number != '') {
            this.smsType = 'twilio';
          } else {
            this.smsType = 'no';
          }
        }
      }
    );
  }

  ngOnInit(): void {
    this.smsPercent = (this.leftSms / this.totalSms) * 100;
  }

  changeType(type: string): void {
    this.smsType = type;
  }

  buyMore(): void {
    this.dialog.open(PlanSelectComponent, {
      position: { top: '100px' },
      width: '100vw',
      maxWidth: '650px',
      disableClose: true
    });
  }

  purchase(): void {
    this.dialog.open(PurchaseMessageComponent, {
      position: { top: '100px' },
      width: '100vw',
      maxWidth: '650px',
      disableClose: true
    });
  }

  addPhone(): void {
    this.dialog
      .open(AddPhoneComponent, {
        position: { top: '100px' },
        width: '100vw',
        maxWidth: '650px',
        disableClose: true
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          switch (this.smsType) {
            case 'signal':
              this.user.proxy_number = res;
              break;
            case 'twilio':
              this.user.twilio_number = res;
              break;
            case 'no':
              this.user.twilio_number = res;
              break;
          }
        }
      });
  }

  changePhone(): void {
    this.dialog
      .open(AddPhoneComponent, {
        position: { top: '100px' },
        width: '100vw',
        maxWidth: '650px',
        disableClose: true
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          switch (this.smsType) {
            case 'signal':
              this.user.proxy_number = res;
              break;
            case 'twilio':
              this.user.twilio_number = res;
              break;
          }
        }
      });
  }

  deletePhone(): void {}
}
