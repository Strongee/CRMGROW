import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { CampaignAddListComponent } from '../../components/campaign-add-list/campaign-add-list.component';
import { ActionItem } from '../../utils/data.types';

@Component({
  selector: 'app-campaign-list',
  templateUrl: './campaign-list.component.html',
  styleUrls: ['./campaign-list.component.scss']
})
export class CampaignListComponent implements OnInit {
  lists = [];
  listCount;
  selected = 1;
  selectedLists = new SelectionModel<any>(true, []);
  constructor(private location: Location, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadList();
  }

  loadList(): void {
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

  routingToItem(id): void {
    this.location.replaceState('/campaign/list/' + id);
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

  doAction(action: any): void {
    console.log('action', action);
  }

  actions: ActionItem[] = [
    {
      icon: 'i-message',
      label: 'Merge list',
      type: 'button'
    },
    {
      icon: 'i-message',
      label: 'Delete list',
      type: 'button'
    },
    {
      spliter: true,
      label: 'Select All',
      type: 'button'
    },
    {
      label: 'Deselect',
      type: 'button'
    }
  ];
}
