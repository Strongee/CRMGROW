import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { PageMenuItem } from 'src/app/utils/data.types';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  menuItems: PageMenuItem[] = [
    { id: 'general', icon: 'i-general', label: 'General Information' },
    { id: 'signature', icon: 'i-signature', label: 'Signature' },
    { id: 'security', icon: 'i-security', label: 'Security' },
    { id: 'integration', icon: 'i-integration', label: 'Integration' },
    { id: 'social', icon: 'i-social', label: 'Social Profile' },
    { id: 'payment', icon: 'i-payment', label: 'Payment' }
  ];
  defaultPage = 'general';
  currentPage: string;

  constructor(
    private userService: UserService,
    private location: Location,
    private route: ActivatedRoute
  ) {
    this.userService.profile.subscribe((res) => {
      console.log('profile', res);
    });
    const observe = this.userService.profile.asObservable();
    observe.subscribe((res) => {
      console.log('profile111', res);
    });
    observe.subscribe((res) => {
      console.log('profile222', res);
    });
    this.userService.profile.subscribe((res) => {
      console.log('profile333', res);
    });
  }

  ngOnInit(): void {
    this.currentPage = this.route.snapshot.params['page'] || this.defaultPage;
  }
  changeMenu(menu: PageMenuItem): void {
    this.currentPage = menu.id;
    this.location.replaceState(`profile/${menu.id}`);
  }

  updateProfile() {}
}
