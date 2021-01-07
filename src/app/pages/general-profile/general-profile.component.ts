import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CountryISO } from 'ngx-intl-tel-input';
import { ToastrService } from 'ngx-toastr';
import { AvatarEditorComponent } from 'src/app/components/avatar-editor/avatar-editor.component';
import { TIMEZONE, COMPANIES } from 'src/app/constants/variable.constants';
import { User } from 'src/app/models/user.model';
import { HelperService } from 'src/app/services/helper.service';
import { UserService } from 'src/app/services/user.service';
import { FileUploader } from 'ng2-file-upload';
import { environment } from 'src/environments/environment';

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
  public uploader: FileUploader = new FileUploader({
    url: environment.api + 'file',
    authToken: this.userService.getToken(),
    itemAlias: 'photo'
  });

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
        console.log('###', response);
        if (response.status) {
          this.user.picture_profile = response.data.url;
          const picture_profile = this.user.picture_profile;
          this.userService.updateProfile({ picture_profile }).subscribe(() => {
            this.userService.updateProfileImpl({ picture_profile });
          });
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
    // console.log('image data', evt);
    // this.helperService.generateAvatar(evt).then((data) => {
      
    // });
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
