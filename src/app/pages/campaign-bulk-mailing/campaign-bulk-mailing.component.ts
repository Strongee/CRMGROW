import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { ActionItem } from '../../utils/data.types';
import { CampaignAddBroadcastComponent } from '../../components/campaign-add-broadcast/campaign-add-broadcast.component';

@Component({
  selector: 'app-campaign-bulk-mailing',
  templateUrl: './campaign-bulk-mailing.component.html',
  styleUrls: ['./campaign-bulk-mailing.component.scss']
})
export class CampaignBulkMailingComponent implements OnInit {

  bulkLists = [];
  selected = 1;
  selectedBulkLists = new SelectionModel<any>(true, []);

  actions: ActionItem[] = [
    {
      icon: 'i-message',
      label: 'Send Test Email',
      type: 'button'
    },
    {
      icon: 'i-copy',
      label: 'Copy',
      type: 'button'
    },
    {
      icon: 'i-trash',
      label: 'Delete',
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

  @Output() onDetail: EventEmitter<string> = new EventEmitter();
  constructor(private location: Location, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadBulk();
  }

  loadBulk(): void {
    for (let i = 1; i < 5; i++) {
      const bulk = {
        _id: i,
        name: 'bulk' + i,
        status: 'SENT',
        send_time: Date.now(),
        delivered: 8,
        opened: 5
      };
      this.bulkLists.push(bulk);
    }
  }

  selectAllBulkPage(): void {
    if (this.isSelectedBulkPage()) {
      this.bulkLists.forEach((e) => {
        if (this.selectedBulkLists.isSelected(e._id)) {
          this.selectedBulkLists.deselect(e._id);
        }
      });
    } else {
      this.bulkLists.forEach((e) => {
        if (!this.selectedBulkLists.isSelected(e._id)) {
          this.selectedBulkLists.select(e._id);
        }
      });
    }
  }
  isSelectedBulkPage(): any {
    if (this.bulkLists.length) {
      for (let i = 0; i < this.bulkLists.length; i++) {
        const e = this.bulkLists[i];
        if (!this.selectedBulkLists.isSelected(e._id)) {
          return false;
        }
      }
    } else {
      return false;
    }
    return true;
  }
  addBroadcast(): void {
    this.dialog
      .open(CampaignAddBroadcastComponent, {
        width: '96vw',
        maxWidth: '600px',
        height: 'auto',
        disableClose: true
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {

        }
      });
  }

  goToDetailPage(id: string): void {
    this.onDetail.emit(id);
  }

  routingToItem(id): void {
    this.location.replaceState('/campaign/bulk/' + id);
  }

  doAction(action: any): void {
    console.log('action', action);
  }

}
