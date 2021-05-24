import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { Subscription } from 'rxjs';

declare interface RouteInfo {
  path: string;
  title: string;
  icon: string;
  class: string;
  beta: boolean;
  betaClass: string;
  betaLabel: string;
  protectedRole: string[]; // Can be decorated with Enum Data
}

export const ROUTES: RouteInfo[] = [
  {
    path: 'home',
    title: 'Dashboard',
    icon: 'i-task bgc-dark',
    class: '',
    beta: false,
    betaClass: '',
    betaLabel: '',
    protectedRole: null
  },
  {
    path: 'deals',
    title: 'Deals',
    icon: 'i-deals bgc-dark',
    class: '',
    beta: false,
    betaClass: '',
    betaLabel: '',
    protectedRole: null
  },
  {
    path: 'contacts',
    title: 'Contacts',
    icon: 'i-lunch bgc-dark',
    class: '',
    beta: false,
    betaClass: '',
    betaLabel: '',
    protectedRole: null
  },
  {
    path: 'materials',
    title: 'Materials',
    icon: 'i-video bgc-dark',
    class: '',
    beta: false,
    betaClass: '',
    betaLabel: '',
    protectedRole: null
  },
  // {
  //   path: 'campaign',
  //   title: 'Campaign',
  //   icon: 'i-broadcasts bgc-dark',
  //   class: '',
  //   beta: false,
  //   betaClass: '',
  //   betaLabel: '',
  //   protectedRole: null
  // },
  {
    path: 'automations',
    title: 'Automations',
    icon: 'i-automation bgc-dark',
    class: '',
    beta: false,
    betaClass: '',
    betaLabel: '',
    protectedRole: null
  },
  {
    path: 'calendar',
    title: 'Calendar',
    icon: 'i-calendar bgc-dark',
    class: '',
    beta: false,
    betaClass: '',
    betaLabel: '',
    protectedRole: null
  },
  {
    path: 'templates',
    title: 'Templates',
    icon: 'i-template bgc-dark',
    class: '',
    beta: false,
    betaClass: '',
    betaLabel: '',
    protectedRole: null
  },
  {
    path: 'teams',
    title: 'Teams',
    icon: 'i-teams bgc-dark',
    class: '',
    beta: false,
    betaClass: '',
    betaLabel: '',
    protectedRole: null
  },
  {
    path: 'settings',
    title: 'Settings',
    icon: 'i-setting bgc-dark',
    class: '',
    beta: false,
    betaClass: '',
    betaLabel: '',
    protectedRole: null
  }
];

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  menuItems: RouteInfo[] = ROUTES;
  disableMenuItems: RouteInfo[] = [];
  isCollapsed = false;
  profile: any = {};
  isSuspended = false;
  profileSubscription: Subscription;
  isPackageAutomation = true;
  isPackageCalendar = true;

  constructor(private router: Router, public userService: UserService) {
    this.profileSubscription = this.userService.profile$.subscribe((user) => {
      if (user) {
        this.isSuspended = user.subscription?.is_suspended;
        this.isPackageAutomation = user.automation_info?.is_enabled;
        this.isPackageCalendar = user.calendar_info?.is_enabled;
        this.disableMenuItems = [];
        if (!this.isPackageAutomation) {
          this.disableMenuItems.push({
            path: 'automations',
            title: 'Automations',
            icon: 'i-automation bgc-dark',
            class: '',
            beta: false,
            betaClass: '',
            betaLabel: '',
            protectedRole: null
          });
        }
        if (!this.isPackageCalendar) {
          this.disableMenuItems.push({
            path: 'calendar',
            title: 'Calendar',
            icon: 'i-calendar bgc-dark',
            class: '',
            beta: false,
            betaClass: '',
            betaLabel: '',
            protectedRole: null
          });
        }
      }
    });
  }

  ngOnInit(): void {
    // this.router.events.subscribe(() => {
    //   this.isCollapsed = true;
    // });
  }

  isDisableItem(menuItem): boolean {
    const index = this.disableMenuItems.findIndex(
      (item) => item.title === menuItem.title
    );
    if (index >= 0) {
      return true;
    }
    return false;
  }
}
