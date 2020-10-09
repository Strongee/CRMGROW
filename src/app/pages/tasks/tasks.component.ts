import { Component, OnInit } from '@angular/core';
import { TaskService } from 'src/app/services/task.service';
import { UserService } from 'src/app/services/user.service';
import { TabItem, TabOption } from '../../utils/data.types';
@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent implements OnInit {
  tabs: TabItem[] = [
    { icon: 'i-icon i-task', label: 'Tasks', id: 'tasks' },
    { icon: 'i-icon i-notification', label: 'Activity', id: 'activities' }
  ];
  selectedTab: TabItem = this.tabs[0];

  options: TabOption[] = [
    { label: 'Set Date', value: 'date' },
    { label: 'Set Duration', value: 'duration' }
  ];
  selectedOption = this.options[0].value;

  enabled = false;

  constructor(
    public userService: UserService,
    public taskService: TaskService
  ) {}

  ngOnInit(): void {
    // this.taskService.loadData();
    this.taskService.loadDataImpl().subscribe(res => {
      console.log('RESSSSSS');
    });
    this.taskService.loadDataImpl().subscribe(res => {
      console.log('RESSSSSS1111');
    });
  }

  changeTab(event: TabItem): void {
    this.selectedTab = event;
    this.taskService.loadDataImpl().subscribe(res => {
      console.log('RESSSSSSCRES');
    });
  }

  toggleEnabled(): void {
    this.taskService.id = Math.floor(Math.random() * 20);
    console.log(this.taskService.id);
    this.enabled = !this.enabled;

    this.taskService.loadTaskImpl().subscribe(res => {
      console.log("RESST ASK");
    })
  }
}
