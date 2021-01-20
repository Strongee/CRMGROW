import { Component, OnInit } from '@angular/core';

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

  constructor() {}

  ngOnInit(): void {
    this.selectedContact = { ...this.selectedContact, ...this.contacts[0] };
  }

  selectContact(contact: any): void {
    this.selectedContact = { ...this.selectedContact, ...contact };
    this.showMessage = true;
  }

  openMaterialsDlg(): void {}
}
