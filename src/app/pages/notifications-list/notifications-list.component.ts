import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { ConfirmComponent } from 'src/app/components/confirm/confirm.component';
import { DialogSettings } from 'src/app/constants/variable.constants';
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
  ICONS = {
    material_track: 'i-video',
    unsubscribe: '',
    open_email: '',
    click_link: '',
    bulk_email: '',
    bulk_sms: ''
  };
  notifications: any[] = [];
  loading = false;
  loadSubscription: Subscription;
  page = 1;
  total = 0;
  getNotificationDetail = getNotificationDetail;
  selectedIds = [];

  deleting = false;
  updating = false;

  constructor(
    private notificationService: NotificationService,
    private dialog: MatDialog
  ) {
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
  markUnreadNotifications(ids: string[]): void {
    this.updating = true;
    this.notificationService.setAsRead(ids).subscribe(() => {
      this.updating = false;
      this.notifications.forEach((e) => {
        if (ids.indexOf(e._id) !== -1) {
          e.is_read = true;
        }
      });
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
  deleteItems(ids): void {
    this.deleting = true;
    this.notificationService.delete(ids).subscribe((res) => {
      this.deleting = false;
      this.notifications = this.notifications.filter((e) => {
        if (this.selectedIds.indexOf(e._id) === -1) {
          return true;
        }
        return false;
      });
      this.selectedIds = [];
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
  isAllSelected(): boolean {
    const selected = this.notifications.filter((e) => {
      return this.selectedIds.indexOf(e._id) !== -1;
    });
    return selected.length === this.notifications.length;
  }
  masterToggle(): void {
    if (this.isAllSelected()) {
      this.notifications.forEach((e) => {
        const pos = this.selectedIds.indexOf(e._id);
        if (pos !== -1) {
          this.selectedIds.splice(pos, 1);
        }
      });
    } else {
      this.notifications.forEach((e) => {
        if (this.selectedIds.indexOf(e._id) === -1) {
          this.selectedIds.push(e._id);
        }
      });
    }
  }
  doAction(event): void {
    switch (event.command) {
      case 'deselect':
        this.selectedIds = [];
        break;
      case 'delete':
        this.dialog
          .open(ConfirmComponent, {
            ...DialogSettings.CONFIRM,
            data: {
              title: 'Delete notifications',
              message: 'Are you sure to delete selected notifications?',
              confirmLabel: 'Delete'
            }
          })
          .afterClosed()
          .subscribe((res) => {
            if (res) {
              this.deleteItems(this.selectedIds);
            }
          });
        break;
      case 'edit':
        this.markUnreadNotifications(this.selectedIds);
        break;
    }
  }
}
