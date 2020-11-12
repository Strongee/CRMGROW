import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-custom-field-add',
  templateUrl: './custom-field-add.component.html',
  styleUrls: ['./custom-field-add.component.scss']
})
export class CustomFieldAddComponent implements OnInit {
  fieldName = '';
  typeOption = 'text';
  suggestion = '';
  option_id = 1;
  options = [{ name: '', id: 'option1' }];
  customFieldType = '';
  submitted = false;
  isSame = false;

  constructor(
    private dialogRef: MatDialogRef<CustomFieldAddComponent>,
    private changeDetectorRef: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    if (this.data) {
      this.customFieldType = 'update';
      this.fieldName = this.data.field.field_name;
      if (this.data.field.placeholder) {
        this.suggestion = this.data.field.placeholder;
        this.typeOption = 'text';
      }
      if (this.data.field.options) {
        this.options = this.data.field.options;
        this.typeOption = 'dropdown';
      }
      this.customFieldType = 'update';
      this.fieldName = this.data.field.field_name;
      this.suggestion = this.data.field.placeholder;
    } else {
      this.customFieldType = 'create';
    }
  }

  addField(): void {
    if (this.typeOption == 'text') {
      const data = {
        field: this.fieldName,
        placeholder: this.suggestion,
        mode: 'text'
      };
      this.dialogRef.close(data);
    } else {
      const data = {
        field: this.fieldName,
        options: this.options,
        mode: 'dropdown'
      };
      this.dialogRef.close(data);
    }
  }

  addOption(): void {
    this.option_id++;
    const data = {
      name: '',
      id: 'option' + this.option_id
    };
    this.options.push(data);
  }

  deleteOption(optionId: string): void {
    const options = this.options.filter((option) => option.id != optionId);
    this.options = [];
    this.options = options;
  }

  close(): void {
    this.dialogRef.close();
  }

  optionChange(evt: any): void {
    if (this.options.length > 1) {
      if (this.options.filter((option) => option.name == evt).length > 1) {
        this.isSame = true;
      } else {
        this.isSame = false;
      }
    }
  }
}
