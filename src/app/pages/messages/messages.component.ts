import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
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
import { sortDateArray } from 'src/app/utils/functions';
import { STATUS } from 'src/app/constants/variable.constants';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit {
  STATUS = STATUS;

  loadingMessage = false;
  contacts = [];
  selectedContact: Contact = new Contact();
  messages = [];
  messageText = '';
  showFileList = false;
  showMessage = false;
  isNew = false;
  isSend = false;
  newContacts = [];
  materials = [];
  materialType = '';
  selectedTemplate: Template = new Template();
  emailSubject = '';
  emailContent = '';
  siteUrl = environment.website;
  user_id = '';
  messageLoadTimer;
  profileSubscription: Subscription;

  @ViewChild('scrollMe') private myScrollContainer: ElementRef;

  constructor(
    private dialog: MatDialog,
    public templateService: TemplatesService,
    private userService: UserService,
    private materialService: MaterialService,
    public smsService: SmsService
  ) {
    this.templateService.loadAll(false);
    this.loadMessage();
    this.smsService.loadAll(true);
    this.profileSubscription = this.userService.profile$.subscribe(
      (profile) => {
        this.user_id = profile._id;
      }
    );
  }

  ngOnInit(): void {
    this.messageLoadTimer = setInterval(() => {
      this.loadMessage();
    }, 5000);
  }

  ngOnDestroy(): void {
    this.profileSubscription && this.profileSubscription.unsubscribe();
    clearInterval(this.messageLoadTimer);
  }

  scrollToBottom(): void {}

  loadMessage(): void {
    this.smsService.messages$.subscribe((res) => {
      const messages = this.smsService.messages.getValue();
      this.contacts = [];
      for (let index = 0; index < messages.length; index++) {
        if (messages[index].contacts.length > 0) {
          let contact_item;
          if (messages[index].type == 1 && messages[index].status == 0) {
            contact_item = {
              unread: true,
              lastest_message: messages[index].content,
              lastest_at: messages[index].updated_at
            };
          } else {
            contact_item = {
              unread: false,
              lastest_message: messages[index].content,
              lastest_at: messages[index].updated_at
            };
          }

          this.contacts.push(
            Object.assign(
              new Contact().deserialize(messages[index].contacts[0]),
              contact_item
            )
          );
        }
      }
      this.contacts = sortDateArray(this.contacts, 'lastest_at', false);

      if (
        this.contacts.length &&
        this.selectedContact &&
        Object.keys(this.selectedContact).length == 0
      ) {
        this.defaultSelectContact(this.contacts[0]);
      }
    });
  }

  keyTrigger(evt: any): void {
    if (evt.key === 'Enter') {
      if (evt.ctrlKey || evt.altKey) {
        return;
      }
      if (!evt.shiftKey) {
        evt.preventDefault();
        this.sendMessage();
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
      return '<a href="' + url + '">' + url + '</a>';
    });
  }

  defaultSelectContact(contact: any): void {
    this.loadingMessage = true;
    this.selectedContact = contact;
    this.smsService.getMessage(this.selectedContact).subscribe((res) => {
      if (res) {
        this.loadingMessage = false;
        this.messages = [];
        const message = {
          id: contact._id,
          messages: res
        };
        this.messages.push(message);
      }
    });
    this.isNew = false;
    this.showMessage = true;
  }

  selectContact(contact: any): void {
    this.loadingMessage = true;
    this.selectedContact = contact;
    this.smsService.getMessage(this.selectedContact).subscribe((res) => {
      if (res) {
        if (res[res.length - 1].type == 1 && res[res.length - 1].status == 0) {
          this.smsService.markRead(res[res.length - 1]._id).subscribe((res) => {
            if (res && res['status']) {
              this.selectedContact.unread = false;
            }
          });
        }
        this.loadingMessage = false;
        this.messages = [];
        const message = {
          id: contact._id,
          messages: res
        };
        this.messages.push(message);
      }
    });
    this.isNew = false;
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
    this.newContacts = [];
  }

  sendMessage(): void {
    this.isSend = true;
    if (
      this.messageText == '' ||
      this.messageText.replace(/\s/g, '').length == 0
    ) {
      this.isSend = false;
      return;
    }
    if (
      (this.isNew && this.newContacts.length == 0) ||
      (!this.isNew && !this.selectedContact._id)
    ) {
      this.isSend = false;
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
    const newContactIds = [];
    if (this.newContacts.length > 0) {
      for (let i = 0; i < this.newContacts.length; i++) {
        newContactIds.push(this.newContacts[i]._id);
        const newData = {
          id: this.newContacts[i]._id,
          messages: []
        };
        this.messages.push(newData);
      }
    }
    let data;
    if (this.isNew) {
      data = {
        video_ids: videoIds,
        pdf_ids: pdfIds,
        image_ids: imageIds,
        content: this.messageText,
        contacts: newContactIds
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
      this.isSend = false;
      if (res) {
        this.messages.forEach((messageList) => {
          if (!this.isNew && messageList.id == this.selectedContact._id) {
            const message = {
              type: 0,
              content: this.messageText,
              updated_at: new Date()
            };
            messageList.messages.push(message);
            this.selectedContact.lastest_message = this.messageText;
            this.selectedContact.lastest_at = new Date();
            this.messageText = '';
            const pos = this.contacts.findIndex(
              (contact) => contact._id === this.selectedContact._id
            );
            if (pos != 0) {
              this.contacts.splice(pos, 1);
              this.contacts.unshift(this.selectedContact);
            }
          }
          if (this.isNew) {
            for (let i = 0; i < this.newContacts.length; i++) {
              if (
                messageList.id ==
                this.newContacts[this.newContacts.length - 1 - i]._id
              ) {
                const message = {
                  type: 0,
                  content: this.messageText,
                  updated_at: new Date()
                };
                messageList.messages.push(message);
              }
              this.newContacts[
                this.newContacts.length - 1 - i
              ].lastest_message = this.messageText;
              this.newContacts[
                this.newContacts.length - 1 - i
              ].lastest_at = new Date();
              this.contacts.unshift(
                this.newContacts[this.newContacts.length - 1 - i]
              );
            }
            this.isNew = false;
            this.selectedContact = this.contacts[0];
            this.messageText = '';
          }
          this.scrollToBottom();
        });
      }
    });
  }
}
