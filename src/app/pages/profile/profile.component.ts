import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PageMenuItem } from 'src/app/utils/data.types';
import { UserService } from 'src/app/services/user.service';
import { ToastrService } from 'ngx-toastr';
import { User } from 'src/app/models/user.model';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  user: User = new User();
  menuItems: PageMenuItem[] = [
    { id: 'general', icon: 'i-general', label: 'Info' },
    { id: 'signature', icon: 'i-signature', label: 'Signature' },
    { id: 'security', icon: 'i-security', label: 'Security' },
    { id: 'billing', icon: 'i-payment', label: 'Subscription' }
  ];
  defaultPage = 'general';
  currentPage: string;
  currentPageItem: PageMenuItem[];
  queryParamSubscription: Subscription;

  profileSubscription: Subscription;
  routeChangeSubscription: Subscription;
  initStep = 1;
  isSuspended = false;
  disableMenuItems = [];

  constructor(
    private location: Location,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private toast: ToastrService
  ) {
    this.profileSubscription && this.profileSubscription.unsubscribe();
    this.profileSubscription = this.userService.profile$.subscribe(
      (profile) => {
        this.user = profile;
        this.isSuspended = profile.subscription?.is_suspended;
        if (this.isSuspended) {
          this.disableMenuItems = [
            { id: 'general', icon: 'i-general', label: 'Info' },
            { id: 'signature', icon: 'i-signature', label: 'Signature' },
            { id: 'security', icon: 'i-security', label: 'Security' }
          ];
        }
      }
    );
  }

  ngOnInit(): void {
    // Google and Outlook Integration Redirect Handler
    this.queryParamSubscription && this.queryParamSubscription.unsubscribe();
    this.queryParamSubscription = this.route.queryParams.subscribe((params) => {
      if (params['code']) {
        const action = this.route.snapshot.params['page'];
        if (action == 'outlook') {
          this.currentPage = 'integration';
          this.userService.authorizeOutlook(params['code']).subscribe(
            (res) => {
              this.user.connected_email_type = 'outlook';
              this.user.primary_connected = true;
              this.user.connected_email = res['data'];
              this.userService.updateProfile(this.user).subscribe((data) => {
                this.userService.updateProfileImpl(data);
              });
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
              this.userService.updateProfile(this.user).subscribe((data) => {
                this.userService.updateProfileImpl(data);
              });
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
      this.currentPage = params['page'] || this.defaultPage;
      if (this.currentPage === 'upgrade-plan') {
        this.initStep = 2;
        this.currentPageItem = [this.menuItems[3]];
        this.currentPage = 'billing';
      } else if (this.currentPage === 'cancel-account') {
        this.initStep = 4;
        this.currentPageItem = [this.menuItems[3]];
        this.currentPage = 'billing';
      } else {
        this.currentPageItem = this.menuItems.filter(
          (item) => item.id == this.currentPage
        );
      }
    });
  }

  ngOnDestroy(): void {
    this.profileSubscription && this.profileSubscription.unsubscribe();
    this.queryParamSubscription && this.queryParamSubscription.unsubscribe();
    this.routeChangeSubscription && this.routeChangeSubscription.unsubscribe();
  }

  /**
   * Change the page and replace the location
   * @param menu : SubMenu Item
   */
  changeMenu(menu: PageMenuItem): void {
    this.currentPage = menu.id;
    this.currentPageItem = this.menuItems.filter(
      (item) => item.id == this.currentPage
    );
    this.location.replaceState(`profile/${menu.id}`);
  }

  isDisableMenuItem(menuItem): boolean {
    const index = this.disableMenuItems.findIndex(
      (item) => item.id === menuItem.id
    );
    if (index >= 0) {
      return true;
    }
    return false;
  }
}
