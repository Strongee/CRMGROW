import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { PageMenuItem } from 'src/app/utils/data.types';
import { UserService } from 'src/app/services/user.service';
import { ToastrService } from 'ngx-toastr';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: User = new User();
  menuItems: PageMenuItem[] = [
    { id: 'general', icon: 'i-general', label: 'General Information' },
    { id: 'signature', icon: 'i-signature', label: 'Signature' },
    { id: 'security', icon: 'i-security', label: 'Security' },
    { id: 'integration', icon: 'i-integration', label: 'Integration' },
    { id: 'social', icon: 'i-social', label: 'Social Profile' },
    { id: 'billing', icon: 'i-payment', label: 'Billing' }
  ];
  defaultPage = 'general';
  currentPage: string;
  queryParamSubscription: Subscription;

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private userService: UserService,
    private toast: ToastrService
  ) {
    this.userService.profile$.subscribe((profile) => {
      this.user = profile;
    });
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
              this.location.replaceState('/profile/integration');
            },
            (err) => {
              this.location.replaceState('/profile/integration');
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
              this.location.replaceState('/profile/integration');
            },
            (err) => {
              this.location.replaceState('/profile/integration');
            }
          );
        }
      } else {
        this.currentPage =
          this.route.snapshot.params['page'] || this.defaultPage;
      }
    });
  }

  /**
   * Change the page and replace the location
   * @param menu : SubMenu Item
   */
  changeMenu(menu: PageMenuItem): void {
    this.currentPage = menu.id;
    this.location.replaceState(`profile/${menu.id}`);
  }
}
