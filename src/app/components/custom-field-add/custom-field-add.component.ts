import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

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
  options = [{ name: 'Select 1', id: 'option1' }];
  constructor(private dialogRef: MatDialogRef<CustomFieldAddComponent>) {}

  ngOnInit(): void {}

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
        options: this.options,
        mode: 'dropdown'
      };
      this.dialogRef.close(data);
    }
  }

  addOption(): void {
    this.option_id++;
    const data = {
      name: 'Select 1',
      id: 'option' + this.option_id
    };
    this.options.push(data);
  }

  deleteOption(optionId: string): void {
    const options = this.options.filter((option) => option.id != optionId);
    this.options = [];
    this.options = options;
  }
}
