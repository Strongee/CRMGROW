import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-campaign-bulk-mailing',
  templateUrl: './campaign-bulk-mailing.component.html',
  styleUrls: ['./campaign-bulk-mailing.component.scss']
})
export class CampaignBulkMailingComponent implements OnInit {
  selectedTab = 2;
  tabs = ['List', 'Bulk Mailing'];
  tabUrls = ['list', 'bulk'];
  bulkLists = [];
  selectedBulkLists = new SelectionModel<any>(true, []);
  constructor(private location: Location, private dialog: MatDialog) {}

  ngOnInit(): void {}

  changeTab(event): void {
    this.selectedTab = event.index;
    this.location.replaceState('/campaign/' + this.tabUrls[this.selectedTab - 1]);
  }


}
