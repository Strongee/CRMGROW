import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ContactCreateComponent } from 'src/app/components/contact-create/contact-create.component';
import { NoteCreateComponent } from 'src/app/components/note-create/note-create.component';
import { TaskCreateComponent } from 'src/app/components/task-create/task-create.component';
import { DialogSettings } from 'src/app/constants/variable.constants';
import { ContactService } from 'src/app/services/contact.service';
import { StoreService } from 'src/app/services/store.service';
import { UserService } from 'src/app/services/user.service';
import { RecordSettingDialogComponent } from '../../components/record-setting-dialog/record-setting-dialog.component';
import { SendEmailComponent } from '../../components/send-email/send-email.component';
import { HandlerService } from 'src/app/services/handler.service';
import { NotificationService } from 'src/app/services/notification.service';
import { ConnectService } from 'src/app/services/connect.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  actions: any[] = [
    { icon: 'i-plus bg-white', label: 'Add new Contact', id: 'contact' },
    { icon: 'i-task bg-white', label: 'Add new Task', id: 'task' },
    { icon: 'i-template bg-white', label: 'Add new Note', id: 'note' },
    { icon: 'i-message bg-white', label: 'Send Email', id: 'message' },
    { icon: 'i-record bg-white', label: 'Record Video', id: 'record' },
    { icon: 'i-upload bg-white', label: 'Upload Video', id: 'video' }
  ];

  searchDataTypes: any[] = [
    { label: 'Contacts', id: 'contacts' },
    { label: 'Tasks', id: 'tasks' },
    { label: 'Materials', id: 'materials' },
    { label: 'Templates', id: 'templates' }
  ];
  currentSearchType: any = this.searchDataTypes[0];
  keyword = '';

  constructor(
    public userService: UserService,
    public notificationService: NotificationService,
    public handlerService: HandlerService,
    private connectService: ConnectService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.connectService.receiveLogout().subscribe(() => {
      this.logout(null);
    });
  }

  runAction(action: string): void {
    // Open New modal that corresponds to action
    switch (action) {
      case 'contact':
        this.dialog.open(ContactCreateComponent, DialogSettings.CONTACT);
        break;
      case 'task':
        this.dialog.open(TaskCreateComponent, DialogSettings.TASK);
        break;
      case 'note':
        this.dialog.open(NoteCreateComponent, DialogSettings.NOTE);
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
        this.router.navigate(['./materials/create']);
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
    }
  }
  openSearchBar(): void {
    this.handlerService.openSearch.next(true);
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
}
