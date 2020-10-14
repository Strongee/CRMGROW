import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-security',
  templateUrl: './security.component.html',
  styleUrls: ['./security.component.scss']
})
export class SecurityComponent implements OnInit {
  old_password = '';
  new_password = '';
  confirm_password = '';

  constructor() {}

  ngOnInit(): void {}

  saveChange(): void {}
}
