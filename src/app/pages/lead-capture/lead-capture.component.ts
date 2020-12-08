import { Component, OnInit } from '@angular/core';
import { DELAY } from 'src/app/constants/variable.constants';
import { MatDialog } from '@angular/material/dialog';
import { CustomFieldAddComponent } from 'src/app/components/custom-field-add/custom-field-add.component';
import { CustomFieldDeleteComponent } from 'src/app/components/custom-field-delete/custom-field-delete.component';
import { Garbage } from 'src/app/models/garbage.model';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-lead-capture',
  templateUrl: './lead-capture.component.html',
  styleUrls: ['./lead-capture.component.scss']
})
export class LeadCaptureComponent implements OnInit {
  times = DELAY;
  garbage: Garbage = new Garbage();
  saving = false;
  defaultField = [
    {
      id: '',
      name: 'Email',
      options: [],
      placeholder: 'email',
      status: false,
      type: 'text'
    },
    {
      id: '',
      name: 'Name',
      options: [],
      placeholder: 'name',
      status: false,
      type: 'text'
    },
    {
      id: '',
      name: 'Phone',
      options: [],
      placeholder: 'phone',
      status: false,
      type: 'text'
    }
  ];

  constructor(private dialog: MatDialog, public userService: UserService) {
    this.userService.garbage$.subscribe((res) => {
      if (res) {
        this.garbage = new Garbage().deserialize(res);
        this.defaultField[0].status = this.garbage.capture_field.email;
        this.defaultField[1].status = this.garbage.capture_field.first_name;
        this.defaultField[2].status = this.garbage.capture_field.cell_phone;
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
    this.userService.updateGarbage(this.garbage).subscribe(
      () => {
        this.saving = false;
        this.userService.updateGarbageImpl(this.garbage);
      },
      () => {
        this.saving = false;
      }
    );
  }
}
