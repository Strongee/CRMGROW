import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PageMenuItem } from 'src/app/utils/data.types';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  menuItems: PageMenuItem[] = [
    { id: 'notifications', icon: 'i-notification', label: 'Notifications' },
    { id: 'assistant', icon: 'i-assistant', label: 'Assistant' },
    { id: 'lead-capture', icon: 'i-lead-capture', label: 'Lead Capture' },
    { id: 'tag-manager', icon: 'i-tag-manager', label: 'Tag Manager' },
    // {
    //   id: 'status-automation',
    //   icon: 'i-status',
    //   label: 'Status Automation'
    // },
    {
      id: 'auto-resend-video',
      icon: 'i-auto-video',
      label: 'Auto Resend Video'
    },
    { id: 'auto-follow-up', icon: 'i-auto-follow', label: 'Auto Follow Up' },
    { id: 'sms-limits', icon: 'i-sms-limits', label: 'SMS Limits' }
  ];
  defaultPage = 'notifications';
  currentPage: string;
  currentPageItem: PageMenuItem[];

  constructor(private location: Location, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.currentPage = this.route.snapshot.params['page'] || this.defaultPage;
    this.currentPageItem = this.menuItems.filter(
      (item) => item.id == this.currentPage
    );
  }
  changeMenu(menu: PageMenuItem): void {
    this.currentPage = menu.id;
    this.currentPageItem = this.menuItems.filter(
      (item) => item.id == this.currentPage
    );
    this.location.replaceState(`settings/${menu.id}`);
  }
}
