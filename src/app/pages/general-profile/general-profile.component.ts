import { Component, OnInit } from '@angular/core';
import { CountryISO } from 'ngx-intl-tel-input';
import { TIMEZONE, COMPANIES } from 'src/app/constants/variable.constants';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-general-profile',
  templateUrl: './general-profile.component.html',
  styleUrls: ['./general-profile.component.scss']
})
export class GeneralProfileComponent implements OnInit {
  user: User = new User();
  timezones = TIMEZONE;
  companies = COMPANIES;
  countries: CountryISO[] = [
    CountryISO.UnitedStates,
    CountryISO.UnitedKingdom,
    CountryISO.Canada,
    CountryISO.SouthAfrica
  ];
  CountryISO = CountryISO;

  constructor(private userService: UserService) {
    this.userService.profile.subscribe((profile) => {
      this.user = new User().deserialize({ ...profile });
      console.log('###', this.user);
    });
  }

  ngOnInit(): void {}

  openProfilePhoto(): void {}

  updateProfile(form: any): void {
    this.userService.updateProfile(form).subscribe((data) => {
      this.userService.updateProfileImpl(data);
    });
  }

  handleAddressChange(evt) {
    this.user.location = evt.formatted_address;
  }

  confirmPhone(): void {}
}
