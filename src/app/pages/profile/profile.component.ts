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

  constructor(private location: Location, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.currentPage = this.route.snapshot.params['page'] || this.defaultPage;
  }
  changeMenu(menu: PageMenuItem): void {
    this.currentPage = menu.id;
    this.location.replaceState(`profile/${menu.id}`);
  }
}
