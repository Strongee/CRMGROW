import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TemplatesService } from 'src/app/services/templates.service';
import { UserService } from 'src/app/services/user.service';
import { SmsService } from 'src/app/services/sms.service';
import { MaterialService } from 'src/app/services/material.service';
import { Template } from 'src/app/models/template.model';
import * as _ from 'lodash';
import { Contact } from 'src/app/models/contact.model';
import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';
import { sortDateArray } from 'src/app/utils/functions';
import { STATUS } from 'src/app/constants/variable.constants';
import { MaterialBrowserComponent } from 'src/app/components/material-browser/material-browser.component';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit {
  STATUS = STATUS;
  PanelView = {
    Contacts: 'contacts',
    Messages: 'messages',
    Files: 'files'
  };
  // Loading Contacts
  loadingContact = false;
  contacts = [];
  selectedContact: Contact = new Contact();
  // Loading Individual Contact messages
  loadingMessage = false;
  messages = [];
  // Message
  message = '';
  // Panel View for Mobile
  panel = this.PanelView.Contacts;
  // Message Loader and Updater Timer
  messageLoadSubscription: Subscription;
  messageLoadTimer;
  // Materials of selected contact
  materials = [];
  // contacts and sending status
  isNew = false;
  isSend = false;
  newContacts = [];

  // UI Elements
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  @ViewChild('messageText') messageText: ElementRef;
  constructor(
    private dialog: MatDialog,
    public templateService: TemplatesService,
    private materialService: MaterialService,
    public smsService: SmsService
  ) {
    this.templateService.loadAll(false);
  }

  ngOnInit(): void {
    this.loadingContact = true;
    this.smsService.loadAll(true);
    this.initSubscription();
    this.messageLoadTimer = setInterval(() => {
      this.smsService.loadAll(true);
    }, 2000);
  }

  ngOnDestroy(): void {
    clearInterval(this.messageLoadTimer);
  }

  scrollToBottom(): void {}

  initSubscription(): void {
    this.messageLoadSubscription = this.smsService.messages$.subscribe(
      (_messages) => {
        const messages = _messages;
        this.loadingContact = false;
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
      }
    );
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
    this.panel = this.PanelView.Messages;
  }

  goToBack(): void {
    this.panel = this.PanelView.Contacts;
  }

  toggleFileList(): void {
    if (this.panel != this.PanelView.Files) {
      this.panel = this.PanelView.Files;
    } else {
      this.panel = this.PanelView.Contacts;
    }
  }

  newMessage(): void {
    this.isNew = true;
    this.newContacts = [];
  }

  sendMessage(): void {
    if (
      this.message == '' ||
      this.message.replace(/(\r\n|\n|\r|\s)/gm, '').length == 0
    ) {
      return;
    }
    if (
      (this.isNew && this.newContacts.length == 0) ||
      (!this.isNew && !this.selectedContact._id)
    ) {
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
        content: contentToSend,
        contacts: newContactIds
      };
    } else {
      data = {
        video_ids: videoIds,
        pdf_ids: pdfIds,
        image_ids: imageIds,
        content: contentToSend,
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
            this.selectedContact.lastest_message = this.message;
            this.selectedContact.lastest_at = new Date();
            this.message = '';
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
            this.message = '';
          }
          this.scrollToBottom();
        });
      }
    });
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

  selectTemplate(template: Template): void {
    this.messageText.nativeElement.focus();
    const field = this.messageText.nativeElement;
    if (!this.message.replace(/(\r\n|\n|\r|\s)/g, '').length) {
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

  parseContent(content: string): any {
    return content.replace(/(https?:\/\/[^\s]+)/g, function (url) {
      return '<a href="' + url + '" target="_blank">' + url + '</a>';
    });
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
}
