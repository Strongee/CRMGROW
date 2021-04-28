import { DOCUMENT } from '@angular/common';
import {
  ApplicationRef,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  NgZone,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { QuillEditorComponent } from 'ngx-quill';
import { FileService } from 'src/app/services/file.service';
import * as QuillNamespace from 'quill';
import { promptForFiles, loadBase64, ByteToSize } from 'src/app/helper';
import { TemplatesService } from 'src/app/services/templates.service';
import { Template } from 'src/app/models/template.model';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { ToastrService } from 'ngx-toastr';
import { HandlerService } from 'src/app/services/handler.service';
import { NotifyComponent } from '../notify/notify.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import * as RecordRTC from 'recordrtc';
import { ConnectService } from 'src/app/services/connect.service';
const Quill: any = QuillNamespace;
const Delta = Quill.import('delta');
const Parchment = Quill.import('parchment');
const ImageBlot = Quill.import('formats/image');
// import ImageResize from 'quill-image-resize-module';
// Quill.register('modules/imageResize', ImageResize);

@Component({
  selector: 'app-html-editor',
  templateUrl: './html-editor.component.html',
  styleUrls: ['./html-editor.component.scss']
})
export class HtmlEditorComponent implements OnInit {
  @Input() placeholder: string = '';
  @Input() style: any = { height: '180px' };
  @Input() class = '';
  @Input() hasToken: boolean = false;
  @Input() required: boolean = false;
  @Input() subject: string = '';
  @Input()
  public set hasAttachment(val: boolean) {
    if (val) {
      this.config.toolbar.container.unshift(['attachment']);
    }
  }
  @Input()
  public set hasTemplates(val: boolean) {
    if (val) {
      this.config.toolbar.container.push(['template']);
    }
  }
  @Input()
  public set hasCalendly(val: boolean) {
    if (val) {
      this.config.toolbar.container.push(['calendly']);
    }
  }
  @Input()
  public set hasRecord(val: boolean) {
    if (val) {
      this.config.toolbar.container.push(['record']);
    }
  }
  @Input()
  public set noImage(val: boolean) {
    if (val) {
      this.config.toolbar.container.forEach((e) => {
        e.some((item, index) => {
          if (item === 'image' || item.list === 'image') {
            e.splice(index, 1);
            return true;
          }
        });
      });
    }
  }
  @Input() templateSelectMethod = 'insert';
  @Input() hasNewTemplateLink = true;

  @Input() value: string = '';
  @Output() valueChange: EventEmitter<string> = new EventEmitter();
  @Output() onFocus: EventEmitter<boolean> = new EventEmitter();
  @Output() attachmentChange: EventEmitter<any> = new EventEmitter();
  @Output() onInit: EventEmitter<boolean> = new EventEmitter();
  @Output() onChangeTemplate: EventEmitter<Template> = new EventEmitter();
  @Output() onCreateEvent: EventEmitter<string> = new EventEmitter();

  editorForm: FormControl = new FormControl();
  @ViewChild('emailEditor') emailEditor: QuillEditorComponent;
  @ViewChild('video') video: ElementRef;
  showTemplates: boolean = false;
  showCalendly: boolean = false;
  showRecord: boolean = false;
  quillEditorRef;
  attachments = [];
  config = {
    toolbar: {
      container: [
        ['bold', 'italic', 'underline'],
        [{ list: 'bullet' }],
        ['link', 'image']
      ],
      handlers: {
        attachment: () => {
          promptForFiles().then((files) => {
            [].forEach.call(files, (file) => {
              loadBase64(file).then((base64) => {
                const attachment = {
                  filename: file.name,
                  type: file.type,
                  content: base64.substr(base64.indexOf(',') + 1),
                  size: ByteToSize(file.size)
                };
                this.attachments.unshift(attachment);
                this.attachmentChange.emit(this.attachments);
                this.cdr.detectChanges();
              });
            });
          });
        },
        template: () => {
          this.showTemplates = !this.showTemplates;
          this.cdr.detectChanges();
        },
        calendly: () => {
          this.showCalendly = !this.showCalendly;
          this.cdr.detectChanges();
        },
        record: () => {
          this.showRecord = !this.showRecord;
          this.cdr.detectChanges();

          // if (this.hasCamera) {
          //   this.showCamera();
          // } else {
          //   this.dialog.open(NotifyComponent, {
          //     position: { top: '100px' },
          //     width: '100vw',
          //     maxWidth: '400px',
          //     data: {
          //       message: 'Camera is not connected. Please connect the camera.'
          //     }
          //   });
          // }
        }
      }
    },
    table: false,
    'better-table': {
      operationMenu: {
        items: {
          unmergeCells: {
            text: 'Another unmerge cells name'
          }
        },
        color: {
          colors: ['green', 'red', 'yellow', 'blue', 'white'],
          text: 'Background Colors:'
        }
      }
    },
    blotFormatter: {}
  };

  hasCamera = false;
  hasMic = false;
  recording = false;
  pauseFlag = false;
  micRecording = false;
  micFlag = false;
  hovered = '';
  cameraList = [];
  micList = [];
  selectedCamera = '';
  selectedMic = '';
  deviceConstraint = {};
  screenStream;
  cameraStream;
  recorder;
  countNum = 3;
  recordStep = 1;
  externalWindow = null;
  @ViewChild('createNewContent') createNewContent: TemplateRef<unknown>;
  overlayRef: OverlayRef;
  templatePortal: TemplatePortal;

  constructor(
    private fileService: FileService,
    public templateService: TemplatesService,
    private handlerService: HandlerService,
    public connectService: ConnectService,
    @Inject(DOCUMENT) private document: Document,
    private cdr: ChangeDetectorRef,
    private overlay: Overlay,
    private _viewContainerRef: ViewContainerRef,
    private toast: ToastrService,
    private appRef: ApplicationRef,
    private dialogRef: MatDialogRef<HtmlEditorComponent>,
    private dialog: MatDialog
  ) {
    this.templateService.loadAll(false);
    this.connectService.loadCalendlyAll();
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
    }
  }

  insertValue(value: string): void {
    if (value && this.quillEditorRef && this.quillEditorRef.clipboard) {
      this.emailEditor.quillEditor.focus();
      const range = this.emailEditor.quillEditor.getSelection();
      let index = 0;
      if (range) {
        index = range.index;
      }
      const delta = this.quillEditorRef.clipboard.convert({
        html: value
      });
      this.emailEditor.quillEditor.updateContents(
        new Delta().retain(index).concat(delta),
        'user'
      );
      const length = this.emailEditor.quillEditor.getLength();
      this.emailEditor.quillEditor.setSelection(length, 0, 'user');
      // this.emailEditor.quillEditor.setContents(delta, 'user');
    }
  }

  showCamera(): void {
    const constraint = { ...this.deviceConstraint };
    if (this.selectedCamera) {
      constraint['video']['deviceId'] = { exact: this.selectedCamera };
    }
    if (this.selectedMic) {
      constraint['audio']['deviceId'] = { exact: this.selectedMic };
    }
    navigator.mediaDevices
      .getUserMedia(constraint)
      .then((stream) => {
        this.cameraStream = stream;
        const video: HTMLVideoElement = this.video.nativeElement;
        video.muted = true;
        video.srcObject = this.cameraStream;
        video.play();
      })
      .catch((err) => {
        console.log('camera stream error', err, err.message);
        this.showAlert(`Couldn't get the video from this camera`);
      });
  }

  record(): void {
    this.recordStep = 2;
    this.count();
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
      this.cdr.detectChanges();
    }, 1000);
  }

  recordImpl(): void {
    const videoSize = {
      height: window.screen.height,
      width: window.screen.width
    };
    const { width, height } = this.cameraStream.getTracks()[0].getSettings();
    this.cameraStream.width = width;
    this.cameraStream.height = height;
    this.cameraStream.fullcanvas = true;

    this.recorder = RecordRTC(this.cameraStream, {
      type: 'video',
      mimeType: 'video/webm',
      video: videoSize
    });
    if (this.recorder) {
      this.recording = true;
      this.recorder.startRecording();
    }
  }

  stopRecording(): void {}

  hoverButton(type: string): void {
    this.hovered = type;
  }

  blurButton(): void {
    this.hovered = '';
  }

  toggleRecording(): void {
    this.pauseFlag = !this.pauseFlag;
    if (this.pauseFlag) {
      this.recorder.pauseRecording();
    } else {
      this.recorder.resumeRecording();
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

  cancelRecording(): void {}

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
        }

        if (device['kind'] === 'videoinput') {
          this.hasCamera = true;
        }

        if (device['kind'] === 'audioinput') {
          this.hasMic = true;
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

  setValue(value: string): void {
    if (value && this.quillEditorRef && this.quillEditorRef.clipboard) {
      const delta = this.quillEditorRef.clipboard.convert({ html: value });
      this.emailEditor.quillEditor.setContents(delta, 'user');
    }
  }

  getEditorInstance(editorInstance: any): void {
    this.quillEditorRef = editorInstance;
    const toolbar = this.quillEditorRef.getModule('toolbar');
    toolbar.addHandler('image', this.initImageHandler);
    if (this.value) {
      this.setValue(this.value);
    }
    this.onInit.emit();

    this.emailEditor.quillEditor.container.addEventListener('click', (ev) => {
      const img = Parchment.Registry.find(ev.target);
      if (img instanceof ImageBlot) {
        this.emailEditor.quillEditor.setSelection(
          img.offset(this.emailEditor.quillEditor.scroll),
          1,
          'user'
        );
      }
    });

    const tooltip = this.emailEditor.quillEditor.theme.tooltip;
    const input = tooltip.root.querySelector('input[data-link]');
    input.dataset.link = 'www.crmgrow.com';
  }

  initImageHandler = (): void => {
    const imageInput: HTMLInputElement = this.document.createElement('input');
    imageInput.type = 'file';
    imageInput.accept = 'image/*';

    imageInput.addEventListener('change', () => {
      if (imageInput.files != null && imageInput.files[0] != null) {
        const file = imageInput.files[0];
        this.fileService.attachImage(file).then((res) => {
          this.insertImageToEditor(res['url']);
        });
      }
    });
    imageInput.click();
  };

  insertImageToEditor(url: string): void {
    const range = this.quillEditorRef.getSelection();
    this.emailEditor.quillEditor.insertEmbed(range.index, `image`, url, 'user');
    this.emailEditor.quillEditor.setSelection(range.index + 1, 0, 'user');
  }

  insertEmailContentValue(value: string): void {
    this.emailEditor.quillEditor.focus();
    const range = this.emailEditor.quillEditor.getSelection();
    this.emailEditor.quillEditor.insertText(range.index, value, 'user');
    this.emailEditor.quillEditor.setSelection(
      range.index + value.length,
      0,
      'user'
    );
  }

  onChangeValue(value: string): void {
    this.valueChange.emit(value);
  }

  insertBeforeMaterials(): void {
    this.emailEditor.quillEditor.focus();
    const range = this.quillEditorRef.getSelection();
    const length = this.emailEditor.quillEditor.getLength();

    let next;
    let prev;
    let selection = 0;
    if (range && range.index) {
      const prevDelta = this.emailEditor.quillEditor.getContents(
        range.index - 1,
        1
      );
      const nextDelta = this.emailEditor.quillEditor.getContents(
        range.index,
        1
      );
      next = nextDelta.ops[0].insert;
      prev = prevDelta.ops[0].insert;
      selection = range.index;
    } else {
      const nextDelta = this.emailEditor.quillEditor.getContents(length - 1, 1);
      const prevDelta = this.emailEditor.quillEditor.getContents(length - 2, 1);
      next = nextDelta.ops[0].insert;
      prev = prevDelta.ops[0].insert;
      selection = length;
    }
    if (next === '\n' && prev === '\n') {
      return;
    } else if (next === '\n') {
      this.emailEditor.quillEditor.insertText(selection, '\n', {}, 'user');
      this.emailEditor.quillEditor.setSelection(selection + 1, 0, 'user');
      return;
    } else if (prev === '\n') {
      return;
    } else {
      this.emailEditor.quillEditor.insertText(selection, '\n', {}, 'user');
      this.emailEditor.quillEditor.setSelection(selection + 1, 0, 'user');
    }
  }

  insertAfterMaterials(): void {
    this.emailEditor.quillEditor.focus();
    const range = this.quillEditorRef.getSelection();
    const length = this.emailEditor.quillEditor.getLength();
    let selection = 0;
    if (range && range.index) {
      selection = range.index;
    } else {
      selection = length;
    }
    this.emailEditor.quillEditor.insertText(selection, '\n\n', {}, 'user');
    this.emailEditor.quillEditor.setSelection(selection + 2, 0, 'user');
  }

  insertMaterials(material: any): void {
    this.emailEditor.quillEditor.focus();

    const range = this.quillEditorRef.getSelection();
    const length = this.emailEditor.quillEditor.getLength();

    if (range && range.index) {
      let selection = range.index;
      this.emailEditor.quillEditor.insertText(selection, '\n', {}, 'user');
      selection += 1;
      this.emailEditor.quillEditor.insertText(
        selection,
        material.title + '\n',
        'bold',
        'user'
      );
      selection += material.title.length + 1;
      this.emailEditor.quillEditor.insertEmbed(
        selection,
        `materialLink`,
        { _id: material._id, preview: material.preview || material.thumbnail },
        'user'
      );
      selection += 1;
      this.emailEditor.quillEditor.setSelection(selection, 0, 'user');
    } else {
      let selection = length;
      this.emailEditor.quillEditor.insertText(selection, '\n', {}, 'user');
      selection += 1;
      this.emailEditor.quillEditor.insertText(
        length,
        material.title,
        'bold',
        'user'
      );
      selection += material.title.length + 1;
      this.emailEditor.quillEditor.insertEmbed(
        selection,
        `materialLink`,
        { _id: material._id, preview: material.preview || material.thumbnail },
        'user'
      );
      selection += 1;
      this.emailEditor.quillEditor.setSelection(selection, 0, 'user');
    }
  }
  removeAttachment(index: number): void {
    this.attachments.splice(index, 1);
    this.cdr.detectChanges();
    this.attachmentChange.emit(this.attachments);
  }

  clearAttachments(): void {
    this.attachments = [];
    this.cdr.detectChanges();
    this.attachmentChange.emit(this.attachments);
  }

  onFocusEvt(): void {
    this.onFocus.emit();
  }

  closeTemplates(event: MouseEvent): void {
    const target = <HTMLElement>event.target;
    if (target.classList.contains('ql-template')) {
      return;
    }
    this.showTemplates = false;
  }

  closeCalendly(event: MouseEvent): void {
    const target = <HTMLElement>event.target;
    if (target.classList.contains('ql-calendly')) {
      return;
    }
    this.showCalendly = false;
  }

  selectTemplate(template: Template): void {
    this.onChangeTemplate.emit(template);
    if (this.templateSelectMethod === 'insert') {
      this.insertValue(template.content + '<br>');
    } else {
      this.setValue(template.content + '<br>');
    }
    this.showTemplates = false;
  }

  selectCalendly(url: string): void {
    const data = '<a href="url">' + url + '</a>';
    this.insertValue(data + '<br>');
    this.showCalendly = false;
  }

  createNew(): void {
    this.templatePortal = new TemplatePortal(
      this.createNewContent,
      this._viewContainerRef
    );
    if (this.overlayRef) {
      if (this.overlayRef.hasAttached()) {
        this.overlayRef.detach();
        return;
      } else {
        this.overlayRef.attach(this.templatePortal);
        return;
      }
    } else {
      this.overlayRef = this.overlay.create({
        hasBackdrop: true,
        backdropClass: 'template-backdrop',
        panelClass: 'template-panel',
        width: '96vw',
        maxWidth: '480px'
      });
      this.overlayRef.outsidePointerEvents().subscribe((event) => {
        this.overlayRef.detach();
        return;
      });
      this.overlayRef.attach(this.templatePortal);
    }
  }

  closeOverlay(flag: boolean): void {
    if (this.overlayRef) {
      this.overlayRef.detach();
      this.overlayRef.detachBackdrop();
    }
    if (flag) {
      this.toast.success('', 'New template is created successfully.', {
        closeButton: true
      });
      setTimeout(() => {
        this.appRef.tick();
      }, 1);
    }
    this.cdr.detectChanges();
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
}
// [{ font: [] }],
// [{ size: ['small', false, 'large', 'huge'] }],
// ['bold', 'italic', 'underline', 'strike'],
// [{ header: 1 }, { header: 2 }],
// [{ color: [] }, { background: [] }],
// [{ list: 'ordered' }, { list: 'bullet' }],
// [{ align: [] }],
// ['link', 'image']
