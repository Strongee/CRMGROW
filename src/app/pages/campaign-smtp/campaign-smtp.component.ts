import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-campaign-smtp',
  templateUrl: './campaign-smtp.component.html',
  styleUrls: ['./campaign-smtp.component.scss']
})
export class CampaignSmtpComponent implements OnInit {

  submitted = false;
  loading = false;
  senderName = '';
  senderEmail = '';
  smtpHost = '';
  smtpPort = '';
  password = '';
  enableSSL = true;

  constructor() { }

  ngOnInit(): void {
  }

  saveSMTP(): void {

  }

  cancel(): void {

  }

  setEnableSSL(): void {
    this.enableSSL = !this.enableSSL;
  }
}
