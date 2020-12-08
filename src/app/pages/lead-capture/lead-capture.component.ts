import { Component, OnInit } from '@angular/core';
import { DELAY } from 'src/app/constants/variable.constants';
import { MatDialog } from '@angular/material/dialog';
import { CustomFieldAddComponent } from 'src/app/components/custom-field-add/custom-field-add.component';
import { CustomFieldDeleteComponent } from 'src/app/components/custom-field-delete/custom-field-delete.component';
import { Garbage } from 'src/app/models/garbage.model';
import { UserService } from 'src/app/services/user.service';
import { deserialize } from 'v8';

@Component({
  selector: 'app-lead-capture',
  templateUrl: './lead-capture.component.html',
  styleUrls: ['./lead-capture.component.scss']
})
export class LeadCaptureComponent implements OnInit {
  times = DELAY;
  garbage: Garbage = new Garbage();
  saving = false;

  constructor(private dialog: MatDialog, public userService: UserService) {
    this.userService.garbage$.subscribe((res) => {
      if (res) {
        this.garbage.additional_fields = [
          ...this.garbage.additional_fields,
          ...res.additional_fields
        ];
      }
    });
  }

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
        if (res) {
          if (res.mode == 'text') {
            const data = {
              id: (this.garbage.additional_fields.length + 1).toString(),
              name: res.field,
              placeholder: res.placeholder,
              options: [],
              type: res.mode,
              status: false
            };
            this.garbage.additional_fields.push(data);
          } else {
            const data = {
              id: (this.garbage.additional_fields.length + 1).toString(),
              name: res.field,
              placeholder: '',
              options: res.options,
              type: res.mode,
              status: false
            };
            this.garbage.additional_fields.push(data);
          }
        }
      });
  }

  editField(editData: any): void {
    this.dialog
      .open(CustomFieldAddComponent, {
        position: { top: '100px' },
        width: '100vw',
        maxWidth: '400px',
        data: {
          field: editData
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res && res.mode == 'text') {
          editData.field_name = res.field;
          editData.placeholder = res.placeholder;
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
          const required_fields = this.garbage.additional_fields.filter(
            (field) => field.id != deleteData.id
          );
          this.garbage.additional_fields = [];
          this.garbage.additional_fields = required_fields;
        }
      });
  }

  statusChange(evt: any, field: any): void {
    field.status = evt.target.checked;
  }

  saveDelay(): void {
    this.saving = true;
    const data = new Garbage().deserialize(this.garbage);
    data.additional_fields = data.additional_fields.filter(
      (field) => field.id != '0' && field.id != '1' && field.id != '2'
    );
    this.userService.updateGarbage(data).subscribe(
      () => {
        this.saving = false;
        this.userService.updateGarbageImpl(data);
      },
      () => {
        this.saving = false;
      }
    );
  }
}
