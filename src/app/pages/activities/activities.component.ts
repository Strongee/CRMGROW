import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { STATUS } from 'src/app/constants/variable.constants';
import { ActivityService } from 'src/app/services/activity.service';
import { ContactService } from 'src/app/services/contact.service';
import { StoreService } from 'src/app/services/store.service';

@Component({
  selector: 'app-activities',
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.scss']
})
export class ActivitiesComponent implements OnInit {
  STATUS = STATUS;
  DISPLAY_COLUMNS = [
    'contact_name',
    'contact_label',
    'activity',
    'contact_email',
    'contact_phone'
  ];
  PAGE_COUNTS = [
    { id: 8, label: '8' },
    { id: 10, label: '10' },
    { id: 20, label: '20' },
    { id: 50, label: '50' }
  ];

  isUpdating = false;
  updateSubscription: Subscription;

  pageSize = this.PAGE_COUNTS[2];
  page = 1;
  constructor(
    public storeService: StoreService,
    public activityService: ActivityService,
    private contactService: ContactService
  ) {}

  ngOnInit(): void {
    this.activityService.load(1);
  }

  changePage(page: number): void {
    this.page = page;
    this.activityService.load(page);
  }

  onOverPages(page: number): void {
    this.changePage(page);
  }

  changePageSize(type: any): void {
    this.pageSize = type;
  }

  updateLabel(label: string, _id: string): void {
    const newLabel = label ? label : '';
    const ids = [_id];
    this.isUpdating = true;
    this.updateSubscription && this.updateSubscription.unsubscribe();
    this.updateSubscription = this.contactService
      .bulkUpdate(ids, { label: newLabel }, {})
      .subscribe((status) => {
        this.isUpdating = false;
        if (status) {
          this.storeService.bulkUpdate$(ids, { label: newLabel }, {});
        }
      });
  }
}
