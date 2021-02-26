import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';

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

  constructor(private userService: UserService) {}

  ngOnInit(): void {}

  saveSMTP(): void {
    const data = {
      host: this.smtpHost,
      port: this.smtpPort,
      user: this.senderName,
      pass: this.password,
      secure: this.enableSSL
    };
    this.userService.connectSMTP(data).subscribe(
      (res) => {
        if (res) {
        }
      },
      (error) => {}
    );
  }

  cancel(): void {}

  setEnableSSL(): void {
    this.enableSSL = !this.enableSSL;
  }
}
