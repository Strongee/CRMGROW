import {
  ApplicationRef,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Contact } from 'src/app/models/contact.model';
import { FormControl } from '@angular/forms';
import { Template } from 'src/app/models/template.model';
import { UserService } from 'src/app/services/user.service';
import { MaterialService } from 'src/app/services/material.service';
import { ContactService } from 'src/app/services/contact.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { TemplatesService } from 'src/app/services/templates.service';
import { TemplatePortal } from '@angular/cdk/portal';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ConnectService } from 'src/app/services/connect.service';
import { Garbage } from 'src/app/models/garbage.model';
import { Subscription } from 'rxjs';
import { isEmptyHtml } from 'src/app/utils/functions';
import { CHUNK_SIZE } from 'src/app/constants/variable.constants';
import { HandlerService } from 'src/app/services/handler.service';

@Component({
  selector: 'app-material-send',
  templateUrl: './material-send.component.html',
  styleUrls: ['./material-send.component.scss']
})
export class MaterialSendComponent implements OnInit {
  selectedTab = 0;
  contacts: Contact[] = [];
  videos: any[] = [];
  pdfs: any[] = [];
  images: any[] = [];
  emailTemplate: Template = new Template();
  textTemplate: Template = new Template();
  subject = '';
  emailContent = '';
  textContent = '';
  sending = false;
  firstMaterialType = '';
  isCalendly = false;
  garbage: Garbage = new Garbage();
  garbageSubscription: Subscription;

  @ViewChild('messageText') messageEl: ElementRef;
  overlayRef: OverlayRef;
  templatePortal: TemplatePortal;
  @ViewChild('createNewContent') createNewContent: TemplateRef<unknown>;
  templateSubject = '';
  templateValue = '';
  set = 'twitter';

  constructor(
    private userService: UserService,
    private contactService: ContactService,
    public connectService: ConnectService,
    private materialService: MaterialService,
    public templateService: TemplatesService,
    private toast: ToastrService,
    private handlerService: HandlerService,
    private _viewContainerRef: ViewContainerRef,
    private overlay: Overlay,
    private cdr: ChangeDetectorRef,
    private appRef: ApplicationRef,
    private dialogRef: MatDialogRef<MaterialSendComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.garbageSubscription && this.garbageSubscription.unsubscribe();
    this.garbageSubscription = this.userService.garbage$.subscribe((res) => {
      this.garbage = res;
      if (this.garbage?.calendly) {
        this.isCalendly = true;
        this.connectService.loadCalendlyAll(false);
      } else {
        this.isCalendly = false;
      }
    });
  }

  ngOnInit(): void {
    this.templateService.loadAll(false);
    if (this.data.material.length) {
      if (this.data.material_type) {
        switch (this.data.material_type) {
          case 'video':
            this.videos = [...this.data.material];
            break;
          case 'pdf':
            this.pdfs = [...this.data.material];
            break;
          case 'image':
            this.images = [...this.data.material];
            break;
        }
        this.firstMaterialType = this.data.material_type;
      } else {
        this.data.material.forEach((e) => {
          switch (e.material_type) {
            case 'video':
              this.videos.push(e);
              break;
            case 'pdf':
              this.pdfs.push(e);
              break;
            case 'image':
              this.images.push(e);
              break;
          }
        });
        this.firstMaterialType = this.data.material[0]['material_type'];
      }
    }
    if (this.data.type) {
      if (this.data.type === 'email') {
        this.selectedTab = 1;
      } else {
        this.selectedTab = 0;
      }
    }
    const defaultEmail = this.userService.email.getValue();
    if (defaultEmail) {
      this.emailContent = defaultEmail.content;
      this.subject = defaultEmail.subject;
    }
    const defaultSms = this.userService.sms.getValue();
    if (defaultSms) {
      this.textContent = defaultSms.content;
    }
  }

  selectNewContacts(event): void {
    this.contacts = [event];
  }

  changeTab(event: number): void {
    this.selectedTab = event;
  }
  selectTextTemplate(template: Template): void {
    this.messageEl.nativeElement.focus();
    const field = this.messageEl.nativeElement;
    if (!this.textContent.replace(/(\r\n|\n|\r|\s)/gm, '')) {
      field.select();
      document.execCommand('insertText', false, template.content);
      return;
    }
    if (field.selectionEnd || field.selectionEnd === 0) {
      if (this.textContent[field.selectionEnd - 1] === '\n') {
        document.execCommand('insertText', false, template.content);
      } else {
        document.execCommand('insertText', false, '\n' + template.content);
      }
    } else {
      if (this.textContent.slice(-1) === '\n') {
        document.execCommand('insertText', false, template.content);
      } else {
        document.execCommand('insertText', false, '\n' + template.content);
      }
    }
  }

  selectCalendly(url: string): void {
    this.messageEl.nativeElement.focus();
    const field = this.messageEl.nativeElement;
    if (!this.textContent.replace(/(\r\n|\n|\r|\s)/gm, '')) {
      field.select();
      document.execCommand('insertText', false, url);
      return;
    }
    if (field.selectionEnd || field.selectionEnd === 0) {
      if (this.textContent[field.selectionEnd - 1] === '\n') {
        document.execCommand('insertText', false, url);
      } else {
        document.execCommand('insertText', false, '\n' + url);
      }
    } else {
      if (this.textContent.slice(-1) === '\n') {
        document.execCommand('insertText', false, url);
      } else {
        document.execCommand('insertText', false, '\n' + url);
      }
    }
  }

  onChangeTemplate(event: Template): void {
    this.subject = event.subject;
  }
  insertTextContentValue(value: string): void {
    const field = this.messageEl.nativeElement;
    field.focus();
    let cursorStart = this.textContent.length;
    let cursorEnd = this.textContent.length;
    if (field.selectionStart || field.selectionStart === '0') {
      cursorStart = field.selectionStart;
    }
    if (field.selectionEnd || field.selectionEnd === '0') {
      cursorEnd = field.selectionEnd;
    }
    field.setSelectionRange(cursorStart, cursorEnd);
    document.execCommand('insertText', false, value);
    cursorStart += value.length;
    cursorEnd = cursorStart;
    field.setSelectionRange(cursorStart, cursorEnd);
  }
  send(): void {
    if (this.contacts.length == 0) {
      return;
    }
    if (this.selectedTab === 0) {
      // Send Text
      const newContacts = [];
      this.contacts.forEach((e) => {
        if (!e._id) {
          newContacts.push(e);
        }
      });
      if (newContacts.length) {
        this.sending = true;
        this.contactService.bulkCreate(newContacts).subscribe((res) => {
          const newContactIds = [];
          if (res) {
            const addedContacts = res['succeed'];
            addedContacts.forEach((e) => newContactIds.push(e._id));
          }
          this.sendText(newContactIds);
        });
      } else {
        this.sendText([]);
      }
    } else if (this.selectedTab === 1) {
      // Send Email
      const newContacts = [];
      this.contacts.forEach((e) => {
        if (!e._id) {
          newContacts.push(e);
        }
      });
      if (newContacts.length) {
        this.sending = true;
        this.contactService.bulkCreate(newContacts).subscribe((res) => {
          const newContactIds = [];
          if (res) {
            const addedContacts = res['succeed'];
            addedContacts.forEach((e) => newContactIds.push(e._id));
          }
          this.sendEmail(newContactIds);
        });
      } else {
        this.sendEmail([]);
      }
    }
  }

  sendText(newContacts: string[]): void {
    const contacts = [...newContacts];
    const video_ids = [];
    const pdf_ids = [];
    const image_ids = [];
    const data = {};
    this.contacts.forEach((e) => {
      if (e._id && e.cell_phone) {
        contacts.push(e._id);
      }
    });
    this.videos.forEach((e) => video_ids.push(e._id));
    this.pdfs.forEach((e) => pdf_ids.push(e._id));
    this.images.forEach((e) => image_ids.push(e._id));
    if (video_ids.length) {
      data['video_ids'] = video_ids;
    }
    if (pdf_ids.length) {
      data['pdf_ids'] = pdf_ids;
    }
    if (image_ids.length) {
      data['image_ids'] = image_ids;
    }
    let message = this.textContent;
    if (this.textContent && this.textContent.slice(-1) !== '\n') {
      message += '\n';
    }
    video_ids.forEach((e) => {
      const url = `{{${e}}}`;
      message = message + '\n' + url;
    });
    pdf_ids.forEach((e) => {
      const url = `{{${e}}}`;
      message = message + '\n' + url;
    });
    image_ids.forEach((e) => {
      const url = `{{${e}}}`;
      message = message + '\n' + url;
    });

    this.sending = true;
    this.materialService
      .sendMessage({ ...data, content: message, contacts })
      .subscribe((status) => {
        this.sending = false;
        if (status) {
          this.toast.success('Materials has been successfully sent.');
          this.dialogRef.close();
        }
      });
  }

  sendEmail(newContacts: string[]): void {
    if (!this.emailContent || isEmptyHtml(this.emailContent)) {
      return;
    }

    let email = this.emailContent;
    const contacts = [...newContacts];
    const video_ids = [];
    const pdf_ids = [];
    const image_ids = [];
    this.contacts.forEach((e) => {
      if (e._id && e.email) {
        contacts.push(e._id);
      }
    });
    this.videos.forEach((e) => video_ids.push(e._id));
    this.pdfs.forEach((e) => pdf_ids.push(e._id));
    this.images.forEach((e) => image_ids.push(e._id));
    email += '<br/><br/><br/>';
    this.data.material.forEach((e) => {
      const html = `<div><strong>${e.title}</strong></div><div><a href="{{${e._id}}}"><img src="${e.preview}" width="320" height="176" alt="preview image of material" /></a></div><br/>`;
      email += html;
    });
    const data = {
      contacts,
      cc: [],
      bcc: [],
      video_ids,
      pdf_ids,
      image_ids,
      subject: this.subject,
      content: email,
      attachment: ''
    };
    if (!data.video_ids) {
      delete data.video_ids;
    }
    if (!data.pdf_ids) {
      delete data.pdf_ids;
    }
    if (!data.image_ids) {
      delete data.image_ids;
    }
    this.sending = true;
    this.materialService
      .sendMaterials({
        ...data
      })
      .subscribe((res) => {
        this.sending = false;
        if (res['status']) {
          if (res['message'] === 'all_queue') {
            // toastr display, call status setting update
            this.toast.info(
              'Your material sending requests are queued. The queue progressing would be displayed in the header.',
              'Material Queue'
            );
          } else {
            if (contacts.length > CHUNK_SIZE) {
              this.toast.success(
                `Sending to ${CHUNK_SIZE} contacts are sent successfully. ${
                  contacts.length - CHUNK_SIZE
                } request are queued. The queue progressing would be displayed in the header.`,
                'Material Sent'
              );
            } else {
              // toastr display
              this.toast.success(
                'Your materials are sent successfully.',
                'Material Sent'
              );
            }
          }
        } else if (res.statusCode === 405) {
          let failed = res.error && res.error.length;
          failed += res.notExecuted && res.notExecuted.length;
          if (failed < contacts.length) {
            let message = '';
            if (contacts.length > CHUNK_SIZE) {
              if (failed < CHUNK_SIZE) {
                message = `Sending to ${failed} contacts are failed. But ${
                  CHUNK_SIZE - failed
                } are succeed. Rest requests are queued. The queue progressing would be displayed in the header.`;
              } else {
                message = `Sending to ${failed} contacts are failed. Rest requests are queued. The queue progressing would be displayed in the header.`;
              }
            } else {
              // call status setting update && toast display
              message = `Sending to ${failed} contacts are failed. ${
                CHUNK_SIZE - failed
              } are succeed.`;
            }
            this.toast.warning(message, 'Material Sent');
          }
        }
        const length =
          (data.video_ids ? data.video_ids.length : 0) +
          (data.pdf_ids ? data.pdf_ids.length : 0) +
          (data.image_ids ? data.image_ids.length : 0) +
          1;
        if (contacts.length > CHUNK_SIZE) {
          this.handlerService.updateQueueTasks();
        }
        if (res['status']) {
          this.dialogRef.close();
        }
      });
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
}
