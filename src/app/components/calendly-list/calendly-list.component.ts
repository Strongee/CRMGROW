import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConnectService } from '../../services/connect.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-calendly-list',
  templateUrl: './calendly-list.component.html',
  styleUrls: ['./calendly-list.component.scss']
})
export class CalendlyListComponent implements OnInit {
  calendlyList = [];
  calendlyKey = '';

  constructor(
    private dialogRef: MatDialogRef<CalendlyListComponent>,
    private connectService: ConnectService,
    private toast: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.calendlyKey = this.data.key;
  }

  ngOnInit(): void {
    this.connectService.getEvent().subscribe((res) => {
      if (res) {
        this.calendlyList = [...this.calendlyList, ...res['data']];
        if (!this.calendlyKey) {
          this.calendlyList.forEach((calendly) => {
            calendly.selectStatus = false;
          });
        } else {
          this.calendlyList.forEach((calendly) => {
            if (calendly.id == this.calendlyKey) {
              calendly.selectStatus = true;
            } else {
              calendly.selectStatus = false;
            }
          });
        }
      }
    });
  }

  setEvent(index: number): void {
    const calendly = {
      link: this.calendlyList[index].attributes.url,
      id: this.calendlyList[index].id
    };
    this.connectService.setEvent(calendly).subscribe((res) => {
      if (res) {
        this.toast.success('Event is selected successfully.');
        this.dialogRef.close();
      }
    });
  }
}
