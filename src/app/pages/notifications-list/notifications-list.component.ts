import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificationService } from 'src/app/services/notification.service';
import { getNotificationDetail } from 'src/app/utils/functions';

@Component({
  selector: 'app-notifications-list',
  templateUrl: './notifications-list.component.html',
  styleUrls: ['./notifications-list.component.scss']
})
export class NotificationsListComponent implements OnInit {
  DISPLAY_COLUMNS = ['select', 'icon', 'content', 'action'];
  ACTIONS = [
    {
      label: 'Mark as read',
      loadingLabel: 'Marking as read...',
      type: 'button',
      command: 'edit',
      loading: false
    },
    {
      label: 'Delete',
      loadingLabel: 'Deleting...',
      type: 'button',
      command: 'delete',
      loading: false
    },
    {
      label: 'Deselect',
      type: 'button',
      command: 'deselect',
      loading: false
    }
  ];
  notifications: any[] = [];
  loading = false;
  loadSubscription: Subscription;
  page = 1;
  total = 0;
  getNotificationDetail = getNotificationDetail;
  selectedIds = [];

  constructor(private notificationService: NotificationService) {
    this.loadPage(1);
  }

  ngOnInit(): void {}

  loadPage(page: number): void {
    this.page = page;
    this.loading = true;
    this.loadSubscription && this.loadSubscription.unsubscribe();
    this.loadSubscription = this.notificationService.getByPage(page).subscribe(
      (res) => {
        this.loading = false;
        if (res['notifications'] && res['notifications'].length) {
          this.notifications = res['notifications'];
        }
        if (res['notifications'] && res['notifications'].length === 0) {
          this.total = 0;
        } else {
          this.total = res['total'];
        }
      },
      (err) => {
        this.loading = false;
      }
    );
  }

  setAsRead(item: any): void {
    this.notificationService.setAsRead([item._id]).subscribe((res) => {
      item.is_read = true;
    });
  }

  setAsUnread(item: any): void {
    this.notificationService.setAsUnread([item._id]).subscribe((res) => {
      item.is_read = false;
    });
  }

  delete(item: any): void {
    this.notificationService.delete([item._id]).subscribe((res) => {
      if (this.notifications.length > 1) {
        this.loadPage(this.page);
      } else {
        this.page--;
        this.page = this.page > 0 ? this.page : 1;
        this.loadPage(this.page);
      }
    });
  }

  toggle(item): void {
    const pos = this.selectedIds.indexOf(item._id);
    if (pos !== -1) {
      this.selectedIds.splice(pos, 1);
    } else {
      this.selectedIds.push(item._id);
    }
  }
  isSelected(item): boolean {
    const pos = this.selectedIds.indexOf(item._id);
    return pos !== -1;
  }
  isAllSelected(item): boolean {
    const selected = this.notifications.filter((e) => {
      return this.selectedIds.indexOf(e._id) !== -1;
    });
    return selected.length === this.notifications.length;
  }
  masterToggle(): void {

  }
  doAction(command): void {}
}
