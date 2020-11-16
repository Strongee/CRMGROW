import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ContactCreateComponent } from 'src/app/components/contact-create/contact-create.component';
import { NoteCreateComponent } from 'src/app/components/note-create/note-create.component';
import { TaskCreateComponent } from 'src/app/components/task-create/task-create.component';
import { DialogSettings } from 'src/app/constants/variable.constants';
import { User } from 'src/app/models/user.model';
import { StoreService } from 'src/app/services/store.service';
import { TaskService } from 'src/app/services/task.service';
import { UserService } from 'src/app/services/user.service';

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
    { icon: 'i-message bg-white', label: 'Send Message', id: 'message' },
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

  constructor(
    public userService: UserService,
    private dialog: MatDialog,
    private storeService: StoreService,
    private router: Router
  ) {}

  ngOnInit(): void {}

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
        break;
      case 'record':
        break;
      case 'video':
        break;
    }
  }
  logout(event: Event): void {
    // Logout Logic
    event.preventDefault();
    this.userService.logout().subscribe(
      () => {
        this.userService.logoutImpl();
        this.storeService.clearData();
        this.router.navigate(['/']);
      },
      () => {
        console.log('LOG OUT FAILURE');
      }
    );
  }

  changeType(type: any): void {
    this.currentSearchType = type;
  }
}
