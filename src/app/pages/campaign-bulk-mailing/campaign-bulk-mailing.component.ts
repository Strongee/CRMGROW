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
import { CampaignService } from '../../services/campaign.service';

@Component({
  selector: 'app-campaign-bulk-mailing',
  templateUrl: './campaign-bulk-mailing.component.html',
  styleUrls: ['./campaign-bulk-mailing.component.scss']
})
export class CampaignBulkMailingComponent implements OnInit {

  bulkLists = [];
  selected = 1;
  isLoading = false;
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
  constructor(
    private location: Location,
    private dialog: MatDialog,
    private campaignService: CampaignService
  ) {}

  ngOnInit(): void {
    this.loadBulk();
  }

  loadBulk(): void {
    this.isLoading = true;
    this.campaignService.getList().subscribe(
      (res) => {
        this.bulkLists = res;
        this.isLoading = false;
      },
      (err) => {
        this.isLoading = false;
      }
    );
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

  selectAll(): void {
    this.bulkLists.forEach((e) => {
      if (!this.selectedBulkLists.isSelected(e._id)) {
        this.selectedBulkLists.select(e._id);
      }
    });
  }

  deselectAll(): void {
    this.bulkLists.forEach((e) => {
      if (this.selectedBulkLists.isSelected(e._id)) {
        this.selectedBulkLists.deselect(e._id);
      }
    });
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
          this.bulkLists.push(res.data);
        }
      });
  }

  doAction(action: any): void {
    if (action.label === 'Select All') {
      this.selectAll();
    } else if (action.label === 'Deselect') {
      this.deselectAll();
    }
  }

}
