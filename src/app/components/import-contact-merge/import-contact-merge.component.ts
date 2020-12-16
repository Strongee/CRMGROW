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
import { ContactService } from '../../services/contact.service';

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

  MERGETYPE = {
    CONTACT: 1,
    CSV: 2,
    CONTACT_CSV: 3
  };

  updating = false;
  merging = false;
  activity = 'Keep primary';
  followup = 'Both';
  automation = 'Both';
  notes = 'Both';

  mergeActions = ['Both', 'Keep primary', 'Remove'];

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

  contactCSVColumn = {
    first_name: 'first_name',
    last_name: 'last_name',
    primary_email: 'primary_email',
    primary_phone: 'primary_phone',
    secondary_email: 'secondary_email',
    secondary_phone: 'secondary_phone',
    address: 'address',
    city: 'city',
    state: 'state',
    zip: 'zip',
    label: 'label',
    country: 'country',
    source: 'source',
    brokerage: 'brokerage',
    tags: 'tags',
    recruiting_stage: 'recruiting_stage',
    website: 'website',
    notes: 'notes'
  };

  contactContactColumn = {
    ...this.contactCSVColumn,
    last_activity: 'last_activity',
    auto_follow_up: 'auto_follow_up',
    automation: 'automation'
  };

  selectedContact = 'Primary';
  previewContact;

  constructor(
    private dialogRef: MatDialogRef<ImportContactMergeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
    private contactService: ContactService
  ) {}

  ngOnInit(): void {
    this.loadContact();
  }

  loadContact(): void {
    if (this.data) {
      this.primaryContact = this.data.primary;
      this.secondaryContact = this.data.secondary;

      // load primary columns
      if (this.mergeType() === this.MERGETYPE.CSV) {
        this.updateColumn = this.data.updateColumn;
        for (const name in this.updateColumn) {
          if (
            (Array.isArray(this.primaryContact[this.updateColumn[name]]) &&
              this.primaryContact[this.updateColumn[name]].length) ||
            (Array.isArray(this.secondaryContact[this.updateColumn[name]]) &&
              this.secondaryContact[this.updateColumn[name]].length) ||
            (!Array.isArray(this.primaryContact[this.updateColumn[name]]) &&
              this.primaryContact[this.updateColumn[name]]) ||
            (!Array.isArray(this.secondaryContact[this.updateColumn[name]]) &&
              this.secondaryContact[this.updateColumn[name]])
          ) {
            this.columns.push(this.updateColumn[name]);
            this.previewColumns.push(this.updateColumn[name]);
            if (this.isPrimaryActive()) {
              if (
                (Array.isArray(this.primaryContact[this.updateColumn[name]]) &&
                  this.primaryContact[this.updateColumn[name]].length) ||
                (!Array.isArray(this.primaryContact[this.updateColumn[name]]) &&
                  this.primaryContact[this.updateColumn[name]])
              ) {
                this.primarySelectionModel.push(true);
              } else {
                this.primarySelectionModel.push(false);
              }
              this.secondarySelectionModel.push(false);
            } else {
              if (
                (Array.isArray(
                  this.secondaryContact[this.updateColumn[name]]
                ) &&
                  this.secondaryContact[this.updateColumn[name]].length) ||
                (!Array.isArray(
                  this.secondaryContact[this.updateColumn[name]]
                ) &&
                  this.secondaryContact[this.updateColumn[name]])
              ) {
                this.secondarySelectionModel.push(true);
              } else {
                this.secondarySelectionModel.push(false);
              }
              this.primarySelectionModel.push(false);
            }
          }
        }
        this.previewContact = Object.assign({}, this.primaryContact);
      } else {
        this.updateColumn = this.contactCSVColumn;
        for (const name in this.updateColumn) {
          if (
            (Array.isArray(this.primaryContact[this.updateColumn[name]]) &&
              this.primaryContact[this.updateColumn[name]].length) ||
            (Array.isArray(this.secondaryContact[this.updateColumn[name]]) &&
              this.secondaryContact[this.updateColumn[name]].length) ||
            (!Array.isArray(this.primaryContact[this.updateColumn[name]]) &&
              this.primaryContact[this.updateColumn[name]]) ||
            (!Array.isArray(this.secondaryContact[this.updateColumn[name]]) &&
              this.secondaryContact[this.updateColumn[name]])
          ) {
            this.columns.push(this.updateColumn[name]);
            this.previewColumns.push(this.updateColumn[name]);
            if (this.isContact(this.primaryContact)) {
              if (
                (Array.isArray(this.primaryContact[this.updateColumn[name]]) &&
                  this.primaryContact[this.updateColumn[name]].length) ||
                (!Array.isArray(this.primaryContact[this.updateColumn[name]]) &&
                  this.primaryContact[this.updateColumn[name]])
              ) {
                this.primarySelectionModel.push(true);
              } else {
                this.primarySelectionModel.push(false);
              }
              this.secondarySelectionModel.push(false);
            } else {
              if (
                (Array.isArray(
                  this.secondaryContact[this.updateColumn[name]]
                ) &&
                  this.secondaryContact[this.updateColumn[name]].length) ||
                (!Array.isArray(
                  this.secondaryContact[this.updateColumn[name]]
                ) &&
                  this.secondaryContact[this.updateColumn[name]])
              ) {
                this.secondarySelectionModel.push(true);
              } else {
                this.secondarySelectionModel.push(false);
              }
              this.primarySelectionModel.push(false);
            }
          }
        }
        if (this.isContact(this.primaryContact)) {
          this.previewContact = Object.assign({}, this.primaryContact);
        } else {
          this.previewContact = Object.assign({}, this.secondaryContact);
        }
      }
    }
  }

  isContact(contact): any {
    if (contact._id) {
      return true;
    }
    return false;
  }

  mergeType(): any {
    if (this.primaryContact._id && this.secondaryContact._id) {
      return this.MERGETYPE.CONTACT;
    } else {
      if (this.primaryContact._id || this.secondaryContact._id) {
        return this.MERGETYPE.CONTACT_CSV;
      }
    }
    return this.MERGETYPE.CSV;
  }

  mergeCSV(): void {
    const merged = {
      ...this.previewContact
    };
    this.dialogRef.close({ merged });
  }

  update(): void {
    this.updating = true;
    const data = Object.assign({}, this.previewContact);
    const labelIndex = this.columns.indexOf(this.updateColumn['label']);
    if (labelIndex >= 0) {
      if ((this.isContact(this.primaryContact) && this.primarySelectionModel[labelIndex]) ||
        (this.isContact(this.secondaryContact) && this.secondarySelectionModel[labelIndex])) {
        delete data.label;
      }
    }
    this.contactService.update(data).subscribe(
      (res) => {
        this.updating = false;
        if (res) {
          const merged = {
            ...this.previewContact
          };
          this.dialogRef.close({ type: 'csv', merged });
        }
      },
      (error) => {
        this.updating = false;
      }
    );
  }

  mergeContact(): void {
    const data = {
      primary_contact: this.primaryContact._id,
      secondary_contact: this.secondaryContact._id,
      activity_merge: this.activity,
      followup_merge: this.followup,
      automation_merge: this.automation,
      notes: this.notes
    };

    let labelName = this.previewContact.label;
    let labelId = this.previewContact.label_id;
    if (this.previewContact.label === this.primaryContact.label) {
      labelName = this.primaryContact.label;
      labelId = this.primaryContact.label_id;
      this.previewContact.label = this.primaryContact.label_id;
    } else {
      labelName = this.secondaryContact.label;
      labelId = this.secondaryContact.label_id;
      this.previewContact.label = this.secondaryContact.label_id;
    }

    for (const field in this.contactContactColumn) {
      if (field === 'primary_email') {
        data['email'] = this.previewContact[this.contactContactColumn[field]];
      } else if (field === 'primary_phone') {
        data['cell_phone'] = this.previewContact[
          this.contactContactColumn[field]
        ];
      } else {
        data[field] = this.previewContact[this.contactContactColumn[field]];
      }
    }

    this.merging = true;
    this.contactService.mergeContacts(data).subscribe(
      (res) => {
        this.merging = false;
        if (res) {
          const merged = {
            ...res,
            primary_email: res.email,
            primary_phone: res.cell_phone,
            label: labelName,
            label_id: labelId
          };

          this.dialogRef.close({ type: 'contact', merged });
        }
      },
      (error) => {
        this.merging = false;
      }
    );
  }

  isPrimaryActive(): any {
    if (this.mergeType() === this.MERGETYPE.CSV) {
      if (this.selectedContact === 'Primary') {
        return true;
      }
    } else {
      if (this.isContact(this.primaryContact)) {
        return true;
      }
    }
    return false;
  }

  changeContact($event): void {
    this.primarySelectionModel = [];
    this.secondarySelectionModel = [];

    if (this.isPrimaryActive()) {
      this.selectedContact = 'Secondary';
      for (const name in this.updateColumn) {
        if (this.secondaryContact[this.updateColumn[name]]) {
          this.secondarySelectionModel.push(true);
        } else {
          this.secondarySelectionModel.push(false);
        }
        this.primarySelectionModel.push(false);
      }
    } else {
      this.selectedContact = 'Primary';
      for (const name in this.updateColumn) {
        if (this.primaryContact[this.updateColumn[name]]) {
          this.primarySelectionModel.push(true);
        } else {
          this.primarySelectionModel.push(false);
        }
        this.secondarySelectionModel.push(false);
      }
    }
    this.mergeAllPreview();
  }

  changeCheck(row, column): void {
    if (this.primaryContact[this.updateColumn[column]]) {
      this.primarySelectionModel[row] = !this.primarySelectionModel[row];
    }
    if (this.secondaryContact[this.updateColumn[column]]) {
      this.secondarySelectionModel[row] = !this.secondarySelectionModel[row];
    }
    this.mergeColumnPreview(column);
  }

  changePrimarySelection(row, column): void {
    this.primarySelectionModel[row] = !this.primarySelectionModel[row];
    this.mergeColumnPreview(column);
  }

  changeSecondarySelection(row, column): void {
    this.secondarySelectionModel[row] = !this.secondarySelectionModel[row];
    this.mergeColumnPreview(column);
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

    if (this.isPrimaryActive()) {
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
    } else {
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

  mergeAllPreview(): void {
    for (let i = 0; i < this.columns.length; i++) {
      const column = this.columns[i];
      this.mergeColumnPreview(column);
    }
  }

  mergeColumnPreview(updatedColumn): void {
    const column = updatedColumn;
    let i;
    for (let j = 0; j < this.columns.length; j++) {
      if (this.columns[j] === column) {
        i = j;
        break;
      }
    }
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
        const updatedFilter = updatedColumn.includes('email')
          ? 'email'
          : 'phone';
        const primaryFilter = 'primary_' + filter;
        const secondaryFilter = 'secondary_' + filter;
        const checkedValues = this.getAllCheckValues(column);

        // additional
        if (this.isPrimaryActive()) {
          this.previewColumns['additional_data'] = Object.assign(
            {},
            this.primaryContact['additional_data']
          );
        } else {
          this.previewColumns['additional_data'] = Object.assign(
            {},
            this.secondaryContact['additional_data']
          );
        }

        // primary
        if (checkedValues.length) {
          this.previewContact[primaryFilter] = checkedValues[0];
          if (this.previewContact[secondaryFilter]) {
            this.previewContact[secondaryFilter] = '';
          }
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
            const mergeValues = [];
            for (let j = 1; j < checkedValues.length; j++) {
              mergeValues.push(checkedValues[j]);
            }

            this.dialog
              .open(ImportContactMergeConfirmComponent, {
                data: {
                  values: mergeValues,
                  type: filter
                }
              })
              .afterClosed()
              .subscribe((res) => {
                if (res) {
                  this.previewContact[secondaryFilter] = res.selected;

                  // set additional email
                  const idx = mergeValues.indexOf(res.selected);
                  if (idx >= 0) {
                    mergeValues.splice(idx, 1);
                  }

                  const val = [];
                  for (let j = 0; j < mergeValues.length; j++) {
                    val.push(mergeValues[j]);
                  }

                  if (!this.previewContact.additional_data) {
                    this.previewContact.additional_data = {};
                  }
                  if (!this.previewContact.additional_data[filter]) {
                    this.previewContact.additional_data[filter] = [];
                  }

                  if (this.previewContact.additional_data[filter].length) {
                    let isExist = false;
                    for (let k = 0; k < this.previewContact.additional_data[filter].length; k++) {
                      val.forEach((item, index) => {
                        val.splice(index, 1);
                      })
                    }
                    if (!isExist) {
                      this.previewContact.additional_data[filter] = this.previewContact.additional_data[filter].concat(val);
                    }
                  } else {
                    this.previewContact.additional_data[filter] = this.previewContact.additional_data[filter].concat(val);
                  }
                }
              });
          }
        }
      } else {
        if (this.primarySelectionModel[i] && this.secondarySelectionModel[i]) {
          const mergeItems = [];

          if (column === 'tags') {
            if (this.secondaryContact[column].length) {
              this.secondaryContact[column].forEach((item, index) => {
                if (this.primaryContact[column].indexOf(item) < 0) {
                  mergeItems.push(item);
                }
              });
            }
            this.previewContact[column] = this.primaryContact[column].concat(
              mergeItems
            );
          } else if (column === 'notes') {
            if (this.isPrimaryActive()) {
              for (let j = 0; j < this.primaryContact[column].length; j++) {
                mergeItems.push(this.primaryContact[column][j]);
              }
              for (let j = 0; j < this.secondaryContact[column].length; j++) {
                if (mergeItems.indexOf(this.secondaryContact[column][j]) < 0) {
                  mergeItems.push(this.secondaryContact[column][j]);
                }
              }
            } else {
              for (let j = 0; j < this.secondaryContact[column].length; j++) {
                mergeItems.push(this.secondaryContact[column][j]);
              }
              for (let j = 0; j < this.primaryContact[column].length; j++) {
                if (mergeItems.indexOf(this.primaryContact[column][j]) < 0) {
                  mergeItems.push(this.primaryContact[column][j]);
                }
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

  isSelectableColumn(column): any {
    if (ImportSelectableColumn.indexOf(column) < 0) {
      return false;
    }
    return true;
  }

  selectableContent(column, content): any {
    let result = '';
    if (content) {
      if (column === 'tags') {
        for (let i = 0; i < content.length; i++) {
          if (i === content.length - 1) {
            result = result + content[i];
          } else {
            result = result + content[i] + '<br/>';
          }
        }
        return result;
      } else if (column === 'notes') {
        return '...';
      }
    }
  }
}
