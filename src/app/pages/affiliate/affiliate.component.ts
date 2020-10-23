import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-affiliate',
  templateUrl: './affiliate.component.html',
  styleUrls: ['./affiliate.component.scss']
})
export class AffiliateComponent implements OnInit {
  loadingMain = false;
  creating = false;
  updating = false;
  loadingUsers = false;
  affiliate: any = {
    share_link: 'https://www.crmgrow.com/?via=garrett-steve',
    paypal_email: 'gsteve@gmail.com',
    visitors: 16,
    leads: 0,
    conversions: 0
  };
  users: any[] = [
    {
      customer: {
        name: 'Przemyslaw Nowakowski',
        email: 'prezemyslaw.nowakowski@gmail.com',
        status: 'Active'
      }
    },
    {
      customer: {
        name: 'Przemyslaw Nowakowski',
        email: 'prezemyslaw.nowakowski@gmail.com',
        status: 'Pending'
      }
    },
    {
      customer: {
        name: 'Przemyslaw Nowakowski',
        email: 'prezemyslaw.nowakowski@gmail.com',
        status: 'Active'
      }
    },
    {
      customer: {
        name: 'Przemyslaw Nowakowski',
        email: 'prezemyslaw.nowakowski@gmail.com',
        status: 'Pending'
      }
    },
    {
      customer: {
        name: 'Przemyslaw Nowakowski',
        email: 'prezemyslaw.nowakowski@gmail.com',
        status: 'Active'
      }
    }
  ];
  constructor() {}

  ngOnInit(): void {}
  openShare(): void {}
  copyLink(): void {}
  update(): void {}
}
