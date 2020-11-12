import { Component, OnInit } from '@angular/core';
import { DELAY } from 'src/app/constants/variable.constants';
import { MatDialog } from '@angular/material/dialog';
import { CustomFieldAddComponent } from 'src/app/components/custom-field-add/custom-field-add.component';
import { CustomFieldDeleteComponent } from 'src/app/components/custom-field-delete/custom-field-delete.component';

@Component({
  selector: 'app-lead-capture',
  templateUrl: './lead-capture.component.html',
  styleUrls: ['./lead-capture.component.scss']
})
export class LeadCaptureComponent implements OnInit {
  times = DELAY;
  delay_time = '';
  required_fields = [
    { field_name: 'Name', placeholder: '', type: 'admin' },
    { field_name: 'Text', placeholder: '', type: 'admin' },
    { field_name: 'Eamil', placeholder: '', type: 'admin' }
  ];

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {}

  addField(): void {
    this.dialog
      .open(CustomFieldAddComponent, {
        position: { top: '100px' },
        width: '100vw',
        maxWidth: '400px'
      })
      .afterClosed()
      .subscribe((res) => {
        if (res.mode == 'text') {
          const data = {
            field_name: res.field,
            placeholder: res.placeholder,
            type: 'isNew'
          };
          this.required_fields.push(data);
        }
      });
  }

  editField(editData: any): void {
    this.dialog.open(CustomFieldAddComponent, {
      position: { top: '100px' },
      width: '100vw',
      maxWidth: '400px',
      data: {
        field: editData
      }
    });
  }

  deleteField(deleteData: any): void {
    this.dialog
      .open(CustomFieldDeleteComponent, {
        position: { top: '100px' },
        width: '100vw',
        maxWidth: '400px',
        data: {
          field: deleteData
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res == true) {
          const required_fields = this.required_fields.filter(
            (field) => field.field_name != deleteData.field_name
          );
          this.required_fields = [];
          this.required_fields = required_fields;
        }
      });
  }

  saveDelay(): void {}
}
