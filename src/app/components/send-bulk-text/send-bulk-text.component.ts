import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { Contact } from 'src/app/models/contact.model';
import { Template } from 'src/app/models/template.model';
import { DealsService } from 'src/app/services/deals.service';
import { HandlerService } from 'src/app/services/handler.service';
import { TemplatesService } from 'src/app/services/templates.service';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';
import { MaterialBrowserComponent } from '../material-browser/material-browser.component';

@Component({
  selector: 'app-send-bulk-text',
  templateUrl: './send-bulk-text.component.html',
  styleUrls: ['./send-bulk-text.component.scss']
})
export class SendBulkTextComponent implements OnInit {
  dealId: string = '';
  contacts: Contact[] = [];
  message: string = '';
  userId: string = '';
  set = 'twitter';

  sending = false;
  sendSubscription: Subscription;
  @ViewChild('messageText') messageText: ElementRef;

  constructor(
    private dialogRef: MatDialogRef<SendBulkTextComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
    private toast: ToastrService,
    public templateService: TemplatesService,
    private dealService: DealsService,
    public userService: UserService,
    private handlerService: HandlerService
  ) {}

  ngOnInit(): void {
    if (this.data) {
      if (this.data.contacts.length) {
        this.data.contacts.forEach((e) => {
          const contact = new Contact().deserialize(e);
          this.contacts.push(contact);
        });
      }
      if (this.data.deal) {
        this.dealId = this.data.deal;
      }
    }
    this.templateService.loadAll(false);
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

    const contacts = [];
    this.contacts.forEach((e) => {
      contacts.push(e._id);
    });

    this.sending = true;
    this.sendSubscription && this.sendSubscription.unsubscribe();
    this.sendSubscription = this.dealService
      .sendText({
        video_ids: videoIds,
        pdf_ids: pdfIds,
        image_ids: imageIds,
        content: contentToSend,
        contacts: contacts,
        deal: this.dealId
      })
      .subscribe((res) => {
        this.sending = false;
        if (res['status']) {
          if (contacts.length > 1) {
            this.toast.success(
              'Your texts would be delivered. You can see all delivering status in header within 5 mins',
              'Text Sent'
            );
          } else {
            this.toast.success(
              'Your text is delivered successfully.',
              'Text Sent'
            );
          }
        }
        if (contacts.length > 1) {
          this.handlerService.updateQueueTasks();
        }
        this.dialogRef.close({
          status: true,
          count: videoIds.length + pdfIds.length + imageIds.length + 1
        });
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

  keyTrigger(event): void {
    if (event.key === 'Enter') {
      if (event.ctrlKey || event.altKey) {
        return;
      }
      if (!event.shiftKey) {
        event.preventDefault();
        this.send();
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
}
