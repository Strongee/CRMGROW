import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ContactCreateComponent } from 'src/app/components/contact-create/contact-create.component';
import { NoteCreateComponent } from 'src/app/components/note-create/note-create.component';
import { TaskCreateComponent } from 'src/app/components/task-create/task-create.component';
import { DialogSettings } from 'src/app/constants/variable.constants';
import { UserService } from 'src/app/services/user.service';
import { RecordSettingDialogComponent } from '../../components/record-setting-dialog/record-setting-dialog.component';
import { SendEmailComponent } from '../../components/send-email/send-email.component';
import { HandlerService } from 'src/app/services/handler.service';
import { NotificationService } from 'src/app/services/notification.service';
import { ConnectService } from 'src/app/services/connect.service';
import { DealCreateComponent } from 'src/app/components/deal-create/deal-create.component';
import { interval, Subscription } from 'rxjs';
import { ContactService } from '../../services/contact.service';
import { TabItem } from 'src/app/utils/data.types';
import { Contact } from 'src/app/models/contact.model';
import { SendTextComponent } from 'src/app/components/send-text/send-text.component';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  actions: any[] = [
    { icon: 'i-contact bg-white', label: 'New Contact', id: 'contact' },
    { icon: 'i-sms-sent bg-white', label: 'New Text', id: 'text' },
    { icon: 'i-message bg-white', label: 'New Email', id: 'message' },
    { icon: 'i-phone bg-white', label: 'New Call', id: 'call' },
    { icon: 'i-task bg-white', label: 'New Task', id: 'task' },
    { icon: 'i-deals bg-white', label: 'New Deal', id: 'deal' },
    {
      icon: 'i-calendar bg-white',
      label: 'New Meeting',
      id: 'appointment'
    },
    { icon: 'i-template bg-white', label: 'New Note', id: 'note' },
    { icon: 'i-record bg-white', label: 'Record Video', id: 'record' },
    { icon: 'i-upload bg-white', label: 'Upload Material', id: 'video' }
  ];

  searchDataTypes: any[] = [
    { label: 'Contacts', id: 'contacts' },
    { label: 'Tasks', id: 'tasks' },
    { label: 'Materials', id: 'materials' },
    { label: 'Templates', id: 'templates' }
  ];
  currentSearchType: any = this.searchDataTypes[0];
  keyword = '';

  @ViewChild('searchInput') searchInput: ElementRef;
  isSuspended = false;
  isPackageText = true;
  isPackageAutomation = true;
  profileSubscription: Subscription;

  // Notifications
  notificationUpdater$;
  notificationLoadSubscription: Subscription;
  emailTasks = [];
  textTasks = [];
  unreadMessages = [];
  unreadMessageCount = 0;
  notifications = [];
  unreadNotifications = 0;
  disableActions = [];
  showEmails = false;
  showTexts = false;
  textTabs: TabItem[] = [
    { label: 'SENDING', id: 'sending', icon: '' },
    { label: 'RECEIVED', id: 'received', icon: '' }
  ];
  selectedTextTab = this.textTabs[0];

  constructor(
    public userService: UserService,
    public notificationService: NotificationService,
    public handlerService: HandlerService,
    private connectService: ConnectService,
    private dialog: MatDialog,
    private contactService: ContactService,
    private router: Router
  ) {
    this.profileSubscription = this.userService.profile$.subscribe(
      (profile) => {
        if (profile) {
          this.isPackageText = profile.text_info?.is_enabled;
          this.isPackageAutomation = profile.automation_info?.is_enabled;
          this.isSuspended = profile.subscription?.is_suspended;
          this.disableActions = [];
          if (!this.isPackageAutomation) {
            this.disableActions.push({
              icon: 'i-calendar bg-white',
              label: 'New Meeting',
              id: 'appointment'
            });
          }
        }
      }
    );

    this.loadNotifications();
    this.notificationUpdater$ = interval(60 * 1000);
    this.notificationUpdater$.subscribe(() => {
      this.loadNotifications();
    });
  }

  ngOnInit(): void {
    this.connectService.receiveLogout().subscribe(() => {
      this.logout(null);
    });
  }

  runAction(action: string): void {
    // Open New modal that corresponds to action
    switch (action) {
      case 'contact':
        this.dialog
          .open(ContactCreateComponent, DialogSettings.CONTACT)
          .afterClosed()
          .subscribe((res) => {
            if (res && res.created) {
              this.contactService.reloadPage();
            }
          });
        break;
      case 'text':
        this.dialog.open(SendTextComponent, {
          position: {
            bottom: '0px',
            right: '0px'
          },
          width: '100vw',
          panelClass: 'send-email',
          backdropClass: 'cdk-send-email',
          disableClose: false,
          data: {
            type: 'multi'
          }
        });
        break;
      case 'call':
        break;
      case 'task':
        this.dialog.open(TaskCreateComponent, DialogSettings.TASK);
        break;
      case 'deal':
        this.dialog.open(DealCreateComponent, DialogSettings.DEAL);
        break;
      case 'note':
        this.dialog.open(NoteCreateComponent, DialogSettings.NOTE);
        break;
      case 'appointment':
        break;
      case 'message':
        this.dialog.open(SendEmailComponent, {
          position: {
            bottom: '0px',
            right: '0px'
          },
          width: '100vw',
          panelClass: 'send-email',
          backdropClass: 'cdk-send-email',
          disableClose: false
        });
        break;
      case 'record':
        if (this.dialog.openDialogs.length > 0) {
          return;
        }
        this.dialog.open(RecordSettingDialogComponent, {
          position: { top: '0px' },
          width: '100%',
          height: '100%',
          panelClass: 'trans-modal',
          backdropClass: 'trans'
        });
        break;
      case 'video':
        this.router.navigate(['./materials/create/video']);
        break;
    }
    this.closeSearchBar();
  }
  logout(event: Event): void {
    // Logout Logic
    event && event.preventDefault();
    this.userService.logout().subscribe(
      () => {
        this.userService.logoutImpl();
        this.handlerService.clearData();
        this.router.navigate(['/']);
      },
      () => {
        console.log('LOG OUT FAILURE');
      }
    );
  }

  /**
   * Filter Objects
   * @param str : keyword to filter the contacts, materials ...
   */
  onFilter(str: string): void {
    this.handlerService.searchStr.next(str);
    // switch (this.currentSearchType.id) {
    //   case 'contacts':
    //     this.contactService.searchStr.next(str);
    //     break;
    //   case 'tasks':
    //     break;
    //   case 'materials':
    //     break;
    //   case 'templates':
    //     break;
    // }
  }
  changeType(type: any): void {
    this.currentSearchType = type;
  }

  toggleSearchBar(): void {
    const openSearch = this.handlerService.openSearch.getValue();
    if (openSearch) {
      this.handlerService.openSearch.next(false);
    } else {
      this.handlerService.openSearch.next(true);
      this.searchInput.nativeElement.focus();
    }
  }
  openSearchBar(): void {
    this.handlerService.openSearch.next(true);
    this.searchInput.nativeElement.focus();
  }
  closeSearchBar(): void {
    this.handlerService.openSearch.next(false);
  }
  clearSearch(): void {
    if (this.keyword) {
      this.keyword = '';
      this.handlerService.searchStr.next('');
    } else {
      this.closeSearchBar();
    }
  }

  changeTab(tab: TabItem): void {
    this.selectedTextTab = tab;
  }

  loadNotifications(): void {
    this.notificationLoadSubscription &&
      this.notificationLoadSubscription.unsubscribe();
    this.notificationLoadSubscription = this.notificationService
      .getNotificationStatus()
      .subscribe((res) => {
        if (res) {
          this.emailTasks = res['emails'] || [];
          if (this.emailTasks && this.emailTasks.length) {
            this.emailTasks.forEach((e) => {
              let failed = 0;
              let succeed = 0;
              e.tasks.forEach((_task) => {
                if (_task.exec_result) {
                  failed += _task.exec_result.failed.length;
                  if (_task.exec_result.succeed) {
                    succeed += _task.exec_result.succeed.length;
                  }
                  succeed +=
                    _task.contacts.length - _task.exec_result.failed.length;
                }
              });
              e.failed = failed;
              e.succeed = succeed;
            });
          }

          this.textTasks = res['texts'] || [];
          if (this.textTasks && this.textTasks.length) {
            this.textTasks.forEach((e) => {
              let failed = 0;
              let succeed = 0;
              let awaiting = 0;
              e.tasks.forEach((_task) => {
                if (_task.status === 'active') {
                  awaiting++;
                } else if (_task.status === 'delivered') {
                  succeed++;
                } else {
                  failed++;
                }
              });
              e.failed = failed;
              e.succeed = succeed;
              e.awaiting = awaiting;
            });
          }

          this.unreadMessageCount = res['unread'];
          this.unreadMessages = res['unreadMessages'];
          this.unreadMessages.forEach((e) => {
            if (e.contacts && e.contacts.length) {
              e.contact = new Contact().deserialize(e.contacts[0]);
            }
          });

          this.unreadNotifications = res['unreadNotifications'];
          this.notifications = res['notifications'];
        }
      });
  }

  isDisableAction(action): boolean {
    return this.disableActions.findIndex((item) => item.id === action.id) >= 0;
  }
}
