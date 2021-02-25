import { Component, OnInit, NgZone, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HelperService } from 'src/app/services/helper.service';
import { TemplatesService } from 'src/app/services/templates.service';
import { MaterialService } from 'src/app/services/material.service';
import { Template } from 'src/app/models/template.model';
import { MaterialAddComponent } from 'src/app/components/material-add/material-add.component';
import * as _ from 'lodash';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit {
  contacts = [
    {
      avatarName: 'DW',
      fullName: 'Donald Williams',
      cell_phone: '+12015550213',
      latest_message: "I'm a preview of the text message for you to see",
      received_at: '1/14/21',
      _id: '1'
    },
    {
      avatarName: 'HW',
      fullName: 'Hattie Webster',
      cell_phone: '+12057896648',
      latest_message: "I'm a preview of the text message for you to see",
      received_at: '1/14/21',
      _id: '2'
    }
  ];
  selectedContact = {
    avatarName: '',
    fullName: '',
    cell_phone: '',
    latest_message: '',
    received_at: '',
    _id: ''
  };
  messages = [
    'Hey, lets meet on dinner and discuss',
    'Sure, is tomorrow 1 pm okay?',
    'Hey, lets meet on dinner and discuss',
    'Sure, is tomorrow 1 pm okay?',
    'Hey, lets meet on dinner and discuss',
    'Sure, is tomorrow 1 pm okay?',
    'Hey, lets meet on dinner and discuss',
    'Sure, is tomorrow 1 pm okay?'
  ];
  messageText = '';
  showFileList = false;
  showMessage = false;
  materials = [];
  selectedTemplate: Template = new Template();
  emailSubject = '';
  emailContent = '';
  @ViewChild('autosize') autosize: CdkTextareaAutosize;

  constructor(
    private dialog: MatDialog,
    private helperSerivce: HelperService,
    public templateService: TemplatesService,
    private materialService: MaterialService,
    private _ngZone: NgZone
  ) {
    this.templateService.loadAll(false);
  }

  ngOnInit(): void {
    this.selectedContact = { ...this.selectedContact, ...this.contacts[0] };
  }

  selectContact(contact: any): void {
    this.selectedContact = { ...this.selectedContact, ...contact };
    this.showMessage = true;
  }

  openMaterialsDlg(): void {
    this.dialog
      .open(MaterialAddComponent, {
        width: '98vw',
        maxWidth: '500px'
      })
      .afterClosed()
      .subscribe((res) => {
        if (res && res.materials) {
          this.materials = [...this.materials, ...res.materials];
          for (let i = 0; i < res.materials.length; i++) {
            this.messageText += '\n' + res.materials[i].url;
          }
        }
      });
  }

  selectTemplate(template: Template): void {
    this.selectedTemplate = template;
    this.emailSubject = this.selectedTemplate.subject;
    this.emailContent = this.selectedTemplate.content;
    this.messageText += '\n' + this.emailContent.replace(/<[^>]*>/g, '');
  }

  goToBack(): void {
    this.showMessage = false;
  }

  sendMessage(): void {
    const videoIds = [];
    const pdfIds = [];
    const imageIds = [];
    for (let i = 0; i < this.materials.length; i++) {
      if (this.materials[i].hasOwnProperty('default_video')) {
        videoIds.push(this.materials[i]._id);
      } else if (this.materials[i].hasOwnProperty('default_pdf')) {
        pdfIds.push(this.materials[i]._id);
      } else {
        imageIds.push(this.materials[i]._id);
      }
    }
    const data = {
      video_ids: videoIds,
      pdf_ids: pdfIds,
      image_ids: imageIds,
      content: this.messageText,
      contacts: this.selectedContact
    };
    this.materialService.sendText(data, 'video').subscribe((res) => {
      if (res) {
        this.messages.push(this.messageText);
      }
    });
  }

  triggerResize(): void {
    this._ngZone.onStable
      .pipe(take(1))
      .subscribe(() => this.autosize.resizeToFitContent(true));
  }
}
