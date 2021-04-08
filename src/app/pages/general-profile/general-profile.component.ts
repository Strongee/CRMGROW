import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CountryISO } from 'ngx-intl-tel-input';
import { ToastrService } from 'ngx-toastr';
import { AvatarEditorComponent } from 'src/app/components/avatar-editor/avatar-editor.component';
import {
  TIMEZONE,
  COMPANIES,
  PHONE_COUNTRIES
} from 'src/app/constants/variable.constants';
import { User } from 'src/app/models/user.model';
import { HelperService } from 'src/app/services/helper.service';
import { UserService } from 'src/app/services/user.service';
import { FileUploader } from 'ng2-file-upload';
import { environment } from 'src/environments/environment';
import { ConfirmComponent } from 'src/app/components/confirm/confirm.component';
import { Subscription } from 'rxjs';
import { PhoneInputComponent } from 'src/app/components/phone-input/phone-input.component';

@Component({
  selector: 'app-general-profile',
  templateUrl: './general-profile.component.html',
  styleUrls: ['./general-profile.component.scss']
})
export class GeneralProfileComponent implements OnInit, OnDestroy {
  user: User = new User();
  name = '';
  userEmail = '';
  phoneNumber = {};
  userCompany = '';
  website = '';
  timezone = '';
  address = '';
  timezones = TIMEZONE;
  companies = COMPANIES;
  countries: CountryISO[] = PHONE_COUNTRIES;
  CountryISO = CountryISO;
  saving = false;
  defaultTimeZone = true;
  public uploader: FileUploader = new FileUploader({
    url: environment.api + 'file',
    authToken: this.userService.getToken(),
    itemAlias: 'photo'
  });

  profileSubscription: Subscription;
  @ViewChild('phoneControl') phoneControl: PhoneInputComponent;

  constructor(
    private userService: UserService,
    private helperService: HelperService,
    private dialog: MatDialog,
    private toast: ToastrService
  ) {
    this.profileSubscription && this.profileSubscription.unsubscribe();
    this.profileSubscription = this.userService.profile$.subscribe(
      (profile) => {
        this.user = profile;
        this.name = this.user.user_name;
        this.userEmail = this.user.email;
        this.phoneNumber = this.user.phone;
        this.userCompany = this.user.company;
        this.website = this.user.learn_more;
        this.timezone = this.user.time_zone_info;
        this.address = this.user.location;
      }
    );
  }

  ngOnInit(): void {
    this.uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
      if (this.uploader.queue.length > 1) {
        this.uploader.queue.splice(0, 1);
      }
    };
    this.uploader.onCompleteItem = (
      item: any,
      response: any,
      status: any,
      headers: any
    ) => {
      try {
        response = JSON.parse(response);
        if (response.status) {
          this.user.picture_profile = response.data.url;
          const picture_profile = this.user.picture_profile;
          this.userService.updateProfile({ picture_profile }).subscribe(() => {
            this.userService.updateProfileImpl({ picture_profile });
          });
          this.toast.success('Profile picture updating is successfully.');
        } else {
          const error = 'Profile picture updating is failed.';
          this.toast.error(error);
        }
      } catch (e) {
        const error = 'Profile picture updating is failed.';
        this.toast.error(error);
      }
    };
  }

  ngOnDestroy(): void {
    this.profileSubscription && this.profileSubscription.unsubscribe();
  }

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
          disableClose: true,
          data: {
            fileInput: file
          }
        });
        imageEditor.afterClosed().subscribe((res) => {
          if (res != false && res != '') {
            if (res == null) {
              this.user.picture_profile = '';
              const picture_profile = this.user.picture_profile;
              this.userService
                .updateProfile({ picture_profile })
                .subscribe(() => {
                  this.userService.updateProfileImpl({ picture_profile });
                });
            } else {
              this.setProfileImage(res);
            }
          }
        });
      })
      .catch((err) => {
        this.toast.error('File Select', err);
      });
  }

  setProfileImage(evt: any): void {
    this.user.picture_profile = evt;
    this.urltoFile(evt, 'profile.jpg', 'image/jpeg').then((file) => {
      this.uploader.addToQueue([file]);
      this.uploader.uploadAll();
    });
  }

  urltoFile(url: any, filename: string, mimeType: string): any {
    mimeType = mimeType || (url.match(/^data:([^;]+);/) || '')[1];
    return fetch(url)
      .then(function (res) {
        return res.arrayBuffer();
      })
      .then(function (buf) {
        let returnFile;
        try {
          returnFile = new File([buf], filename, { type: mimeType });
        } catch {
          const blob = new Blob([buf], { type: mimeType });
          Object.assign(blob, {});
          returnFile = blob as File;
        }
        return returnFile;
      });
  }

  updateProfile(form: any): void {
    if (this.checkPhoneRequired() || !this.checkPhoneValid()) {
      return;
    }

    this.saving = true;
    this.userService.updateProfile(form).subscribe((data) => {
      this.userService.updateProfileImpl(data);
      this.saving = false;
      this.toast.success('Profile has been updated successfully.');
    });
  }

  handleAddressChange(evt: any): void {
    this.address = evt.formatted_address;
  }

  confirmPhone(event): void {}

  confirmCompany(): void {
    if (this.userCompany == 'other') {
      this.dialog.open(ConfirmComponent, {
        data: {
          title: 'Change Company',
          message: 'You will lose all eXp materials. Are you sure?',
          cancelLabel: 'No',
          confirmLabel: 'Yes'
        }
      });
    }
  }

  checkPhoneRequired(): boolean {
    if (!this.phoneNumber || !this.phoneControl) {
      return true;
    }
    if (!Object.keys(this.phoneNumber)) {
      return true;
    }
    return false;
  }
  checkPhoneValid(): boolean {
    if (!this.phoneNumber || !this.phoneControl) {
      return true;
    }
    if (Object.keys(this.phoneNumber).length && !this.phoneControl.valid) {
      return false;
    }
    return true;
  }
}
