import { Component, OnInit } from '@angular/core';
import { AUTO_FOLLOW_DELAY } from '../../constants/variable.constants';
import { Garbage } from 'src/app/models/garbage.model';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-auto-follow-up',
  templateUrl: './auto-follow-up.component.html',
  styleUrls: ['./auto-follow-up.component.scss']
})
export class AutoFollowUpComponent implements OnInit {
  watch_delay = '';
  notwatch_delay = '';
  watch_content = '';
  notwatch_content = '';
  delays;
  garbage: Garbage = new Garbage();
  saving = false;

  constructor(public userService: UserService) {
    this.userService.garbage$.subscribe((res) => {
      this.garbage = new Garbage().deserialize(res);
    });
  }

  ngOnInit(): void {
    this.delays = AUTO_FOLLOW_DELAY;
  }

  changeToggle(evt: any, follow_data: any): void {
    follow_data.enabled = evt.target.checked;
  }

  save(): void {
    this.saving = true;
    this.userService.updateGarbage(this.garbage).subscribe(
      () => {
        this.saving = false;
        this.userService.updateGarbageImpl(this.garbage);
      },
      () => {
        this.saving = false;
      }
    );
  }
}
