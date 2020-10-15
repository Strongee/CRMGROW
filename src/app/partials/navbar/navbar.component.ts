import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user.model';
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
    public taskService: TaskService
  ) {}

  ngOnInit(): void {
    this.taskService.loadData();
  }

  runAction(action): void {
    // Open New modal that corresponds to action
  }
  logout(event: PointerEvent): void {
    // Logout Logic
  }

  changeType(type: any): void {
    this.currentSearchType = type;
  }
}
