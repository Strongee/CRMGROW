import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ConnectService } from '../../services/connect.service';
import { ToastrService } from 'ngx-toastr';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-calendly-dialog',
  templateUrl: './calendly-dialog.component.html',
  styleUrls: ['./calendly-dialog.component.scss']
})
export class CalendlyDialogComponent implements OnInit {
  isConfirm = false;
  calendlyApiKey = '';

  constructor(
    private dialogRef: MatDialogRef<CalendlyDialogComponent>,
    private connectService: ConnectService,
    private toast: ToastrService,
    public userService: UserService
  ) {}

  ngOnInit(): void {}

  authCalendly(): void {
    if (this.calendlyApiKey == '') {
      return;
    }
    this.isConfirm = true;
    const token = { token: this.calendlyApiKey };
    this.connectService.connectCalendly(token).subscribe(
      (res) => {
        if (res && res['status']) {
          this.isConfirm = false;
          this.toast.success('Calendly connected successfully');
          this.dialogRef.close(res);
        }
      },
      (err) => {
        this.isConfirm = false;
      }
    );
  }
}
