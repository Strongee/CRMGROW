import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-signature',
  templateUrl: './signature.component.html',
  styleUrls: ['./signature.component.scss']
})
export class SignatureComponent implements OnInit {
  templates = [
    { layout: 'img_text_hor', icon: '' },
    { layout: 'text_img_hor', icon: '' },
    { layout: 'text_img_ver', icon: '' },
    { layout: 'img_text_ver', icon: '' }
  ];
  currentTemplate = '';
  signature = '';

  constructor(private userService: UserService) {
    this.userService.profile.subscribe((profile) => {
      this.signature = profile.email_signature;
    });
  }

  ngOnInit(): void {}

  changeTemplate(template: any): void {
    this.currentTemplate = template.layout;
  }
}
