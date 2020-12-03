import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ContactCreateComponent } from 'src/app/components/contact-create/contact-create.component';
import { NoteCreateComponent } from 'src/app/components/note-create/note-create.component';
import { TaskCreateComponent } from 'src/app/components/task-create/task-create.component';
import { DialogSettings } from 'src/app/constants/variable.constants';
import { User } from 'src/app/models/user.model';
import { ContactService } from 'src/app/services/contact.service';
import { StoreService } from 'src/app/services/store.service';
import { TaskService } from 'src/app/services/task.service';
import { UserService } from 'src/app/services/user.service';
import { ChartType } from 'chart.js';
import { MultiDataSet, Label, Color } from 'ng2-charts';

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
  keyword = '';

  chartLabels: Label[] = ['Failed', 'Delivered'];
  chartData: MultiDataSet = [[50, 450]];
  chartType: ChartType = 'doughnut';
  chartOptions: any = {
    legend: {
      display: false
    },
    tooltips: {
      enabled: false
    }
  };
  chartColor: Color[] = [{ backgroundColor: ['#FF0000', '#00916E'] }];
  sentSms = [
    {
      name: 'John Doe',
      cellPhone: '+16309844707',
      status: 'delivered',
      created_at: '11.25 at 7:37 PM'
    },
    {
      name: 'John Doe',
      cellPhone: '+16309844707',
      status: 'failed',
      created_at: '11.25 at 7:37 PM'
    },
    {
      name: 'John Doe',
      cellPhone: '+16309844707',
      status: 'delivered',
      created_at: '11.25 at 7:37 PM'
    },
    {
      name: 'John Doe',
      cellPhone: '+16309844707',
      status: 'failed',
      created_at: '11.25 at 7:37 PM'
    },
    {
      name: 'John Doe',
      cellPhone: '+16309844707',
      status: 'delivered',
      created_at: '11.25 at 7:37 PM'
    },
    {
      name: 'John Doe',
      cellPhone: '+16309844707',
      status: 'delivered',
      created_at: '11.25 at 7:37 PM'
    },
    {
      name: 'John Doe',
      cellPhone: '+16309844707',
      status: 'failed',
      created_at: '11.25 at 7:37 PM'
    },
    {
      name: 'John Doe',
      cellPhone: '+16309844707',
      status: 'failed',
      created_at: '11.25 at 7:37 PM'
    },
    {
      name: 'John Doe',
      cellPhone: '+16309844707',
      status: 'failed',
      created_at: '11.25 at 7:37 PM'
    },
    {
      name: 'John Doe',
      cellPhone: '+16309844707',
      status: 'delivered',
      created_at: '11.25 at 7:37 PM'
    }
  ];

  constructor(
    public userService: UserService,
    private storeService: StoreService,
    private contactService: ContactService,
    private dialog: MatDialog,
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

  /**
   * Filter Objects
   * @param str : keyword to filter the contacts, materials ...
   */
  onFilter(str: string): void {
    switch (this.currentSearchType.id) {
      case 'contacts':
        this.contactService.searchStr.next(str);
        break;
      case 'tasks':
        break;
      case 'materials':
        break;
      case 'templates':
        break;
    }
  }
  changeType(type: any): void {
    this.currentSearchType = type;
  }

  clear(): void {
    this.sentSms = [];
  }
}
