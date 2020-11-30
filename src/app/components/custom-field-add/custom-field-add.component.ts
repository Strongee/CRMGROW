import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { element } from 'protractor';

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
  options = [{ label: '', value: 'option-1' }];
  customFieldType = '';
  submitted = false;
  isSame = false;
  saving = false;

  constructor(
    private dialogRef: MatDialogRef<CustomFieldAddComponent>,
    private changeDetectorRef: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    if (this.data) {
      this.customFieldType = 'update';
      this.fieldName = this.data.field.name;
      if (this.data.field.placeholder) {
        this.suggestion = this.data.field.placeholder;
        this.typeOption = 'text';
      }
      if (this.data.field.options.length > 0) {
        this.options = this.data.field.options;
        this.typeOption = 'dropdown';
      }
    } else {
      this.customFieldType = 'create';
    }
  }

  addField(): void {
    this.saving = true;
    if (this.typeOption == 'text') {
      const data = {
        field: this.fieldName,
        placeholder: this.suggestion,
        mode: 'text'
      };
      this.saving = false;
      this.dialogRef.close(data);
    } else {
      const data = {
        field: this.fieldName,
        options: this.options,
        mode: 'dropdown'
      };
      this.saving = false;
      this.dialogRef.close(data);
    }
  }

  addOption(): void {
    this.option_id++;
    const data = {
      label: '',
      value: 'option-' + this.option_id
    };
    this.options.push(data);
  }

  deleteOption(index: number): void {
    this.options.splice(index, 1);
    this.isSame = false;
  }

  close(): void {
    this.dialogRef.close();
  }

  optionNameChange(evt: any): void {
    if (this.options.length > 1) {
      if (this.options.filter((option) => option.label == evt).length > 1) {
        this.isSame = true;
      } else {
        this.isSame = false;
      }
    } else {
      this.isSame = false;
    }
  }

  optionValueChange(option: any): void {
    option.value = option.label.replace(' ', '-');
  }
}
