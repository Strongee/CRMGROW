import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ConnectService } from 'src/app/services/connect.service';

@Component({
  selector: 'app-detail-error',
  templateUrl: './detail-error.component.html',
  styleUrls: ['./detail-error.component.scss']
})
export class DetailErrorComponent implements OnInit {
  errorCode: string = ''; // 402: Connect Error, 405: Connect Error, 403: Oauth Setting Error, 405: Contacts Detail Error, 406: Connect Error

  constructor(
    public dialogRef: MatDialogRef<DetailErrorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private connectService: ConnectService,
    private toast: ToastrService,
    private router: Router
  ) {
    if (this.data && this.data.errorCode) {
      this.errorCode = this.data.errorCode;
    }
  }

  ngOnInit(): void {}

  connectMail(type: string): void {
    if (type === 'gmail' || type === 'outlook') {
      this.connectService.requestSyncUrl(type).subscribe(
        (res) => {
          location.href = res['data'];
        },
        () => {
          this.toast.error('', 'Request authorization url Error is happened.', {
            closeButton: true
          });
        }
      );
    }
  }

  connectAnotherMail(): void {
    this.connectService.connectAnotherService().subscribe(
      () => {
        this.dialogRef.close();
        location.reload();
      },
      () => {
        this.toast.error('', 'Connecting error is happened.', {
          closeButton: true
        });
      }
    );
  }

  logout(): void {
    this.connectService.sendLogout();
    this.dialogRef.close();
  }

  goToIntegration(): void {
    this.router.navigate([`/settings/integration`]);
    this.dialogRef.close();
  }

  showError(error: any): string {
    if (error) {
      if (typeof error === 'object') {
        if (error instanceof Array) {
          return error.join(', ');
        }
        return JSON.stringify(error);
      } else {
        return error;
      }
    } else {
      return 'Unknown Error';
    }
  }
}
