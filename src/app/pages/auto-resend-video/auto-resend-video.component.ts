import { Component, OnInit } from '@angular/core';
import { AUTO_RESEND_DELAY } from '../../constants/variable.constants';
import { Garbage } from 'src/app/models/garbage.model';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-auto-resend-video',
  templateUrl: './auto-resend-video.component.html',
  styleUrls: ['./auto-resend-video.component.scss']
})
export class AutoResendVideoComponent implements OnInit {
  delays;
  garbage: Garbage = new Garbage();
  saving = false;
  constructor(public userService: UserService) {
    this.userService.garbage$.subscribe((res) => {
      this.garbage = new Garbage().deserialize(res);
    });
  }

  ngOnInit(): void {
    this.delays = AUTO_RESEND_DELAY;
  }

  selectTemplate(event: any, resend_data: any, type: string): void {
    if (type == 'email') {
      resend_data.email_canned_message = event._id;
    }
    if (type == 'sms') {
      resend_data.sms_canned_message = event._id;
    }
  }

  changeToggle(evt: any, resend_data: any): void {
    resend_data.enabled = evt.target.checked;
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
