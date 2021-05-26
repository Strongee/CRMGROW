import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { PageMenuItem } from 'src/app/utils/data.types';
import { UserService } from '../../services/user.service';

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

  queryParamSubscription: Subscription;
  routeChangeSubscription: Subscription;
  profileSubscription: Subscription;
  user: User = new User();
  disableMenuItems = [];
  isPackageAssistant = true;
  isPackageCapture = true;
  isPackageText = true;

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private userService: UserService,
    private toast: ToastrService,
    private router: Router
  ) {
    this.profileSubscription && this.profileSubscription.unsubscribe();
    this.profileSubscription = this.userService.profile$.subscribe((res) => {
      this.isPackageAssistant = res.assistant_info?.is_enabled;
      this.isPackageCapture = res.capture_enabled;
      this.isPackageText = res.text_info?.is_enabled;
      this.disableMenuItems = [];
      if (!this.isPackageAssistant) {
        this.disableMenuItems.push({
          id: 'assistant',
          icon: 'i-assistant',
          label: 'Assistant'
        });
      }
      if (!this.isPackageCapture) {
        this.disableMenuItems.push({
          id: 'lead-capture',
          icon: 'i-lead-capture',
          label: 'Lead Capture'
        });
      }
      if (!this.isPackageText) {
        this.disableMenuItems.push({
          id: 'sms-limits',
          icon: 'i-sms-limits',
          label: 'SMS'
        });
      }
    });
  }

  ngOnInit(): void {
    this.queryParamSubscription && this.queryParamSubscription.unsubscribe();
    this.queryParamSubscription = this.route.queryParams.subscribe((params) => {
      if (params['code']) {
        const page = this.route.snapshot.routeConfig.path;
        let action = '';
        if (page.indexOf('profile/outlook') !== -1) {
          action = 'outlook';
        } else if (page.indexOf('profile/gmail') !== -1) {
          action = 'gmail';
        }
        if (action == 'outlook') {
          this.currentPage = 'integration';
          this.userService.authorizeOutlook(params['code']).subscribe(
            (res) => {
              this.user.connected_email_type = 'outlook';
              this.user.primary_connected = true;
              this.user.connected_email = res['data'];
              this.userService.updateProfileImpl(this.user);
              this.toast.success(
                'Your Outlook mail is connected successfully.'
              );
              this.location.replaceState('/settings/integration');
            },
            (err) => {
              this.location.replaceState('/settings/integration');
            }
          );
        }
        if (action == 'gmail') {
          this.currentPage = 'integration';
          this.userService.authorizeGoogle(params['code']).subscribe(
            (res) => {
              this.user.connected_email_type = 'gmail';
              this.user.primary_connected = true;
              this.user.connected_email = res['data'];
              this.userService.updateProfileImpl(this.user);
              this.toast.success('Your Gmail is connected successfully.');
              this.location.replaceState('/settings/integration');
            },
            (err) => {
              this.location.replaceState('/settings/integration');
            }
          );
        }
      }
    });

    this.routeChangeSubscription = this.route.params.subscribe((params) => {
      console.log('current Page', params, this.route.snapshot, this.router);
      if (
        !params['page'] &&
        this.route.snapshot.routeConfig.path.indexOf('profile') !== -1
      ) {
        this.currentPage = 'integration';
      } else {
        this.currentPage = params['page'] || this.defaultPage;
      }
      this.currentPageItem = this.menuItems.filter(
        (item) => item.id == this.currentPage
      );
    });
  }

  ngOnDestroy(): void {
    this.routeChangeSubscription && this.routeChangeSubscription.unsubscribe();
  }

  isDisableItem(menuItem): boolean {
    if (menuItem && menuItem.id) {
      const index = this.disableMenuItems.findIndex(
        (item) => item.id === menuItem.id
      );
      if (index >= 0) {
        return true;
      }
    }
    return false;
  }

  changeMenu(menu: PageMenuItem): void {
    // this.currentPage = menu.id;
    // this.currentPageItem = this.menuItems.filter(
    //   (item) => item.id == this.currentPage
    // );
    this.router.navigate([`settings/${menu.id}`]);
  }
}
