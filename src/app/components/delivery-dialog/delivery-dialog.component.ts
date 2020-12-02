import { Component, OnInit } from '@angular/core';
import { TabItem } from 'src/app/utils/data.types';

@Component({
  selector: 'app-delivery-dialog',
  templateUrl: './delivery-dialog.component.html',
  styleUrls: ['./delivery-dialog.component.scss']
})
export class DeliveryDialogComponent implements OnInit {
  tabs: TabItem[] = [
    { icon: '', label: 'All', id: 'all' },
    { icon: '', label: 'Delivered', id: 'deliver' },
    { icon: '', label: 'Failed', id: 'fail' }
  ];
  selectedTab: TabItem = this.tabs[0];
  sentSms = [
    {
      name: 'John Doe',
      cellPhone: '+16309844707',
      status: 'delivered',
      created_at: '11.25 at 7:37 PM'
    },
    {
      name: 'John Doe',
      cellPhone: '+16309844707',
      status: 'failed',
      created_at: '11.25 at 7:37 PM'
    },
    {
      name: 'John Doe',
      cellPhone: '+16309844707',
      status: 'delivered',
      created_at: '11.25 at 7:37 PM'
    },
    {
      name: 'John Doe',
      cellPhone: '+16309844707',
      status: 'failed',
      created_at: '11.25 at 7:37 PM'
    },
    {
      name: 'John Doe',
      cellPhone: '+16309844707',
      status: 'delivered',
      created_at: '11.25 at 7:37 PM'
    },
    {
      name: 'John Doe',
      cellPhone: '+16309844707',
      status: 'delivered',
      created_at: '11.25 at 7:37 PM'
    },
    {
      name: 'John Doe',
      cellPhone: '+16309844707',
      status: 'failed',
      created_at: '11.25 at 7:37 PM'
    },
    {
      name: 'John Doe',
      cellPhone: '+16309844707',
      status: 'failed',
      created_at: '11.25 at 7:37 PM'
    },
    {
      name: 'John Doe',
      cellPhone: '+16309844707',
      status: 'failed',
      created_at: '11.25 at 7:37 PM'
    },
    {
      name: 'John Doe',
      cellPhone: '+16309844707',
      status: 'delivered',
      created_at: '11.25 at 7:37 PM'
    }
  ];
  deliveredSms = [];
  failedSms = [];
  constructor() {
    this.sentSms.forEach((sms) => {
      if (sms.status == 'delivered') {
        this.deliveredSms.push(sms);
      } else {
        this.failedSms.push(sms);
      }
    });
  }

  ngOnInit(): void {}

  changeTab(tab: TabItem): void {
    this.selectedTab = tab;
  }

  clear(): void {
    this.sentSms = [];
    this.deliveredSms = [];
    this.failedSms = [];
  }
}
