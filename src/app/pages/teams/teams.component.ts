import { Component, OnInit } from '@angular/core';
import { TabItem } from '../../utils/data.types';

@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.scss']
})
export class TeamsComponent implements OnInit {
  tabs: TabItem[] = [
    { icon: 'i-icon i-teams', label: 'MY TEAMS', id: 'teams' },
    { icon: 'i-icon i-group-call', label: 'GROUP CALLS', id: 'calls' }
  ];

  selectedTab: TabItem = this.tabs[0];

  constructor() {}

  ngOnInit(): void {}

  changeTab(tab: TabItem): void {
    this.selectedTab = tab;
  }
}
