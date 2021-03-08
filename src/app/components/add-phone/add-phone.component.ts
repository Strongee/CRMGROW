import { Component, OnInit } from '@angular/core';
import { SmsService } from '../../services/sms.service';

@Component({
  selector: 'app-add-phone',
  templateUrl: './add-phone.component.html',
  styleUrls: ['./add-phone.component.scss']
})
export class AddPhoneComponent implements OnInit {
  searchCode = '';
  selectedPhone = {};
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
    private smsService: SmsService
  ) {}

  ngOnInit(): void {
    this.searchPhone();
  }

  selectPhone(phone): void {
    this.selectedPhone = phone;
  }

  isSelected(phone): any {
    return this.selectedPhone === phone;
  }

  searchPhone(): void {
    const data = {
      // tslint:disable-next-line:radix
      searchCode: parseInt(this.searchCode)
    };
    this.smsService.searchNumbers(data).subscribe((res) => {
      if (res) {
      }
    });
  }

  save(): void {}

  cancel(): void {}
}
