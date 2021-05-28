import { Component, OnInit } from '@angular/core';
import { SmsService } from '../../services/sms.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-phone',
  templateUrl: './add-phone.component.html',
  styleUrls: ['./add-phone.component.scss']
})
export class AddPhoneComponent implements OnInit {
  loading = false;
  saving = false;
  searchCode = '';
  phoneNumbers = [];
  selectedPhone = '';
  suggestPhones = [
    {
      phone: '(303) 431-3301',
      location: 'Denver, CO'
    },
    {
      phone: '(303) 431-3302',
      location: 'Denver, CO'
    },
    {
      phone: '(303) 431-3303',
      location: 'Denver, CO'
    },
    {
      phone: '(303) 431-3301',
      location: 'Denver, CO'
    },
    {
      phone: '(303) 431-3302',
      location: 'Denver, CO'
    },
    {
      phone: '(303) 431-3303',
      location: 'Denver, CO'
    },
    {
      phone: '(303) 431-3301',
      location: 'Denver, CO'
    },
    {
      phone: '(303) 431-3302',
      location: 'Denver, CO'
    },
    {
      phone: '(303) 431-3303',
      location: 'Denver, CO'
    }
  ];
  constructor(
    private smsService: SmsService,
    private dialogRef: MatDialogRef<AddPhoneComponent>
  ) {}

  ngOnInit(): void {
    this.searchPhone();
  }

  selectPhone(phone: string): void {
    this.selectedPhone = phone;
  }

  isSelected(phone: string): any {
    return this.selectedPhone === phone;
  }

  searchPhone(): void {
    this.loading = true;
    let data;
    if (this.searchCode == '') {
      data = {};
    } else {
      data = {
        searchCode: parseInt(this.searchCode).toString()
      };
    }

    this.smsService.searchNumbers(data).subscribe((res) => {
      this.loading = false;
      this.phoneNumbers = res?.data;
    });
  }

  save(): void {
    if (this.selectedPhone == '') {
      return;
    } else {
      this.saving = true;
      const data = {
        number: this.selectedPhone
      };
      this.smsService.buyNumbers(data).subscribe((res) => {
        if (res?.status) {
          this.saving = false;
          this.dialogRef.close(this.selectedPhone);
        } else {
          this.saving = false;
        }
      });
    }
  }

  cancel(): void {}
}
