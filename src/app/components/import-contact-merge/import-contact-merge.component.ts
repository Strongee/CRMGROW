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
  primarySecondarySelectionModel;
  secondarySecondarySelectionModel;
  updateColumn;
  columns = [];
  secondaryColumns = [];
  previewSecondaryColumns = [];
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
      this.previewContact.secondary = Object.assign(
        {},
        this.primaryContact.secondary
      );
      if (this.primaryContact.additional) {
        this.previewContact.addtional = Object.assign(
          {},
          this.primaryContact.additional
        );
      }
      // load primary columns
      this.updateColumn = this.data.updateColumn;
      for (const name in this.updateColumn) {
        this.columns.push(this.updateColumn[name]);
        this.primarySelectionModel.push(true);
        this.secondarySelectionModel.push(false);
      }

      // load secondary columns
      this.primarySecondarySelectionModel = {
        email: false,
        phone: false
      };
      this.secondarySecondarySelectionModel = {
        email: false,
        phone: false
      };

      if (this.primaryContact.secondary) {
        if (this.primaryContact.secondary.phone) {
          this.secondaryColumns.push('phone');
          this.primarySecondarySelectionModel.phone = true;
        }
        if (this.primaryContact.secondary.email) {
          this.secondaryColumns.push('email');
          this.primarySecondarySelectionModel.email = true;
        }
      } else {
        this.primaryContact.secondary = {};
      }

      if (this.secondaryContact.secondary) {
        if (this.secondaryContact.secondary.phone) {
          this.secondarySecondarySelectionModel.phone = true;
          if (this.secondaryColumns.indexOf('phone') < 0) {
            this.secondaryColumns.push('phone');
          }
        }
        if (this.secondaryContact.secondary.email) {
          this.secondarySecondarySelectionModel.email = true;
          if (this.secondaryColumns.indexOf('email') < 0) {
            this.secondaryColumns.push('email');
          }
        }
      } else {
        this.secondaryContact.secondary = {};
      }

      if (!this.previewContact.secondary) {
        this.previewContact.secondary = {};
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
      if (this.secondaryContact.secondary.phone) {
        this.secondarySecondarySelectionModel.phone = true;
      }
      if (this.secondaryContact.secondary.email) {
        this.secondarySecondarySelectionModel.email = true;
      }
      if (this.primaryContact.secondary.phone) {
        this.primarySecondarySelectionModel.phone = false;
      }
      if (this.primaryContact.secondary.email) {
        this.primarySecondarySelectionModel.email = false;
      }
    } else {
      this.selectedContact = 'Primary';
      for (let i = 0; i < this.secondarySelectionModel.length; i++) {
        this.primarySelectionModel[i] = true;
        this.secondarySelectionModel[i] = false;
      }
      if (this.secondaryContact.secondary.phone) {
        this.secondarySecondarySelectionModel.phone = false;
      }
      if (this.secondaryContact.secondary.email) {
        this.secondarySecondarySelectionModel.email = false;
      }
      if (this.primaryContact.secondary.phone) {
        this.primarySecondarySelectionModel.phone = true;
      }
      if (this.primaryContact.secondary.email) {
        this.primarySecondarySelectionModel.email = true;
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

  changePrimarySecondarySelection(column): any {
    this.primarySecondarySelectionModel[column] = !this
      .primarySecondarySelectionModel[column];
    this.mergePreview();
  }

  changeSecondarySecondarySelection(column): any {
    this.secondarySecondarySelectionModel[column] = !this
      .secondarySecondarySelectionModel[column];
    this.mergePreview();
  }

  isCheckable(column): any {
    if (this.checkableColumn.indexOf(column) >= 0) {
      return true;
    }
    return false;
  }

  hasSecondary(): any {
    if (this.secondaryColumns.length) {
      return true;
    }
    return false;
  }

  getAllCheckValues(index, column): any {
    const result = [];
    if (this.selectedContact === 'Primary') {
      if (this.primarySelectionModel[index]) {
        result.push(this.primaryContact[column]);
      }
      if (this.secondarySelectionModel[index]) {
        if (result.indexOf(this.secondaryContact[column]) < 0) {
          result.push(this.secondaryContact[column]);
        }
      }
      if (this.primarySecondarySelectionModel[column]) {
        if (result.indexOf(this.primaryContact.secondary[column]) < 0) {
          result.push(this.primaryContact.secondary[column]);
        }
      }
      if (this.secondarySecondarySelectionModel[column]) {
        if (result.indexOf(this.secondaryContact.secondary[column]) < 0) {
          result.push(this.secondaryContact.secondary[column]);
        }
      }
    } else if (this.selectedContact === 'Secondary') {
      if (this.secondarySelectionModel[index]) {
        if (result.indexOf(this.secondaryContact[column]) < 0) {
          result.push(this.secondaryContact[column]);
        }
      }
      if (this.primarySelectionModel[index]) {
        if (result.indexOf(this.primaryContact[column]) < 0) {
          result.push(this.primaryContact[column]);
        }
      }
      if (this.secondarySecondarySelectionModel[column]) {
        if (result.indexOf(this.secondaryContact.secondary[column]) < 0) {
          result.push(this.secondaryContact.secondary[column]);
        }
      }
      if (this.primarySecondarySelectionModel[column]) {
        if (result.indexOf(this.primaryContact.secondary[column]) < 0) {
          result.push(this.primaryContact.secondary[column]);
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
        if (column === 'email' || column === 'phone') {
          const checkedValues = this.getAllCheckValues(i, column);
          // primary
          if (checkedValues.length) {
            this.previewContact[column] = checkedValues[0];
          } else {
            this.previewContact[column] = '';
          }

          // secondary
          if (checkedValues.length > 1) {
            if (checkedValues.length === 2) {
              this.previewContact.secondary[column] = checkedValues[1];
            } else {
              const emails = [];
              for (let j = 1; j < checkedValues.length; j++) {
                emails.push(checkedValues[j]);
              }
              this.dialog
                .open(ImportContactMergeConfirmComponent, {
                  data: {
                    emails
                  }
                })
                .afterClosed()
                .subscribe((res) => {
                  if (res) {
                    this.previewContact.secondary[column] = res.email;
                  }
                });
            }

            if (this.previewSecondaryColumns.indexOf(column) < 0) {
              this.previewSecondaryColumns.push(column);
            }
          } else {
            if (this.previewContact.secondary[column]) {
              delete this.previewContact.secondary[column];
              const index = this.previewSecondaryColumns.indexOf(column);
              this.previewSecondaryColumns.splice(index, 1);
            }
          }

          // aditional
          if (checkedValues.length > 2) {
            if (!this.previewContact.additional) {
              this.previewContact.additional = {};
            }
            const val = [];
            for (let j = 2; j < checkedValues.length; i++) {
              val.push(checkedValues[j]);
            }
            this.previewContact.additional[column] = val;
          }
        } else {
          if (
            this.primarySelectionModel[i] &&
            this.secondarySelectionModel[i]
          ) {
            const mergeItems = this.secondaryContact[column];
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
        Object.keys(content[i]).forEach((key) => {
          const temp = key + ': ' + content[i][key];
          if (result.indexOf(temp) < 0) {
            result = result + temp + '<br/>';
          }
        });
      }
      return result;
    }
  }
}
