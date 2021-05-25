import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  Inject
} from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { NotifyComponent } from '../notify/notify.component';
import { FileUploader } from 'ng2-file-upload';
import { environment } from 'src/environments/environment';
import { UserService } from '../../services/user.service';
import { HelperService } from 'src/app/services/helper.service';
import { ToastrService } from 'ngx-toastr';
import { MaterialService } from 'src/app/services/material.service';
import * as ebml from 'ts-ebml';
import { Subscription, timer } from 'rxjs';
import * as RecordRTC from 'recordrtc';
import { ConfirmComponent } from '../confirm/confirm.component';
import { Socket } from 'ngx-socket-io';
import { Router } from '@angular/router';
import { Video } from 'src/app/models/video.model';

@Component({
  selector: 'app-record-setting-dialog',
  templateUrl: './record-setting-dialog.component.html',
  styleUrls: ['./record-setting-dialog.component.scss']
})
export class RecordSettingDialogComponent implements OnInit {
  hasCamera = false;
  hasMic = false;
  isCamAlreadyCaptured = false;
  isMicAlreadyCaptured = false;

  @ViewChild('video') video: ElementRef;

  recorder;
  deviceConstraint = {};

  screenStream;
  cameraStream;

  micFlag = false;
  micRecording = false;
  mode = 'screen';

  recording = false;
  countNum = 3;

  cameraList = [];
  micList = [];
  selectedCamera = '';
  selectedMic = '';
  hovered = '';
  pauseFlag = false;
  collapse = false;
  recordStep = 1;
  popup;
  recordUrl = 'https://crmgrow-record.s3-us-west-1.amazonaws.com';
  redirectUrl = environment.front;
  authToken = '';
  userId = '';
  serverVideoId = '';
  completedRecord = false;
  counterDirection = 1;
  limitTime = 10 * 60 * 1000;
  videoDuration = 0;
  recordedBuffer = [];
  serverBuffer;
  sentSize = 0;
  receivedSize = 0;
  convertCallSubscription: Subscription;

  constructor(
    private dialogRef: MatDialogRef<RecordSettingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialog: MatDialog,
    private userService: UserService,
    private helperService: HelperService,
    private toast: ToastrService,
    private materialService: MaterialService,
    public socket: Socket
  ) {
    this.authToken = this.userService.getToken();
    if (this.data && this.data.id) {
      this.userId = this.data.id;
    }
  }

  ngOnInit(): void {
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

  ngOnDestroy(): void {
    this.socket.disconnect();
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
    this.completedRecord = false;
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
      this.socket.emit('cancelRecord', { videoId: this.serverVideoId });
      this.socket.on('removedVideo', () => {
        this.dialogRef.close();
        this.socket.disconnect();
        this.completedRecord = false;
        this.serverVideoId = undefined;
        this.recorder = undefined;
      });
    });
  }

  stopRecording(): void {
    if (!this.recorder) {
      return;
    }
    this.completedRecord = true;
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
    });
    this.socket.on('savedVideo', (data) => {
      const videoId = data.video;
      this.socket.disconnect();
      this.completedRecord = false;
      this.serverVideoId = undefined;
      this.recorder = undefined;
      this.dialogRef.close();
      let popup;
      if (!popup || popup.closed) {
        popup = window.open(
          `${this.redirectUrl}/materials?video=${videoId}`,
          `screen${videoId}`
        );
      } else {
        popup.focus();
      }
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
      const _SELF = this;
      this.recorder = RecordRTC(this.screenStream, {
        type: 'video',
        mimeType: 'video/webm',
        video: videoSize,
        timeSlice: 2000,
        ondataavailable: function (data) {
          _SELF.recordedBuffer.push(data);
          if (!_SELF.serverBuffer) {
            _SELF.serverBuffer = [..._SELF.recordedBuffer];
            let bufferSize = 0;
            _SELF.serverBuffer.forEach((e) => {
              bufferSize += e.size;
            });
            _SELF.sentSize += bufferSize;
            _SELF.socket.emit('pushVideoData', {
              videoId: _SELF.serverVideoId,
              data: _SELF.serverBuffer,
              sentSize: _SELF.sentSize,
              recordTime: _SELF.videoDuration
            });
          }
        }
      });
      const video: HTMLVideoElement = this.video.nativeElement;
      video.muted = true;
      video.srcObject = this.screenStream;
      video.play();
    }
    if (this.recorder) {
      this.recorder.startRecording();
      this.recording = true;
    }
    this.socket.on('receivedVideoData', (data) => {
      this.receivedSize = data.receivedSize;
      this.recordedBuffer.splice(0, this.receivedSize);
      this.serverBuffer = [...this.recordedBuffer];
      if (this.serverBuffer.length) {
        let bufferSize = 0;
        this.serverBuffer.forEach((e) => {
          bufferSize += e.size;
        });
        this.sentSize += bufferSize;
        this.socket.emit('pushVideoData', {
          videoId: this.serverVideoId,
          data: this.serverBuffer,
          sentSize: this.sentSize
        });
      } else {
        this.serverBuffer = undefined;
        if (this.completedRecord) {
          this.socket.emit('saveVideo', {
            videoId: this.serverVideoId,
            token: this.authToken
          });
          this.serverBuffer = undefined;
          this.sentSize = 0;
          this.receivedSize = 0;
        }
      }
    });
    return;
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
      this.socket.connect();
      if (!this.serverVideoId) {
        this.socket.emit('initVideo', this.userId);
      }
      this.socket.on('counterDirection', (data) => {
        this.counterDirection = data.counterDirection;
        this.limitTime = data.limitTime;
        if (this.counterDirection == -1) {
          this.videoDuration = this.limitTime;
        }
      });
      this.socket.on('createdVideo', (data) => {
        this.serverVideoId = data.video;
      });
      this.captureScreen();
    }
    if (this.mode === 'camera') {
      const w = 750;
      const h = 450;
      const dualScreenLeft =
        window.screenLeft !== undefined ? window.screenLeft : window.screenX;
      const dualScreenTop =
        window.screenTop !== undefined ? window.screenTop : window.screenY;

      const width = window.innerWidth
        ? window.innerWidth
        : document.documentElement.clientWidth
        ? document.documentElement.clientWidth
        : screen.width;
      const height = window.innerHeight
        ? window.innerHeight
        : document.documentElement.clientHeight
        ? document.documentElement.clientHeight
        : screen.height;

      const systemZoom = width / window.screen.availWidth;
      const left = (width - w) / 2 / systemZoom + dualScreenLeft;
      const top = (height - h) / 2 / systemZoom + dualScreenTop;
      const option = `width=${w}, height=${h}, top=${top}, left=${left}`;
      if (!this.popup || this.popup.closed) {
        this.popup = window.open(
          this.recordUrl +
            '/index.html?' +
            this.authToken +
            '&=material' +
            '&=' +
            this.userId,
          'material',
          option
        );
        window.addEventListener('message', (e) => {
          if (e && e.data && e.origin == this.recordUrl) {
            const videoId = e.data;
            let popup;
            if (!popup || popup.closed) {
              popup = window.open(
                `${this.redirectUrl}/materials?video=${videoId}`,
                `camera${videoId}`
              );
            } else {
              popup.focus();
            }
          }
        });
      } else {
        this.popup.focus();
      }
      this.dialogRef.close();
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
          message: `Please use our recording application. If you didn't install CRMRecord, please download and install.`,
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
          if (window.navigator.userAgent.indexOf('Win') !== -1) {
            dom.href =
              'https://teamgrow.s3.us-east-2.amazonaws.com/recorder/CRMRecord.exe';
            dom.click();
          } else {
            dom.href =
              'https://teamgrow.s3.us-east-2.amazonaws.com/recorder/CRMRecord.dmg';
            dom.click();
          }
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
