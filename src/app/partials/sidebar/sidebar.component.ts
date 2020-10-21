import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

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
    title: 'Tasks',
    icon: 'i-task bgc-dark',
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
  {
    path: 'compaigns',
    title: 'Compaign',
    icon: 'i-broadcasts bgc-dark',
    class: '',
    beta: false,
    betaClass: '',
    betaLabel: '',
    protectedRole: null
  },
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
    path: 'settings',
    title: 'Settings',
    icon: 'i-setting bgc-dark',
    class: '',
    beta: false,
    betaClass: '',
    betaLabel: '',
    protectedRole: null
  },
  {
    path: 'teams',
    title: 'Teams',
    icon: 'i-lunch bgc-dark',
    class: '',
    beta: false,
    betaClass: '',
    betaLabel: '',
    protectedRole: null
  },
  {
    path: 'templates',
    title: 'Templates',
    icon: 'i-lunch bgc-dark',
    class: '',
    beta: false,
    betaClass: '',
    betaLabel: '',
    protectedRole: null
  },

];

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  menuItems: RouteInfo[] = ROUTES;
  isCollapsed = true;
  profile: any = {};

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events.subscribe(() => {
      this.isCollapsed = true;
    });
  }
}
