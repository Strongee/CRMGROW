import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  ChangeDetectorRef
} from '@angular/core';
import { DELAY } from 'src/app/constants/variable.constants';
import { MatDialog } from '@angular/material/dialog';
import { CustomFieldAddComponent } from 'src/app/components/custom-field-add/custom-field-add.component';
import { CustomFieldDeleteComponent } from 'src/app/components/custom-field-delete/custom-field-delete.component';
import { Garbage } from 'src/app/models/garbage.model';
import { UserService } from 'src/app/services/user.service';
import { ToastrService } from 'ngx-toastr';
import { HelperService } from '../../services/helper.service';
import { FileUploader } from 'ng2-file-upload';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-lead-capture',
  templateUrl: './lead-capture.component.html',
  styleUrls: ['./lead-capture.component.scss']
})
export class LeadCaptureComponent implements OnInit {
  times = DELAY;
  garbage: Garbage = new Garbage();
  defaultField = [
    {
      id: '',
      name: 'Email',
      options: [],
      placeholder: 'email',
      type: 'text'
    },
    {
      id: '',
      name: 'Name',
      options: [],
      placeholder: 'name',
      type: 'text'
    },
    {
      id: '',
      name: 'Phone',
      options: [],
      placeholder: 'phone',
      type: 'text'
    }
  ];
  isChecked = true;
  uploadingIntroVideo = false;
  @ViewChild('introVideo') introVideo: ElementRef;
  @ViewChild('emailCheckBox') emailCheckBox;
  @ViewChild('phoneCheckBox') phoneCheckBox;
  introVideoPlaying = false;

  videoUploader: FileUploader = new FileUploader({
    url: environment.api + 'garbage/intro_video',
    authToken: this.userService.getToken(),
    itemAlias: 'video'
  });

  constructor(
    private dialog: MatDialog,
    public userService: UserService,
    private toast: ToastrService,
    private helperService: HelperService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.userService.garbage$.subscribe((res) => {
      if (res) {
        this.garbage = new Garbage().deserialize(res);
      }
    });
  }

  ngOnInit(): void {
    this.videoUploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
      if (this.videoUploader.queue.length > 1) {
        this.videoUploader.queue.splice(0, 1);
      }
    };
    this.videoUploader.onCompleteItem = (
      item: any,
      response: any,
      status: any,
      headers: any
    ) => {
      this.uploadingIntroVideo = false;
      if (status === 200) {
        try {
          response = JSON.parse(response);
          if (response['data']) {
            this.garbage['intro_video'] = '';
            this.garbage['intro_video'] = response['data']['intro_video'];
            this.userService.updateGarbage(this.garbage).subscribe(() => {
              this.toast.success(
                '',
                'Lead capture video is updated successfully.'
              );
              this.userService.updateGarbageImpl(this.garbage);
              this.replaceVideo();
            });
            this.changeDetectorRef.detectChanges();
          }
        } catch (e) {}
      } else {
        this.toast.error('Uploading Intro Video is Failed. Please try again.');
      }
    };
  }

  addField(): void {
    this.dialog
      .open(CustomFieldAddComponent, {
        position: { top: '100px' },
        width: '100vw',
        maxWidth: '400px'
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          if (res.mode == 'text') {
            const data = {
              id: (this.garbage.additional_fields.length + 1).toString(),
              name: res.field,
              placeholder: res.placeholder,
              options: [],
              type: res.mode,
              status: false
            };
            this.garbage.additional_fields.push(data);
          } else {
            const data = {
              id: (this.garbage.additional_fields.length + 1).toString(),
              name: res.field,
              placeholder: '',
              options: res.options,
              type: res.mode,
              status: false
            };
            this.garbage.additional_fields.push(data);
          }
          this.save();
        }
      });
  }

  editField(editData: any): void {
    this.dialog
      .open(CustomFieldAddComponent, {
        position: { top: '100px' },
        width: '100vw',
        maxWidth: '400px',
        data: {
          field: editData
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res && res.mode == 'text') {
          editData.name = res.field;
          editData.placeholder = res.placeholder;
          this.save();
        }
      });
  }

  deleteField(deleteData: any): void {
    this.dialog
      .open(CustomFieldDeleteComponent, {
        position: { top: '100px' },
        width: '100vw',
        maxWidth: '400px',
        data: {
          field: deleteData
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res == true) {
          const required_fields = this.garbage.additional_fields.filter(
            (field) => field.id != deleteData.id
          );
          this.garbage.additional_fields = [];
          this.garbage.additional_fields = required_fields;
          this.save();
        }
      });
  }

  statusChange(evt: any, type: string): void {
    switch (type) {
      case 'email':
        if (!this.garbage.capture_field.cell_phone) {
          this.garbage.capture_field.email = true;
          this.emailCheckBox.nativeElement.checked = true;
          this.toast.error('At least Email or Phone should be checked.');
        } else {
          this.garbage.capture_field.email = evt;
          this.save();
        }
        break;
      case 'name':
        this.garbage.capture_field.first_name = evt.target.checked;
        this.save();
        break;
      case 'phone':
        if (!this.garbage.capture_field.email) {
          this.garbage.capture_field.cell_phone = true;
          this.phoneCheckBox.nativeElement.checked = true;
          this.toast.error('At least Email or Phone should be checked.');
        } else {
          this.garbage.capture_field.cell_phone = evt;
          this.save();
        }
        break;
      default:
        const selectedField = this.garbage.additional_fields.filter(
          (field) => field.name == type
        )[0];
        if (selectedField) {
          selectedField.status = !selectedField.status;
          this.save();
        }
    }
  }

  chanageDelayTime(): void {
    this.save();
  }

  browseVideo(): void {
    this.helperService
      .promptForVideo()
      .then((video) => {
        const type = video.type;
        const name = video.name;
        if (
          type.startsWith('video') &&
          (name.toLowerCase().endsWith('mp4') ||
            name.toLowerCase().endsWith('mov'))
        ) {
          this.helperService
            .getVideoDuration(video)
            .then((duration) => {
              if (duration.duration && duration.duration <= 60000) {
                this.videoUploader.clearQueue();
                this.videoUploader.addToQueue([video]);
                this.uploadingIntroVideo = true;
                this.videoUploader.uploadAll();
                this.pauseVideo();
              } else {
                this.toast.error(
                  '',
                  'Video length should be less than 1 minute.',
                  { closeButton: true }
                );
              }
            })
            .catch((err) => {
              this.toast.error(
                "This video duration can't expected. Please try another video"
              );
            });
        } else {
          this.toast.error('Please select the *.mp4 or *.mov');
        }
      })
      .catch((err) => {
        this.toast.error("Couldn't load the Video File");
      });
  }

  toggleVideo(): void {
    const introVideoElement: HTMLVideoElement = this.introVideo.nativeElement;
    if (introVideoElement.paused) {
      introVideoElement.play();
      this.introVideoPlaying = true;
    } else {
      introVideoElement.pause();
      this.introVideoPlaying = false;
    }
  }

  pauseVideo(): void {
    const introVideoElement: HTMLVideoElement = this.introVideo.nativeElement;
    if (!introVideoElement.paused) {
      introVideoElement.pause();
      this.introVideoPlaying = false;
    }
  }

  removeVideo(): void {
    this.garbage.intro_video = '';
    this.save();
  }

  replaceVideo(): void {
    setTimeout(() => {
      const introVideoElement: HTMLVideoElement = this.introVideo.nativeElement;
      introVideoElement.load();
    }, 200);
  }

  save(): void {
    this.userService.updateGarbage(this.garbage).subscribe(() => {
      this.toast.success('Lead Capture successfully updated.');
      this.userService.updateGarbageImpl(this.garbage);
    });
  }
}
