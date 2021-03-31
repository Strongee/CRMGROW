import { Component, OnInit } from '@angular/core';
import { AUTO_RESEND_DELAY } from '../../constants/variable.constants';
import { Garbage } from 'src/app/models/garbage.model';
import { UserService } from 'src/app/services/user.service';
import { Location } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-auto-resend-video',
  templateUrl: './auto-resend-video.component.html',
  styleUrls: ['./auto-resend-video.component.scss']
})
export class AutoResendVideoComponent implements OnInit {
  delays;
  garbage: Garbage = new Garbage();
  constructor(
    public userService: UserService,
    private location: Location,
    private toast: ToastrService
  ) {
    this.userService.garbage$.subscribe((res) => {
      this.garbage = new Garbage().deserialize(res);
    });
  }

  ngOnInit(): void {
    this.delays = AUTO_RESEND_DELAY;
  }

  changeToggle(evt: any, resend_data: any): void {
    resend_data.enabled = evt.target.checked;
    this.save();
  }

  save(): void {
    this.userService.updateGarbage(this.garbage).subscribe(() => {
      this.toast.success('Auto Resend Video successfully updated.');
      this.userService.updateGarbageImpl(this.garbage);
    });
  }

  cancel(): void {
    this.location.back();
  }
}
