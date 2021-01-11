import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-notifications-list',
  templateUrl: './notifications-list.component.html',
  styleUrls: ['./notifications-list.component.scss']
})
export class NotificationsListComponent implements OnInit {
  notifications: any[] = [];
  loading = false;
  loadSubscription: Subscription;
  page = 1;
  total = 0;

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
        this.total = res['total'];
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
}
