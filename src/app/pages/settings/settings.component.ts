import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PageMenuItem } from 'src/app/utils/data.types';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {
  menuItems: PageMenuItem[] = [
    { id: 'notifications', icon: 'i-notification', label: 'Notifications' },
    { id: 'sms-limits', icon: 'i-sms-limits', label: 'SMS' },
    { id: 'affiliate', icon: 'i-affiliate', label: 'Affiliate' },
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
    { id: 'deals-setting', icon: 'i-deals', label: 'Deals' },
    { id: 'integration', icon: 'i-integration', label: 'Integration' },
    { id: 'social', icon: 'i-social', label: 'Social Profile' }
  ];
  defaultPage = 'notifications';
  currentPage: string;
  currentPageItem: PageMenuItem[];

  routeChangeSubscription: Subscription;

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.routeChangeSubscription = this.route.params.subscribe((params) => {
      this.currentPage = params['page'] || this.defaultPage;
      this.currentPageItem = this.menuItems.filter(
        (item) => item.id == this.currentPage
      );
    });
  }

  ngOnDestroy(): void {
    this.routeChangeSubscription && this.routeChangeSubscription.unsubscribe();
  }

  changeMenu(menu: PageMenuItem): void {
    // this.currentPage = menu.id;
    // this.currentPageItem = this.menuItems.filter(
    //   (item) => item.id == this.currentPage
    // );
    this.router.navigate([`settings/${menu.id}`]);
  }
}
