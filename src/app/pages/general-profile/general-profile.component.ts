import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CountryISO } from 'ngx-intl-tel-input';
import { ToastrService } from 'ngx-toastr';
import { AvatarEditorComponent } from 'src/app/components/avatar-editor/avatar-editor.component';
import { TIMEZONE, COMPANIES } from 'src/app/constants/variable.constants';
import { User } from 'src/app/models/user.model';
import { HelperService } from 'src/app/services/helper.service';
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
  saving = false;

  constructor(
    private userService: UserService,
    private helperService: HelperService,
    private dialog: MatDialog,
    private toast: ToastrService
  ) {
    this.userService.profile$.subscribe((profile) => {
      this.user = profile;
    });
  }

  ngOnInit(): void {}

  openProfilePhoto(): void {
    this.helperService
      .promptForFiles('image/jpg, image/png, image/jpeg, image/webp, image/bmp')
      .then((files) => {
        const file: File = files[0];
        const type = file.type;
        const validTypes = [
          'image/jpg',
          'image/png',
          'image/jpeg',
          'image/webp',
          'image/bmp'
        ];
        if (validTypes.indexOf(type) === -1) {
          this.toast.warning('Unsupported File Selected.');
          return;
        }
        const imageEditor = this.dialog.open(AvatarEditorComponent, {
          width: '98vw',
          maxWidth: '400px',
          data: {
            fileInput: file
          }
        });
        imageEditor.afterClosed().subscribe((res) => {
          if (res) {
            this.user.picture_profile = res;
          }
        });
      })
      .catch((err) => {
        this.toast.error('File Select', err);
      });
  }

  updateProfile(form: any): void {
    this.saving = true;
    this.userService.updateProfile(form).subscribe((data) => {
      this.userService.updateProfileImpl(data);
      this.saving = false;
    });
  }

  handleAddressChange(evt: any): void {
    this.user.location = evt.formatted_address;
  }

  confirmPhone(): void {}
}
