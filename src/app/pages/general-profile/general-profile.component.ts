import { Component, OnInit } from '@angular/core';
import { CountryISO } from 'ngx-intl-tel-input';
import { TIMEZONE } from 'src/app/constants/variable.constants';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-general-profile',
  templateUrl: './general-profile.component.html',
  styleUrls: ['./general-profile.component.scss']
})
export class GeneralProfileComponent implements OnInit {
  user: User = new User();
  timezones = TIMEZONE;
  countries: CountryISO[] = [
    CountryISO.UnitedStates,
    CountryISO.UnitedKingdom,
    CountryISO.Canada,
    CountryISO.SouthAfrica
  ];
  CountryISO = CountryISO;

  constructor() {}

  ngOnInit(): void {}

  openProfilePhoto(): void {}

  updateProfile(): void {}

  confirmPhone(): void {}
}
