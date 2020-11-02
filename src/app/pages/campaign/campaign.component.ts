import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { CampaignAddListComponent } from '../../components/campaign-add-list/campaign-add-list.component';

@Component({
  selector: 'app-campaign',
  templateUrl: './campaign.component.html',
  styleUrls: ['./campaign.component.scss']
})
export class CampaignComponent implements OnInit, OnDestroy {
  selectedTab = 1;
  tabs = ['List', 'Bulk Mailing'];
  tabUrls = ['list', 'bulk'];
  lists: any[] = [];
  currentListPage = 1;
  listCount;
  selectedLists = new SelectionModel<any>(true, []);

  constructor(private location: Location, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.init();
  }

  ngOnDestroy(): void {}

  init(): void {
    for (let i = 1; i < 5; i++) {
      const list = {
        _id: i,
        name: 'list' + i,
        subscribers: 0,
        unsubscribers: 0,
        deliveryissues: 0
      };
      this.lists.push(list);
    }
  }

  changeTab(event): void {
    this.selectedTab = event.index;
    this.location.replaceState('/campaign/' + this.tabUrls[this.selectedTab]);
  }

  isSelectedPage(): any {
    if (this.lists.length) {
      for (let i = 0; i < this.lists.length; i++) {
        const e = this.lists[i];
        if (!this.selectedLists.isSelected(e._id)) {
          return false;
        }
      }
    }
    return true;
  }

  selectAllPage(): void {
    if (this.isSelectedPage()) {
      this.lists.forEach((e) => {
        if (this.selectedLists.isSelected(e._id)) {
          this.selectedLists.deselect(e._id);
        }
      });
    } else {
      this.lists.forEach((e) => {
        if (!this.selectedLists.isSelected(e._id)) {
          this.selectedLists.select(e._id);
        }
      });
    }
  }

  detailList($event, list): void {
    this.location.replaceState('/campaign/list/' + list._id);
  }

  addList(): void {
    this.dialog
      .open(CampaignAddListComponent, {
        width: '96vw',
        maxWidth: '500px',
        height: 'auto',
        disableClose: true
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          const list = {
            _id: this.lists.length + 1,
            name: res['name'],
            subscribers: 0,
            unsubscribers: 0,
            deliveryissues: 0
          };
          this.lists.push(list);
        }
      });
  }

  editList(list): void {}
}
