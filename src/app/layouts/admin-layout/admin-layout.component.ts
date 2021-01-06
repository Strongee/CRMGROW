import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SwPush } from '@angular/service-worker';
import { Garbage } from 'src/app/models/garbage.model';
import { User } from 'src/app/models/user.model';
import { ContactService } from 'src/app/services/contact.service';
import { LabelService } from 'src/app/services/label.service';
import { TagService } from 'src/app/services/tag.service';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit {
  @ViewChild('drawer') manageLabelPanel: MatDrawer;

  constructor(
    private userService: UserService,
    private labelService: LabelService,
    private tagService: TagService,
    private contactService: ContactService,
    private swPush: SwPush,
    private snackBar: MatSnackBar
  ) {
    this.userService.loadProfile().subscribe((res) => {
      console.log('profile data', res);
      this.userService.setProfile(new User().deserialize(res));
      const garbage = new Garbage().deserialize(res['garbage']);
      this.userService.setGarbage(garbage);

      // Check for the desktop notification
      if (garbage.entire_desktop_notification !== -1) {
        this.subscribeToPushNotification(garbage.desktop_notification);
      }
    });
    this.labelService.loadLabels();
    this.tagService.getAllTags();
    this.tagService.getAllCompanies();
    this.tagService.getAllSources();
    this.contactService.loadPage();

    // Open or Close Manage Label
    this.labelService.manageLabel$.subscribe((flg) => {
      if (this.manageLabelPanel) {
        if (flg) {
          this.manageLabelPanel.open();
        } else {
          this.manageLabelPanel.close();
        }
      }
    });
  }

  ngOnInit(): void {}

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async subscribeToPushNotification(option) {
    try {
      const subscription = await this.swPush.requestSubscription({
        serverPublicKey: environment.API_KEY.Notification
      });
      this.userService.enableDesktopNotification(subscription, option);
    } catch (err) {
      console.log(`Could not subscribe due to:`, err.message);
      this.snackBar.open(
        `You can not receive the desktop notification due to ` + err.message,
        'OK',
        {
          verticalPosition: 'bottom',
          horizontalPosition: 'left',
          duration: 3000
        }
      );
    }
  }
}
