import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TemplatesService } from 'src/app/services/templates.service';
import { UserService } from 'src/app/services/user.service';
import { SmsService } from 'src/app/services/sms.service';
import { MaterialService } from 'src/app/services/material.service';
import { Template } from 'src/app/models/template.model';
import { MaterialAddComponent } from 'src/app/components/material-add/material-add.component';
import * as _ from 'lodash';
import { Contact } from 'src/app/models/contact.model';
import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit {
  contacts = [];
  selectedContact: Contact = new Contact();
  messages = [];
  messageText = '';
  showFileList = false;
  showMessage = false;
  isNew = false;
  newContact: Contact = new Contact();
  materials = [];
  materialType = '';
  selectedTemplate: Template = new Template();
  emailSubject = '';
  emailContent = '';
  siteUrl = environment.website;
  user_id = '';
  profileSubscription: Subscription;

  constructor(
    private dialog: MatDialog,
    public templateService: TemplatesService,
    private userService: UserService,
    private materialService: MaterialService,
    private smsService: SmsService
  ) {
    this.templateService.loadAll(false);
    this.profileSubscription = this.userService.profile$.subscribe(
      (profile) => {
        this.user_id = profile._id;
      }
    );
    this.smsService.getAllMessage().subscribe((res) => {
      res['data'].forEach((data) => {
        data.contact_detail.forEach((contact) => {
          this.contacts.push(new Contact().deserialize(contact));
          this.selectedContact = new Contact().deserialize(this.contacts[0]);
        });
        const message = {
          id: data.contact_detail[0]._id,
          messages: data.data
        };
        this.messages.push(message);
      });
    });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.profileSubscription && this.profileSubscription.unsubscribe();
  }

  selectContact(contact: any): void {
    this.selectedContact = { ...this.selectedContact, ...contact };
    this.isNew = false;
    this.showMessage = true;
  }

  addContacts(contact: any): void {
    this.newContact = { ...this.newContact, ...contact };
    const newData = {
      id: contact._id,
      messages: []
    };
    this.messages.push(JSON.parse(JSON.stringify(newData)));
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
          this.materials = [];
          this.materials = [...this.materials, ...res.materials];
          for (let i = 0; i < this.materials.length; i++) {
            let url = '';
            if (this.materials[i].hasOwnProperty('default_video')) {
              url = `${this.siteUrl}/video?video=${this.materials[i]._id}&user=${this.user_id}`;
            } else if (this.materials[i].hasOwnProperty('default_pdf')) {
              url = `${this.siteUrl}/pdf?pdf=${this.materials[i]._id}&user=${this.user_id}`;
            } else {
              url = `${this.siteUrl}/image?image=${this.materials[i]._id}&user=${this.user_id}`;
            }
            this.messageText += '\n' + url;
          }
        }
      });
  }

  selectTemplate(template: Template): void {
    this.selectedTemplate = template;
    this.emailSubject = this.selectedTemplate.subject;
    this.emailContent = this.selectedTemplate.content;
    this.messageText += '\n' + this.emailContent;
  }

  goToBack(): void {
    this.showMessage = false;
  }

  newMessage(): void {
    this.isNew = true;
  }

  sendMessage(): void {
    if (this.messageText == '') {
      return;
    }
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
    let data;
    if (this.isNew) {
      data = {
        video_ids: videoIds,
        pdf_ids: pdfIds,
        image_ids: imageIds,
        content: this.messageText,
        contacts: [this.newContact._id]
      };
    } else {
      data = {
        video_ids: videoIds,
        pdf_ids: pdfIds,
        image_ids: imageIds,
        content: this.messageText,
        contacts: [this.selectedContact._id]
      };
    }
    this.materialService.sendMessage(data).subscribe((res) => {
      if (res) {
        this.messages.forEach((messageList) => {
          if (this.isNew && messageList.id == this.newContact._id) {
            const message = {
              type: 0,
              content: this.messageText
            };
            messageList.messages.push(message);
            this.contacts.push(new Contact().deserialize(this.newContact));
          }
          if (!this.isNew && messageList.id == this.selectedContact._id) {
            const message = {
              type: 0,
              content: this.messageText
            };
            messageList.messages.push(message);
          }
        });
      }
    });
  }
}
