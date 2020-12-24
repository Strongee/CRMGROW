import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Location } from '@angular/common';
import { TabItem } from '../../utils/data.types';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-campaign',
  templateUrl: './campaign.component.html',
  styleUrls: ['./campaign.component.scss']
})
export class CampaignComponent implements OnInit, AfterViewInit {
  tabs: TabItem[] = [
    { id: 'list', icon: '', label: 'Lists' },
    { id: 'bulk', icon: '', label: 'Bulk mailing' },
    { id: 'smtp', icon: '', label: 'Connect SMTP' }
  ];
  selectedTab: TabItem = this.tabs[0];
  defaultPage = 'list';
  currentPageType: string;
  detailID = {
    list: null,
    bulk: null
  };

  constructor(private location: Location, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const currentTabId = this.route.snapshot.params['page'] || this.defaultPage;
    const tabIndex = this.tabs.findIndex((tab) => tab.id === currentTabId);
    this.selectedTab = this.tabs[tabIndex];
  }

  changeTab(tab: TabItem): void {
    this.selectedTab = tab;
    this.location.replaceState(tab.id);
    // Set the storage for the active tab
  }

  ngAfterViewInit(): void {}
}
