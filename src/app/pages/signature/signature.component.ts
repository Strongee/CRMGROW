import { Component, OnInit } from '@angular/core';

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

  constructor() {}

  ngOnInit(): void {}

  changeTemplate(template: any): void {
    this.currentTemplate = template.layout;
  }
}
