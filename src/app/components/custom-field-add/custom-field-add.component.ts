import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-custom-field-add',
  templateUrl: './custom-field-add.component.html',
  styleUrls: ['./custom-field-add.component.scss']
})
export class CustomFieldAddComponent implements OnInit {
  fieldName = '';
  constructor() {}

  ngOnInit(): void {}
}
