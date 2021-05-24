import {
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { FileSelectDirective } from 'ng2-file-upload';
import { interval, Subscription } from 'rxjs';
import { Contact } from 'src/app/models/contact.model';
import { Template } from 'src/app/models/template.model';
import { ContactService } from 'src/app/services/contact.service';
import { MaterialService } from 'src/app/services/material.service';
import { SmsService } from 'src/app/services/sms.service';
import { TemplatesService } from 'src/app/services/templates.service';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';
import { MaterialBrowserComponent } from '../material-browser/material-browser.component';

@Component({
  selector: 'app-send-text',
  templateUrl: './send-text.component.html',
  styleUrls: ['./send-text.component.scss']
})
export class SendTextComponent implements OnInit, OnDestroy {
  type = '';
  contact: Contact;
  textContacts: any[] = [];
  message: string = '';
  conversation: any;
  userId: string = '';
  messages: any[] = [];
  set = 'twitter';
  toFocus = false;

  loading = false;
  loadSubscription: Subscription;
  sending = false;
  sendSubscription: Subscription;
  updateTimer: Subscription;
  conversationLoadSubscription: Subscription;

  @ViewChild('messageText') messageText: ElementRef;
  constructor(
    private dialogRef: MatDialogRef<SendTextComponent>,
    private dialog: MatDialog,
    public templateService: TemplatesService,
    private materialService: MaterialService,
    private contactService: ContactService,
    public userService: UserService,
    public smsService: SmsService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (this.data && this.data.type) {
      this.type = this.data.type;
      if (this.type == 'single') {
        this.contact = new Contact().deserialize(this.data.contact);
        this.conversationLoadSubscription = this.contactService.contactConversation$.subscribe(
          (conversation) => {
            if (conversation && conversation.contact === this.contact._id) {
              this.messages = conversation.messages;
              if (this.messages.length) {
                this.loading = false;
              }
            }
            if (!this.messages || !this.messages.length) {
              this.load();
            }
          }
        );
      } else {
        this.messages = [];
      }
    }
    this.userId = this.userService.profile.getValue()._id;
    this.templateService.loadAll(false);
  }

  ngOnInit(): void {
    const defaultSms = this.userService.sms.getValue();
    if (defaultSms) {
      this.message = defaultSms.content;
    }
    this.updateTimer = interval(3 * 1000).subscribe(() => {
      this.update();
    });
  }

  ngOnDestroy(): void {
    this.loadSubscription && this.loadSubscription.unsubscribe();
    this.updateTimer && this.updateTimer.unsubscribe();
    this.conversationLoadSubscription &&
      this.conversationLoadSubscription.unsubscribe();
    if (this.type == 'single') {
      this.contactService.contactConversation.next({
        contact: this.contact._id,
        messages: this.messages || []
      });
    }
  }

  load(): void {
    this.loading = true;
    this.loadSubscription && this.loadSubscription.unsubscribe();
    this.loadSubscription = this.smsService
      .getMessage(this.contact)
      .subscribe((messages) => {
        this.loading = false;
        this.messages = messages;
      });
  }

  update(): void {
    if (this.type == 'single') {
      this.loadSubscription && this.loadSubscription.unsubscribe();
      this.loadSubscription = this.smsService
        .getMessage(this.contact)
        .subscribe((messages) => {
          this.messages = messages;
        });
    } else {
      this.messages = [];
    }
  }

  setFocus(): void {
    this.toFocus = true;
  }

  isFocus(): any {
    return this.toFocus;
  }

  openMaterialsDlg(): void {
    const { videoIds, imageIds, pdfIds } = this.getMaterials();
    const selectedMaterials = [...videoIds, ...imageIds, ...pdfIds].map((e) => {
      return { _id: e };
    });
    this.dialog
      .open(MaterialBrowserComponent, {
        width: '98vw',
        maxWidth: '940px',
        data: {
          multiple: true,
          hideMaterials: selectedMaterials
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res && res.materials && res.materials.length) {
          res.materials.forEach((e, index) => {
            let url;
            switch (e.material_type) {
              case 'video':
                url = `${environment.website}/video?video=${e._id}`;
                break;
              case 'pdf':
                url = `${environment.website}/pdf?pdf=${e._id}`;
                break;
              case 'image':
                url = `${environment.website}/image?image=${e._id}`;
                break;
            }
            // first element insert
            if (
              index === 0 &&
              (!this.message || this.message.slice(-1) === '\n')
            ) {
              this.message = this.message + '\n' + url;
              return;
            }
            if (index === 0) {
              this.message = this.message + '\n\n' + url;
              return;
            }
            // middle element insert
            this.message = this.message + '\n' + url;

            if (index === res.materials.length - 1) {
              this.message += '\n';
            }
          });
        }
      });
  }

  getMaterials(): any {
    const videoIds = [];
    const pdfIds = [];
    const imageIds = [];

    const videoReg = new RegExp(
      environment.website + '/video[?]video=\\w+',
      'g'
    );
    const pdfReg = new RegExp(environment.website + '/pdf[?]pdf=\\w+', 'g');
    const imageReg = new RegExp(
      environment.website + '/image[?]image=\\w+',
      'g'
    );

    let matches = this.message.match(videoReg);
    if (matches && matches.length) {
      matches.forEach((e) => {
        const videoId = e.replace(environment.website + '/video?video=', '');
        videoIds.push(videoId);
      });
    }
    matches = this.message.match(pdfReg);
    if (matches && matches.length) {
      matches.forEach((e) => {
        const pdfId = e.replace(environment.website + '/pdf?pdf=', '');
        pdfIds.push(pdfId);
      });
    }
    matches = this.message.match(imageReg);
    if (matches && matches.length) {
      matches.forEach((e) => {
        const imageId = e.replace(environment.website + '/image?image=', '');
        imageIds.push(imageId);
      });
    }

    return {
      videoIds,
      imageIds,
      pdfIds
    };
  }

  send(): void {
    if (this.message === '' || this.message.replace(/\s/g, '').length == 0) {
      return;
    }
    const { videoIds, imageIds, pdfIds } = this.getMaterials();

    let contentToSend = this.message;
    videoIds.forEach((video) => {
      contentToSend = contentToSend.replace(
        environment.website + '/video?video=' + video,
        '{{' + video + '}}'
      );
    });
    pdfIds.forEach((pdf) => {
      contentToSend = contentToSend.replace(
        environment.website + '/pdf?pdf=' + pdf,
        '{{' + pdf + '}}'
      );
    });
    imageIds.forEach((image) => {
      contentToSend = contentToSend.replace(
        environment.website + '/image?image=' + image,
        '{{' + image + '}}'
      );
    });

    this.sending = true;
    let contacts;
    if (this.type == 'single') {
      contacts = [this.contact._id];
    } else {
      contacts = this.textContacts;
    }
    this.sendSubscription && this.sendSubscription.unsubscribe();
    this.sendSubscription = this.materialService
      .sendMessage({
        video_ids: videoIds,
        pdf_ids: pdfIds,
        image_ids: imageIds,
        content: contentToSend,
        contacts: contacts
      })
      .subscribe((res) => {
        this.sending = false;
        this.message = '';
        this.update();
        const count = videoIds.length + pdfIds.length + imageIds.length + 1;
        this.contactService.addLatestActivity(count + 2);
        this.dialogRef.close();
        // this.dialogRef.close({
        //   status: true,
        //   count: videoIds.length + pdfIds.length + imageIds.length + 1
        // });
      });
  }

  selectTemplate(template: Template): void {
    this.messageText.nativeElement.focus();
    const field = this.messageText.nativeElement;
    if (!this.message.replace(/(\r\n|\n|\r|\s)/gm, '')) {
      field.select();
      document.execCommand('insertText', false, template.content);
      return;
    }
    if (field.selectionEnd || field.selectionEnd === 0) {
      if (this.message[field.selectionEnd - 1] === '\n') {
        document.execCommand('insertText', false, template.content);
      } else {
        document.execCommand('insertText', false, '\n' + template.content);
      }
    } else {
      if (this.message.slice(-1) === '\n') {
        document.execCommand('insertText', false, template.content);
      } else {
        document.execCommand('insertText', false, '\n' + template.content);
      }
    }
  }

  insertTextContentValue(value: string): void {
    const field = this.messageText.nativeElement;
    field.focus();
    let cursorStart = this.message.length;
    let cursorEnd = this.message.length;
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

  keyTrigger(event): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (event.ctrlKey || event.altKey || event.shiftKey) {
        if (event.shiftKey && !event.ctrlKey && !event.altKey) {
          this.send();
        }
        return;
      } else {
        document.execCommand('insertText', false, '\n');
      }
    }
  }

  calcDate(date: any): number {
    const currentDate = new Date();
    const dateSent = new Date(date);
    return Math.floor(
      (Date.UTC(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate()
      ) -
        Date.UTC(
          dateSent.getFullYear(),
          dateSent.getMonth(),
          dateSent.getDate()
        )) /
        (1000 * 60 * 60 * 24)
    );
  }

  parseContent(content: string): any {
    return content.replace(/(https?:\/\/[^\s]+)/g, function (url) {
      return '<a href="' + url + '" target="_blank">' + url + '</a>';
    });
  }
}
