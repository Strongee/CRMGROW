import { Component, OnInit } from '@angular/core';
import { DELAY } from 'src/app/constants/variable.constants';
import { MatDialog } from '@angular/material/dialog';
import { CustomFieldAddComponent } from 'src/app/components/custom-field-add/custom-field-add.component';

@Component({
  selector: 'app-lead-capture',
  templateUrl: './lead-capture.component.html',
  styleUrls: ['./lead-capture.component.scss']
})
export class LeadCaptureComponent implements OnInit {
  times = DELAY;
  delay_time = '';
  required_fields = ['Name', 'Text', 'Email'];

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {}

  addField(): void {
    this.dialog.open(CustomFieldAddComponent, {
      position: { top: '100px' },
      width: '100vw',
      maxWidth: '400px'
    });
  }

  saveDelay(): void {}
}
