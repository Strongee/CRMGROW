import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
  ChangeDetectorRef
} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NotifyComponent } from '../notify/notify.component';
import { FileUploader } from 'ng2-file-upload';
import { environment } from 'src/environments/environment';
import { UserService } from '../../services/user.service';
import { HelperService } from 'src/app/services/helper.service';
import { ToastrService } from 'ngx-toastr';
import { MaterialService } from 'src/app/services/material.service';
import * as ebml from 'ts-ebml';
import { timer } from 'rxjs';
import * as RecordRTC from 'recordrtc';
import { ConfirmComponent } from '../confirm/confirm.component';

@Component({
  selector: 'app-record-setting-dialog',
  templateUrl: './record-setting-dialog.component.html',
  styleUrls: ['./record-setting-dialog.component.scss']
})
export class RecordSettingDialogComponent implements OnInit, AfterViewInit {
  hasCamera = false;
  hasMic = false;
  isCamAlreadyCaptured = false;
  isMicAlreadyCaptured = false;

  @ViewChild('video') video: ElementRef;

  recorder;
  deviceConstraint = {};

  screenStream;
  cameraStream;

  screenFlag = false;
  cameraFlag = false;
  micFlag = false;
  micRecording = false;
  mode = 'screen';

  recording = false;
  countNum = 3;

  recordedFile;
  recordedData;

  cameraList = [];
  micList = [];
  selectedCamera = '';
  selectedMic = '';
  submitted = false;
  hovered = '';

  uploader: FileUploader = new FileUploader({
    url: environment.api + 'video',
    authToken: this.userService.getToken(),
    itemAlias: 'video'
  });

  videoObj = {
    thumbnail: '',
    title: '',
    description: ''
  };
  thumbnailLoading = false;

  pauseFlag = false;

  uploading = false;
  uploadTimer: any;
  uploadTimeSubscriber: any;
  uploaded_time = 0;

  collapse = false;

  generatingThumb = false;

  recordStep = 1;

  constructor(
    private dialogRef: MatDialogRef<RecordSettingDialogComponent>,
    private dialog: MatDialog,
    private userService: UserService,
    private helperService: HelperService,
    private toast: ToastrService,
    private materialService: MaterialService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

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
        if (response['status']) {
          const video = { ...response['data'] };
          this.updateVideo(video);
        } else {
        }
      } catch (e) {}
    };

    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator['enumerateDevices'] = function (callback) {
        navigator.mediaDevices.enumerateDevices().then(callback);
      };

      this.checkDeviceSupport(() => {
        if (this.hasCamera) {
          this.deviceConstraint['video'] = {};
        }
        if (this.hasMic) {
          this.deviceConstraint['audio'] = {};
        }
      });

      this.initDeviceList();
    } else {
      this.showAlert(
        'This browser or webpage does not support the media devices(Camera and Microphone).'
      );
    }
  }

  ngAfterViewInit(): void {}

  openPreviewDialog(): void {
    this.helperService
      .promptForImage()
      .then((imageFile) => {
        this.thumbnailLoading = true;
        this.helperService
          .generateImageThumbnail(imageFile)
          .then((thumbnail) => {
            this.videoObj['thumbnail'] = thumbnail;
            this.videoObj['custom_thumbnail'] = true;
            this.helperService
              .generateImageThumbnail(imageFile, 'video_play')
              .then((image) => {
                this.videoObj['site_image'] = image;
                this.thumbnailLoading = false;
              })
              .catch((err) => {
                console.log('Video Meta Image Load Error', err);
                this.thumbnailLoading = false;
              });
          })
          .catch(() => {
            this.thumbnailLoading = false;
            this.toast.error("Can't Load this image");
          });
      })
      .catch(() => {
        this.toast.error("Can't read this image");
      });
  }

  download(): void {
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = this.recordedFile;
    a.download = 'record_' + new Date().getTime() + '.webm';
    a.click();
  }

  upload(): void {
    let file;
    try {
      file = new File([this.recordedData], 'record.webm', {
        type: 'video/webm'
      });
    } catch {
      const blob = new Blob([this.recordedData], { type: 'video/webm' });
      blob['name'] = 'record.webm';
      Object.assign(blob, {});
      file = blob as File;
    }
    this.uploader.addToQueue([file]);
    this.uploadVideo();
  }

  uploadVideo(): void {
    this.uploading = true;
    this.uploader.uploadAll();
    this.uploadTimer = timer(0, 500);
    this.uploadTimeSubscriber = this.uploadTimer.subscribe((timer) => {
      if (this.uploaded_time < 60) {
        this.uploaded_time += 0.2;
      } else if (this.uploaded_time >= 60 && this.uploaded_time <= 80) {
        this.uploaded_time += 0.1;
      } else if (this.uploaded_time > 80 && this.uploaded_time <= 95) {
        this.uploaded_time += 0.05;
      }
    });
  }

  updateVideo(video): void {
    const videoId = video._id;
    const newVideo = { ...video };
    delete newVideo.created_at;
    delete newVideo._v;
    delete newVideo.user;
    delete newVideo._id;
    newVideo.title = this.videoObj.title;
    newVideo.description = this.videoObj.description;
    newVideo.duration = this.videoObj['duration'];
    newVideo.thumbnail = this.videoObj.thumbnail;
    newVideo.custom_thumbnail = this.videoObj['custom_thumbnail'];
    newVideo.site_image = this.videoObj['site_image'];
    newVideo.recording = true;
    this.video['url'] = video.url;
    this.generatingThumb = true;
    this.materialService.uploadVideoDetail(videoId, newVideo).subscribe(
      (res) => {
        this.generatingThumb = false;
        this.uploading = false;
        this.toast.success('Video is uploaded successfully.');
        // this.signalService.recordedVideoSignal({
        //   ...res['data'],
        //   _id: videoId
        // });
        this.dialogRef.close({ ...res, _id: videoId });
        // this.closeEvent.emit()
      },
      (err) => {
        this.uploading = false;
        this.toast.success(
          'Video is uploaded. But the video information is not saved.'
        );
      }
    );
  }

  toggleRecording(): void {
    this.pauseFlag = !this.pauseFlag;
    if (this.pauseFlag) {
      this.recorder.pauseRecording();
    } else {
      this.recorder.resumeRecording();
    }
  }

  count(): void {
    this.countNum = 3;
    const counter = setInterval(() => {
      this.countNum--;
      if (this.countNum === 0) {
        this.recordStep = 3;
        setTimeout(() => {
          this.recordImpl();
        }, 500);
        clearInterval(counter);
      }
    }, 1000);
  }

  setRecordMode(mode: string): void {
    if (mode === 'screenCam') {
      this.mode = mode;
      this.openApplication();
    } else if (mode === 'camera') {
      if (this.hasCamera) {
        if (this.isCamAlreadyCaptured) {
          this.mode = 'camera';
        } else {
          navigator.mediaDevices
            .getUserMedia({ video: true })
            .then(() => {
              this.mode = 'camera';
            })
            .catch(() => {
              this.dialog.open(NotifyComponent, {
                position: { top: '100px' },
                width: '100vw',
                maxWidth: '400px',
                data: {
                  message: 'Camera is denied on this page.'
                }
              });
            });
        }
      } else {
        this.dialog.open(NotifyComponent, {
          position: { top: '100px' },
          width: '100vw',
          maxWidth: '400px',
          data: {
            message: 'Camera is not connected. Please connect the camera.'
          }
        });
      }
    } else if (mode === 'screen') {
      this.mode = mode;
    }
  }

  screenMode(): void {
    if (this.mode === 'screen') {
      return;
    }
    this.screenStream.width = window.screen.width;
    this.screenStream.height = window.screen.height;
    this.screenStream.fullcanvas = true;

    this.cameraStream.width = 0;
    this.cameraStream.height = 0;
    this.cameraStream.fullcanvas = false;

    this.mode = 'screen';
  }

  cameraMode(): void {
    if (this.mode === 'camera') {
      return;
    }
    this.screenStream.width = 0;
    this.screenStream.height = 0;
    this.screenStream.fullcanvas = false;

    this.cameraStream.width = window.screen.width;
    this.cameraStream.height = window.screen.height;
    this.cameraStream.fullcanvas = true;
    this.cameraStream.top = 0;
    this.cameraStream.left = 0;

    this.mode = 'camera';
  }

  screenCameraMode(): void {
    if (this.mode === 'screenCam') {
      return;
    }
    this.screenStream.width = window.screen.width;
    this.screenStream.height = window.screen.height;
    this.screenStream.fullcanvas = true;

    this.cameraStream.width = 320;
    this.cameraStream.height = 240;
    this.cameraStream.fullcanvas = false;
    this.cameraStream.top = 15;
    this.cameraStream.left = this.screenStream.width - this.cameraStream.width;

    this.mode = 'screenCam';
  }

  toggleMic(): void {
    if (this.cameraStream) {
      [this.cameraStream].forEach((stream) => {
        stream.getTracks().forEach((t) => {
          if (t.kind === 'audio') {
            t.enabled = !t.enabled;
            this.micRecording = !this.micRecording;
          }
        });
      });
    }
  }

  cancelRecording(): void {
    if (!this.recorder) {
      return;
    }
    this.recorder.stopRecording(() => {
      this.recording = false;
      this.recordStep = 4;

      if (this.cameraStream && this.screenStream) {
        [this.cameraStream, this.screenStream].forEach((stream) => {
          stream.getTracks().forEach((track) => {
            track.stop();
          });
        });
      } else if (this.cameraStream) {
        [this.cameraStream].forEach((stream) => {
          stream.getTracks().forEach((track) => {
            track.stop();
          });
        });
      } else if (this.screenStream) {
        [this.screenStream].forEach((stream) => {
          stream.getTracks().forEach((track) => {
            track.stop();
          });
        });
      }
      this.dialogRef.close();
    });
  }

  stopRecording(): void {
    if (!this.recorder) {
      return;
    }
    this.recorder.stopRecording(() => {
      const blob = this.recorder.getBlob();
      if (this.cameraStream && this.screenStream) {
        [this.cameraStream, this.screenStream].forEach((stream) => {
          stream.getTracks().forEach((track) => {
            track.stop();
          });
        });
      } else if (this.cameraStream) {
        [this.cameraStream].forEach((stream) => {
          stream.getTracks().forEach((track) => {
            track.stop();
          });
        });
      } else if (this.screenStream) {
        [this.screenStream].forEach((stream) => {
          stream.getTracks().forEach((track) => {
            track.stop();
          });
        });
      }

      this.recordedFile = window.URL.createObjectURL(blob);
      this.recording = false;
      this.recordStep = 4;
      this.recordedData = blob;
      this.recordedFile = window.URL.createObjectURL(blob);
      this.helperService
        .generateThumbnail(blob)
        .then((data) => {
          this.videoObj['thumbnail'] = data.image;
          this.videoObj['duration'] = data.duration;
          this.changeDetectorRef.detectChanges();
          const imageBlob = this.helperService.b64toBlob(data.image);
          this.helperService
            .generateImageThumbnail(imageBlob, 'video_play')
            .then((image) => {
              this.videoObj['site_image'] = image;
            })
            .catch((err) => {
              console.log('Video Meta Image Load', err);
            });
        })
        .catch((e) => {});
      this.recorder = undefined;
    });
  }

  recordImpl(): void {
    const videoSize = {
      height: window.screen.height,
      width: window.screen.width
    };
    if (this.mode === 'screen') {
      if (this.cameraStream) {
        this.screenStream.addTrack(this.cameraStream.getTracks()[0]);
      } else {
        this.micRecording = false;
        this.micFlag = false;
      }
      this.screenStream.width = window.screen.width;
      this.screenStream.height = window.screen.height;
      this.screenStream.fullcanvas = true;

      this.recorder = RecordRTC(this.screenStream, {
        type: 'video',
        mimeType: 'video/webm',
        video: videoSize
      });

      const video: HTMLVideoElement = this.video.nativeElement;
      video.muted = true;
      video.srcObject = this.screenStream;
      video.play();
    }
    if (this.mode === 'camera') {
      const { width, height } = this.cameraStream.getTracks()[0].getSettings();
      this.cameraStream.width = width;
      this.cameraStream.height = height;
      this.cameraStream.fullcanvas = true;

      this.recorder = RecordRTC(this.cameraStream, {
        type: 'video',
        mimeType: 'video/webm',
        video: videoSize
      });

      const video: HTMLVideoElement = this.video.nativeElement;
      video.muted = true;
      video.srcObject = this.cameraStream;
      video.play();

      if (this.deviceConstraint['audio']) {
        this.micRecording = true;
        this.micFlag = true;
      }
    }
    if (this.recorder) {
      this.recorder.startRecording();
      this.recording = true;
    }
    return;
  }

  captureCamera(): void {
    const constraint = { ...this.deviceConstraint };
    if (this.selectedCamera) {
      constraint['video']['deviceId'] = { exact: this.selectedCamera };
    }
    if (this.selectedMic) {
      constraint['audio']['deviceId'] = { exact: this.selectedMic };
    }
    console.log(constraint);
    navigator.mediaDevices
      .getUserMedia(constraint)
      .then((stream) => {
        this.cameraStream = stream;
        this.recordStep = 2;
        this.count();
      })
      .catch((err) => {
        console.log('camera stream error', err, err.message);
        this.showAlert(`Couldn't get the video from this camera`);
      });
  }

  captureMicro(): void {
    const constraint = { ...this.deviceConstraint };
    constraint['video'] = false;
    if (this.selectedMic) {
      constraint['audio']['deviceId'] = { exact: this.selectedMic };
    }
    navigator.mediaDevices
      .getUserMedia(constraint)
      .then((stream) => {
        this.cameraStream = stream;
        this.recordStep = 2;
        this.count();
      })
      .catch(() => {
        this.count();
        this.recordStep = 2;
      });
  }

  captureScreen(): void {
    this.invokeGetDisplayMedia(
      (screen) => {
        this.addStreamStopListener(screen, this.stopRecording);
        this.screenStream = screen;
        this.captureMicro();
      },
      () => {}
    );
  }

  record(): void {
    if (this.mode === 'screen') {
      this.captureScreen();
    }
    if (this.mode === 'camera') {
      this.captureCamera();
    }
  }

  invokeGetDisplayMedia(success, error): void {
    const displaymediastreamconstraints = {
      video: true
    };

    if (navigator.mediaDevices['getDisplayMedia']) {
      navigator.mediaDevices['getDisplayMedia'](displaymediastreamconstraints)
        .then(success)
        .catch(error);
    } else {
      navigator['getDisplayMedia'](displaymediastreamconstraints)
        .then(success)
        .catch(error);
    }
  }

  addStreamStopListener(stream, callback): void {
    stream.addEventListener(
      'ended',
      () => {
        this.stopRecording();
      },
      false
    );
    stream.addEventListener(
      'inactive',
      () => {
        this.stopRecording();
      },
      false
    );
    stream.getTracks().forEach((track) => {
      track.addEventListener(
        'ended',
        () => {
          this.stopRecording();
        },
        false
      );
      track.addEventListener(
        'inactive',
        () => {
          this.stopRecording();
        },
        false
      );
    });
  }

  checkDeviceSupport(callback): void {
    let canEnumerate = false;
    if (
      typeof MediaStreamTrack !== 'undefined' &&
      'getSources' in MediaStreamTrack
    ) {
      canEnumerate = true;
    } else if (
      navigator.mediaDevices &&
      !!navigator.mediaDevices.enumerateDevices
    ) {
      canEnumerate = true;
    }
    if (!canEnumerate) {
      return;
    }

    if (!navigator['enumerateDevices'] && navigator['enumerateDevices']) {
      navigator['enumerateDevices'] = navigator['enumerateDevices'].bind(
        navigator
      );
    }

    if (!navigator['enumerateDevices']) {
      if (callback) {
        callback();
      }
      return;
    }

    const MediaDevices = [];
    navigator['enumerateDevices']((devices) => {
      devices.forEach((_device) => {
        const device = {};
        for (const d in _device) {
          device[d] = _device[d];
        }

        if (device['kind'] === 'audio') {
          device['kind'] = 'audioinput';
        }

        if (device['kind'] === 'video') {
          device['kind'] = 'videoinput';
        }

        let skip;
        MediaDevices.forEach((d) => {
          if (d.id === device['id'] && d.kind === device['kind']) {
            skip = true;
          }
        });

        if (skip) {
          return;
        }

        if (!device['deviceId']) {
          device['deviceId'] = device['id'];
        }

        if (!device['id']) {
          device['id'] = device['deviceId'];
        }

        const isHTTPs = location.protocol === 'https:';
        if (!device['label']) {
          device['label'] = 'Please invoke getUserMedia once.';
          if (!isHTTPs) {
            device['label'] =
              'HTTPs is required to get label of this ' +
              device['kind'] +
              ' device.';
          }
        } else {
          if (device['kind'] === 'videoinput' && !this.isCamAlreadyCaptured) {
            this.isCamAlreadyCaptured = true;
          }

          if (device['kind'] === 'audioinput' && !this.isMicAlreadyCaptured) {
            this.isMicAlreadyCaptured = true;
          }
        }

        if (device['kind'] === 'audioinput') {
          this.hasMic = true;
        }

        if (device['kind'] === 'videoinput') {
          this.hasCamera = true;
        }

        // there is no 'videoouput' in the spec.
        MediaDevices.push(device);
      });

      if (callback) {
        callback();
      }
    });
  }

  initDeviceList(): void {
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        devices.forEach((device) => {
          if (
            device.kind === 'audioinput' &&
            device.deviceId !== 'default' &&
            device.deviceId !== 'communications'
          ) {
            this.micList.push(device);
          }

          if (
            device.kind === 'videoinput' &&
            device.deviceId !== 'default' &&
            device.deviceId !== 'communications'
          ) {
            this.cameraList.push(device);
          }
        });
        if (this.cameraList && this.cameraList.length) {
          this.selectedCamera = this.cameraList[0]['deviceId'];
        }
        if (this.micList && this.micList.length) {
          this.selectedMic = this.micList[0]['deviceId'];
        }
      })
      .catch((err) => {
        this.cameraList = [];
        this.micList = [];
      });
  }

  showAlert(msg: string): MatDialogRef<NotifyComponent> {
    const dialogRef = this.dialog.open(NotifyComponent, {
      position: { top: '100px' },
      width: '100vw',
      maxWidth: '400px',
      data: {
        message: msg
      }
    });
    return dialogRef;
  }

  close(): void {
    this.dialogRef.close();
  }

  collapseVideo(): void {
    this.collapse = !this.collapse;
  }

  openApplication(): void {
    this.dialog
      .open(ConfirmComponent, {
        maxWidth: '400px',
        width: '96vw',
        data: {
          title: 'CRM Record',
          message: `Please use the our recording application. If you didn't install CRMRecord, please download and install.`,
          cancelLabel: 'Download',
          confirmLabel: 'Open Application'
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res === undefined) {
        } else if (res === true) {
          const dom = document.createElement('a');
          dom.href = 'crmrecord://';
          dom.click();
        } else if (res === false) {
          const dom = document.createElement('a');
          dom.href =
            'https://teamgrow.s3.us-east-2.amazonaws.com/recorder/CRMRecord.exe';
          dom.click();
        }
      });
  }

  hoverButton(type): void {
    this.hovered = type;
  }

  blurButton(): void {
    this.hovered = '';
  }
}
