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
    { id: 'bulk', icon: 'i-bulk', label: 'Bulk Mailing' }
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
  // listCount;
  // bulkLists = [];
  // selected = 1;
  // selectedLists = new SelectionModel<any>(true, []);
  // selectedBulkLists = new SelectionModel<any>(true, []);
  // constructor(private location: Location, private dialog: MatDialog) {}
  //
  // ngOnInit(): void {
  //   this.loadList();
  //   this.loadBulk();
  // }
  //
  // ngOnDestroy(): void {}
  //
  // loadList(): void {
  //   for (let i = 1; i < 5; i++) {
  //     const list = {
  //       _id: i,
  //       name: 'list' + i,
  //       subscribers: 0,
  //       unsubscribers: 0,
  //       deliveryissues: 0
  //     };
  //     this.lists.push(list);
  //   }
  // }
  // loadBulk(): void {
  //   for (let i = 1; i < 5; i++) {
  //     const bulk = {
  //       _id: i,
  //       name: 'bulk' + i,
  //       status: 'SENT',
  //       send_time: Date.now(),
  //       delivered: 8,
  //       opened: 5
  //     };
  //     this.bulkLists.push(bulk);
  //   }
  // }
  //
  // changeTab(event): void {
  //   this.selectedTab = event.index;
  //   // this.location.replaceState('/campaign/' + this.tabUrls[this.selectedTab - 1]);
  // }
  //
  // isSelectedPage(): any {
  //   if (this.lists.length) {
  //     for (let i = 0; i < this.lists.length; i++) {
  //       const e = this.lists[i];
  //       if (!this.selectedLists.isSelected(e._id)) {
  //         return false;
  //       }
  //     }
  //   }
  //   return true;
  // }
  //
  // selectAllPage(): void {
  //   if (this.isSelectedPage()) {
  //     this.lists.forEach((e) => {
  //       if (this.selectedLists.isSelected(e._id)) {
  //         this.selectedLists.deselect(e._id);
  //       }
  //     });
  //   } else {
  //     this.lists.forEach((e) => {
  //       if (!this.selectedLists.isSelected(e._id)) {
  //         this.selectedLists.select(e._id);
  //       }
  //     });
  //   }
  // }
  //
  // detailList($event, list): void {
  //   this.location.replaceState('/campaign/list/' + list._id);
  // }
  //
  // addList(): void {
  //   this.dialog
  //     .open(CampaignAddListComponent, {
  //       width: '96vw',
  //       maxWidth: '500px',
  //       height: 'auto',
  //       disableClose: true
  //     })
  //     .afterClosed()
  //     .subscribe((res) => {
  //       if (res) {
  //         const list = {
  //           _id: this.lists.length + 1,
  //           name: res['name'],
  //           subscribers: 0,
  //           unsubscribers: 0,
  //           deliveryissues: 0
  //         };
  //         this.lists.push(list);
  //       }
  //     });
  // }
  //
  // editList(list): void {}
  //
  // selectAllBulkPage(): void {
  //   if (this.isSelectedBulkPage()) {
  //     this.bulkLists.forEach((e) => {
  //       if (this.selectedBulkLists.isSelected(e._id)) {
  //         this.selectedBulkLists.deselect(e._id);
  //       }
  //     });
  //   } else {
  //     this.bulkLists.forEach((e) => {
  //       if (!this.selectedBulkLists.isSelected(e._id)) {
  //         this.selectedBulkLists.select(e._id);
  //       }
  //     });
  //   }
  // }
  // isSelectedBulkPage(): any {
  //   if (this.bulkLists.length) {
  //     for (let i = 0; i < this.bulkLists.length; i++) {
  //       const e = this.bulkLists[i];
  //       if (!this.selectedBulkLists.isSelected(e._id)) {
  //         return false;
  //       }
  //     }
  //   } else {
  //     return false;
  //   }
  //   return true;
  // }
  // addBroadcast(): void {
  //   this.dialog
  //     .open(CampaignAddBroadcastComponent, {
  //       width: '96vw',
  //       maxWidth: '600px',
  //       height: 'auto',
  //       disableClose: true
  //     })
  //     .afterClosed()
  //     .subscribe((res) => {
  //       if (res) {
  //
  //       }
  //     });
  // }
  // doAction(action: any): void {
  //   console.log('action', action);
  // }
  //
  // actions: ActionItem[] = [
  //   {
  //     icon: 'i-message',
  //     label: 'Merge list',
  //     type: 'button'
  //   },
  //   {
  //     icon: 'i-message',
  //     label: 'Delete list',
  //     type: 'button'
  //   },
  //   {
  //     spliter: true,
  //     label: 'Select All',
  //     type: 'button'
  //   },
  //   {
  //     label: 'Deselect',
  //     type: 'button'
  //   }
  // ];
}
