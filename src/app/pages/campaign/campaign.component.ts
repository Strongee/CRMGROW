import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Location } from '@angular/common';
import { PageMenuItem } from '../../utils/data.types';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-campaign',
  templateUrl: './campaign.component.html',
  styleUrls: ['./campaign.component.scss']
})
export class CampaignComponent implements OnInit, AfterViewInit {
  menuItems: PageMenuItem[] = [
    { id: 'list', icon: 'i-list', label: 'List' },
    { id: 'bulk', icon: 'i-bulk', label: 'Bulk Mailing' },
    { id: 'smtp', icon: 'i-message', label: 'Connect SMTP' }
  ];
  defaultPage = 'list';
  currentPageType: string;
  detailID = {
    list: null,
    bulk: null
  };

  constructor(private location: Location, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.currentPageType =
      this.route.snapshot.params['page'] || this.defaultPage;
    this.detailID[this.currentPageType] = this.route.snapshot.params['id'];
  }
  /**
   * Change the Page Type and Reset the Current List Id
   * Replace the Routing
   * @param menu: Page Sub Menu Item
   */
  changeMenu(menu: PageMenuItem): void {
    this.location.replaceState(`campaign/${menu.id}`);
    this.currentPageType = menu.id;
    this.detailID = {
      list: null,
      bulk: null
    };
  }
  /**
   * Change the Page type and go to detail page
   * @param type : Page List Type
   * @param id : Detail Page Id
   */
  changePage(type: string, id: string): void {
    this.location.replaceState(`campaign/${type}/${id}`);
    this.currentPageType = type;
    this.detailID[type] = id;
  }
  ngAfterViewInit(): void {}
}
