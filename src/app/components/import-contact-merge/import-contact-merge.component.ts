import { Component, Inject, OnInit } from '@angular/core';
import { Contact } from '../../models/contact.model';
import { SelectionModel } from '@angular/cdk/collections';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef
} from '@angular/material/dialog';
import { ImportSelectableColumn } from '../../constants/variable.constants';
import { ImportContactMergeConfirmComponent } from '../import-contact-merge-confirm/import-contact-merge-confirm.component';

@Component({
  selector: 'app-import-contact-merge',
  templateUrl: './import-contact-merge.component.html',
  styleUrls: ['./import-contact-merge.component.scss']
})
export class ImportContactMergeComponent implements OnInit {
  primaryContact;
  secondaryContact;

  primarySelectionModel = [];
  secondarySelectionModel = [];
  updateColumn;
  columns = [];
  previewColumns = [];

  checkableColumn = [
    'first_name',
    'last_name',
    'address',
    'country',
    'city',
    'state',
    'zip',
    'label',
    'brokerage',
    'source'
  ];
  selectedContact = 'Primary';
  previewContact;

  constructor(
    private dialogRef: MatDialogRef<ImportContactMergeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadContact();
  }

  loadContact(): void {
    if (this.data) {
      this.primaryContact = this.data.primary;
      this.secondaryContact = this.data.secondary;
      this.previewContact = Object.assign({}, this.primaryContact);

      // load primary columns
      this.updateColumn = this.data.updateColumn;
      for (const name in this.updateColumn) {
        this.columns.push(this.updateColumn[name]);
        this.previewColumns.push(this.updateColumn[name]);
        this.primarySelectionModel.push(true);
        this.secondarySelectionModel.push(false);
      }
    }
  }

  merge(): void {
    const merged = {
      ...this.previewContact
    };
    this.dialogRef.close({ merged });
  }

  changeContact($event): void {
    if (this.selectedContact === 'Primary') {
      this.selectedContact = 'Secondary';
      for (let i = 0; i < this.primarySelectionModel.length; i++) {
        this.primarySelectionModel[i] = false;
        this.secondarySelectionModel[i] = true;
      }
    } else {
      this.selectedContact = 'Primary';
      for (let i = 0; i < this.secondarySelectionModel.length; i++) {
        this.primarySelectionModel[i] = true;
        this.secondarySelectionModel[i] = false;
      }
    }
    this.mergePreview();
  }

  changeCheck(row): void {
    this.primarySelectionModel[row] = !this.primarySelectionModel[row];
    this.secondarySelectionModel[row] = !this.secondarySelectionModel[row];
    this.mergePreview();
  }

  changePrimarySelection(row): void {
    this.primarySelectionModel[row] = !this.primarySelectionModel[row];
    this.mergePreview();
  }

  changeSecondarySelection(row): void {
    this.secondarySelectionModel[row] = !this.secondarySelectionModel[row];
    this.mergePreview();
  }

  isCheckable(column): any {
    if (this.checkableColumn.indexOf(column) >= 0) {
      return true;
    }
    return false;
  }

  getAllCheckValues(column): any {
    const result = [];
    const filter = column.includes('email') ? 'email' : 'phone';
    const primaryFilter = 'primary_' + filter;
    const secondaryFilter = 'secondary_' + filter;
    const primaryIndex = this.columns.indexOf(primaryFilter);
    const secondaryIndex = this.columns.indexOf(secondaryFilter);

    if (this.selectedContact === 'Primary') {
      if (this.primarySelectionModel[primaryIndex]) {
        result.push(this.primaryContact[primaryFilter]);
      }
      if (this.secondarySelectionModel[primaryIndex]) {
        if (result.indexOf(this.secondaryContact[primaryFilter]) < 0) {
          result.push(this.secondaryContact[primaryFilter]);
        }
      }
      if (this.primarySelectionModel[secondaryIndex]) {
        if (result.indexOf(this.primaryContact[secondaryFilter]) < 0) {
          result.push(this.primaryContact[secondaryFilter]);
        }
      }
      if (this.secondarySelectionModel[secondaryIndex]) {
        if (result.indexOf(this.secondaryContact[secondaryFilter]) < 0) {
          result.push(this.secondaryContact[secondaryFilter]);
        }
      }
    } else if (this.selectedContact === 'Secondary') {
      if (this.secondarySelectionModel[primaryIndex]) {
        if (result.indexOf(this.secondaryContact[primaryFilter]) < 0) {
          result.push(this.secondaryContact[primaryFilter]);
        }
      }
      if (this.primarySelectionModel[primaryIndex]) {
        if (result.indexOf(this.primaryContact[primaryFilter]) < 0) {
          result.push(this.primaryContact[primaryFilter]);
        }
      }
      if (this.secondarySelectionModel[secondaryIndex]) {
        if (result.indexOf(this.secondaryContact[secondaryFilter]) < 0) {
          result.push(this.secondaryContact[secondaryFilter]);
        }
      }
      if (this.primarySelectionModel[secondaryIndex]) {
        if (result.indexOf(this.primaryContact[secondaryFilter]) < 0) {
          result.push(this.primaryContact[secondaryFilter]);
        }
      }
    }
    return result;
  }

  mergePreview(): void {
    for (let i = 0; i < this.columns.length; i++) {
      const column = this.columns[i];
      if (this.isCheckable(column)) {
        if (this.primarySelectionModel[i]) {
          this.previewContact[column] = this.primaryContact[column];
        } else {
          this.previewContact[column] = this.secondaryContact[column];
        }
      } else {
        if (
          column === 'primary_email' ||
          column === 'primary_phone' ||
          column === 'secondary_email' ||
          column === 'secondary_phone'
        ) {
          const filter = column.includes('email') ? 'email' : 'phone';
          const primaryFilter = 'primary_' + filter;
          const secondaryFilter = 'secondary_' + filter;
          const checkedValues = this.getAllCheckValues(column);
          // primary
          if (checkedValues.length) {
            this.previewContact[column] = checkedValues[0];
          } else {
            this.previewContact[column] = '';
          }

          // secondary
          if (checkedValues.length > 1) {
            if (this.previewColumns.indexOf(secondaryFilter) < 0) {
              this.previewColumns.push(secondaryFilter);
            }
            if (checkedValues.length === 2) {
              this.previewContact[secondaryFilter] = checkedValues[1];
            } else {
              const emails = [];
              for (let j = 1; j < checkedValues.length; j++) {
                emails.push(checkedValues[j]);
              }
              if (column === 'primary_email') {
                this.dialog
                  .open(ImportContactMergeConfirmComponent, {
                    data: {
                      emails
                    }
                  })
                  .afterClosed()
                  .subscribe((res) => {
                    if (res) {
                      this.previewContact[secondaryFilter] = res.email;
                    }
                  });
              }
            }
          } else {
            if (this.previewContact[secondaryFilter]) {
              delete this.previewContact[secondaryFilter];
              const index = this.previewColumns.indexOf(secondaryFilter);
              this.previewColumns.splice(index, 1);
            }
          }

          // aditional
          if (checkedValues.length > 2) {
            if (!this.previewContact.additional_data) {
              this.previewContact.additional_data = {};
            }
            const val = [];
            for (let j = 2; j < checkedValues.length; j++) {
              val.push(checkedValues[j]);
            }
            this.previewContact.additional_data[filter] = val;
          }
        } else {
          if (
            this.primarySelectionModel[i] &&
            this.secondarySelectionModel[i]
          ) {
            const mergeItems = [];
            if (column === 'tags') {
              if (this.secondaryContact[column].length) {
                this.secondaryContact[column].forEach((item, index) => {
                  if (this.primaryContact[column].indexOf(item) >= 0) {
                    mergeItems.splice(index, 1);
                  }
                });
              }
              this.previewContact[column] = this.primaryContact[column].concat(
                mergeItems
              );
            } else if (column === 'note') {
              if (this.selectedContact === 'Primary') {
                for (let j = 0; j < this.primaryContact[column].length; j++) {
                  mergeItems.push(this.primaryContact[column][j]);
                }
                for (let j = 0; j < this.secondaryContact[column].length; j++) {
                  mergeItems.push(this.secondaryContact[column][j]);
                }
              } else {
                for (let j = 0; j < this.secondaryContact[column].length; j++) {
                  mergeItems.push(this.secondaryContact[column][j]);
                }
                for (let j = 0; j < this.primaryContact[column].length; j++) {
                  mergeItems.push(this.primaryContact[column][j]);
                }
              }
              this.previewContact[column] = mergeItems;
            }
          } else {
            if (this.primarySelectionModel[i]) {
              this.previewContact[column] = this.primaryContact[column];
            } else if (this.secondarySelectionModel[i]) {
              this.previewContact[column] = this.secondaryContact[column];
            } else {
              this.previewContact[column] = [];
            }
          }
        }
      }
    }
  }

  isSelectableColumn(column): any {
    if (ImportSelectableColumn.indexOf(column) < 0) {
      return false;
    }
    return true;
  }

  selectableContent(column, content): any {
    let result = '';
    if (column === 'tags') {
      for (let i = 0; i < content.length; i++) {
        if (i === content.length - 1) {
          result = result + content[i];
        } else {
          result = result + content[i] + '<br/>';
        }
      }
      return result;
    } else if (column === 'note') {
      for (let i = 0; i < content.length; i++) {
        // const values = content[i].content;
        // let value = '';
        // if (Array.isArray(values)) {
        //   for (let j = 0; j < values.length; j++) {
        //     if (j === values.length - 1) {
        //       value = value + values[j];
        //     } else {
        //       value = value + values[j] + ', ';
        //     }
        //   }
        //   result = result + content[i].title + ': ' + value + '<br/>';
        // } else {
        result =
          result + content[i].title + ': ' + content[i].content + '<br/>';
        // }
      }
      return result;
    }
  }
}
