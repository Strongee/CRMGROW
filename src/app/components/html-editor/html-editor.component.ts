import { DOCUMENT } from '@angular/common';
import {
  ApplicationRef,
  ChangeDetectorRef,
  Component,
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
import { ConnectService } from 'src/app/services/connect.service';
import { UserService } from 'src/app/services/user.service';
import { Subscription } from 'rxjs';
const Quill: any = QuillNamespace;
const Delta = Quill.import('delta');
const Parchment = Quill.import('parchment');
const ImageBlot = Quill.import('formats/image');
import { StripTagsPipe } from 'ngx-pipes';
// import ImageResize from 'quill-image-resize-module';
// Quill.register('modules/imageResize', ImageResize);

@Component({
  selector: 'app-html-editor',
  templateUrl: './html-editor.component.html',
  styleUrls: ['./html-editor.component.scss'],
  providers: [StripTagsPipe]
})
export class HtmlEditorComponent implements OnInit {
  @Input() submitted: boolean = false;
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
  public set hasEmoji(val: boolean) {
    if (val) {
      this.config.toolbar.container.push(['emoji']);
    }
  }
  @Input()
  public set hasCalendly(val: boolean) {
    if (val) {
      this.config.toolbar.container.push(['calendly']);
      this.connectService.loadCalendlyAll(false);
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
  showTemplates: boolean = false;
  showCalendly: boolean = false;
  showEmoji: boolean = false;
  showLink: boolean = false;
  displayText = '';
  displayLink = '';
  set = 'twitter';
  userId = '';
  authToken = '';
  recordUrl = 'https://crmgrow-record.s3-us-west-1.amazonaws.com/index.html';
  quillEditorRef;
  popup;
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
        link: () => {
          if (this.emailEditor.quillEditor.getSelection().length !== 0) {
            const range = this.emailEditor.quillEditor.getSelection();
            const delta = this.emailEditor.quillEditor.getContents(
              range.index,
              range.length
            );
            this.displayText = delta.ops[0].insert;
          } else {
            this.displayText = '';
          }
          this.displayLink = '';
          this.showLink = !this.showLink;
          this.cdr.detectChanges();
        },
        template: () => {
          this.showTemplates = !this.showTemplates;
          this.cdr.detectChanges();
        },
        emoji: () => {
          this.showEmoji = !this.showEmoji;
          this.cdr.detectChanges();
        },
        calendly: () => {
          this.showCalendly = !this.showCalendly;
          this.cdr.detectChanges();
        },
        record: () => {
          const w = 750;
          const h = 450;
          const dualScreenLeft =
            window.screenLeft !== undefined
              ? window.screenLeft
              : window.screenX;
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
                '?' +
                this.authToken +
                '&=website' +
                '&=' +
                this.userId,
              'record',
              option
            );
            window.addEventListener('message', (e) => {
              if (e && e.data) {
                this.insertImageToEditor(e.data);
                return;
              }
            });
          } else {
            this.popup.focus();
          }
          this.cdr.detectChanges();
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

  @ViewChild('createNewContent') createNewContent: TemplateRef<unknown>;
  overlayRef: OverlayRef;
  templatePortal: TemplatePortal;

  profileSubscription: Subscription;

  constructor(
    private userService: UserService,
    private fileService: FileService,
    public templateService: TemplatesService,
    private handlerService: HandlerService,
    public connectService: ConnectService,
    @Inject(DOCUMENT) private Document: Document,
    private cdr: ChangeDetectorRef,
    private overlay: Overlay,
    private _viewContainerRef: ViewContainerRef,
    private toast: ToastrService,
    private appRef: ApplicationRef,
    private stripTags: StripTagsPipe
  ) {
    this.templateService.loadAll(false);
    this.authToken = this.userService.getToken();
    this.profileSubscription && this.profileSubscription.unsubscribe();
    this.profileSubscription = this.userService.profile$.subscribe((user) => {
      this.userId = user._id;
    });
  }

  ngOnInit(): void {}

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

  insertLink(): void {
    let url;
    if (this.displayText != '') {
      url = `<a href="${this.displayLink}" target="_blank">${this.displayText}</a>`;
    } else {
      url = `<a href="${this.displayLink}" target="_blank">${this.displayLink}</a>`;
    }
    this.insertValue(url);
    this.showLink = false;
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
    const link_button = toolbar.container.querySelector('.ql-link');
    const image_button = toolbar.container.querySelector('.ql-image');
    const template_button = toolbar.container.querySelector('.ql-template');
    const emoji_button = toolbar.container.querySelector('.ql-emoji');
    const calendly_button = toolbar.container.querySelector('.ql-calendly');
    const record_button = toolbar.container.querySelector('.ql-record');
    if (link_button) {
      link_button.setAttribute('title', 'Link');
    }
    if (image_button) {
      image_button.setAttribute('title', 'Image');
    }
    if (template_button) {
      template_button.setAttribute('title', 'Template');
    }
    if (emoji_button) {
      emoji_button.setAttribute('title', 'Emoji');
    }
    if (calendly_button) {
      calendly_button.setAttribute('title', 'Calendly');
    }
    if (record_button) {
      record_button.setAttribute('title', 'Record');
    }
    input.dataset.link = 'www.crmgrow.com';
  }

  initImageHandler = (): void => {
    const imageInput: HTMLInputElement = this.Document.createElement('input');
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
      next = (nextDelta.ops[0] && nextDelta.ops[0].insert) || '\n';
      prev = (prevDelta.ops[0] && prevDelta.ops[0].insert) || '\n';
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

    let selection;
    if (!(this.stripTags.transform(this.value || '') || '').trim()) {
      console.log('add after empty');
      selection = range.index;
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

      this.emailEditor.quillEditor.insertText(selection, '\n\n\n', {}, 'user');
      this.emailEditor.quillEditor.setSelection(selection + 3, 0, 'user');
    } else {
      if (range && range.index) {
        selection = range.index;
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
          {
            _id: material._id,
            preview: material.preview || material.thumbnail
          },
          'user'
        );
        selection += 1;
        this.emailEditor.quillEditor.setSelection(selection, 0, 'user');
      } else {
        selection = length;
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
          {
            _id: material._id,
            preview: material.preview || material.thumbnail
          },
          'user'
        );
        selection += 1;
        this.emailEditor.quillEditor.setSelection(selection, 0, 'user');
      }

      this.emailEditor.quillEditor.insertText(selection, '\n\n', {}, 'user');
      this.emailEditor.quillEditor.setSelection(selection + 2, 0, 'user');
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

  closeEmoji(event: MouseEvent): void {
    const target = <HTMLElement>event.target;
    if (target.classList.contains('ql-emoji')) {
      return;
    }
    this.showEmoji = false;
  }

  closeLink(event: MouseEvent): void {
    const target = <HTMLElement>event.target;
    if (target.classList.contains('ql-link')) {
      return;
    }
    this.showLink = false;
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
    const data = '<a href="' + url + '">' + url + '</a>';
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

  isEmpty(): boolean {
    return !(this.stripTags.transform(this.value || '') || '').trim();
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
