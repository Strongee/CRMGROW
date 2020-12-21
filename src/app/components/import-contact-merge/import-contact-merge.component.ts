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
  primaryNotesSelectionModel = [];
  secondaryNotesSelectionModel = [];
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
          if (this.updateColumn[name] !== 'notes') {
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
              this.columns.push(name);
              this.previewColumns.push(name);
              if (this.isPrimaryActive()) {
                if (
                  (Array.isArray(
                    this.primaryContact[this.updateColumn[name]]
                  ) &&
                    this.primaryContact[this.updateColumn[name]].length) ||
                  (!Array.isArray(
                    this.primaryContact[this.updateColumn[name]]
                  ) &&
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
        }
        const notesColumns =
          this.primaryContact['notes'].length >
          this.secondaryContact['notes'].length
            ? this.primaryContact['notes'].length
            : this.secondaryContact['notes'].length;
        for (let i = 0; i < notesColumns; i++) {
          if (this.isPrimaryActive()) {
            if (this.primaryContact['notes'][i] !== '' && this.primaryContact['notes'][i] !== undefined) {
              this.primaryNotesSelectionModel.push(true);
            }
            if (this.secondaryContact['notes'][i] !== '' && this.secondaryContact['notes'][i] !== undefined) {
              this.secondaryNotesSelectionModel.push(false);
            }
          } else {
            if (this.primaryContact['notes'][i] !== '' && this.primaryContact['notes'][i] !== undefined) {
              this.primaryNotesSelectionModel.push(false);
            }
            if (this.secondaryContact['notes'][i] !== '' && this.secondaryContact['notes'][i] !== undefined) {
              this.secondaryNotesSelectionModel.push(true);
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
            this.columns.push(name);
            this.previewColumns.push(name);
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

        const previewIndex = this.previewColumns.indexOf('notes');
        if (previewIndex >= 0) {
          this.previewColumns.splice(previewIndex, 1);
        }
      }
      let isSecondaryEmail = false;
      let isSecondaryPhone = false;
      for (const key in this.updateColumn) {
        if (this.updateColumn[key] === 'secondary_email') {
          isSecondaryEmail = true;
        }
        if (this.updateColumn[key] === 'secondary_phone') {
          isSecondaryPhone = true;
        }
      }
      if (!isSecondaryEmail) {
        this.updateColumn['secondary_email'] = 'secondary_email';
      }
      if (!isSecondaryPhone) {
        this.updateColumn['secondary_phone'] = 'secondary_phone';
      }
      if (
        this.previewColumns.indexOf(this.updateColumn['secondary_email']) < 0
      ) {
        this.previewColumns.push('secondary_email');
      }
      if (
        this.previewColumns.indexOf(this.updateColumn['secondary_phone']) < 0
      ) {
        this.previewColumns.push('secondary_phone');
      }
    }
  }

  isContact(contact): any {
    if (contact._id) {
      return true;
    }
    return false;
  }

  getPrimaryNotes(): any {
    const result = [];
    if (this.primaryContact['notes']) {
      for (const note of this.primaryContact['notes']) {
        for (const key in note) {
          result.push(key);
        }
      }
    }

    return result;
  }

  getSecondaryNotes(): any {
    const result = [];
    if (this.secondaryContact['notes']) {
      for (const note of this.secondaryContact['notes']) {
        for (const key in note) {
          result.push(key);
        }
      }
    }
    return result;
  }

  getPreviewNotes(): any {
    const result = [];
    if (this.previewContact['notes']) {
      for (const note of this.previewContact['notes']) {
        for (const key in note) {
          result.push(key);
        }
      }
    }
    return result;
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
    this.dialogRef.close({ type: 'csv', merged });
  }

  update(): void {
    this.updating = true;
    const data = Object.assign({}, this.previewContact);
    const labelIndex = this.columns.indexOf(this.updateColumn['label']);
    if (labelIndex >= 0) {
      if (
        (this.isContact(this.primaryContact) &&
          this.primarySelectionModel[labelIndex]) ||
        (this.isContact(this.secondaryContact) &&
          this.secondarySelectionModel[labelIndex])
      ) {
        delete data.label;
      }
    }
    this.contactService.update(data).subscribe(
      (res) => {
        this.updating = false;
        if (res) {
          let merged;
          merged = {
            ...this.previewContact
          };
          if (this.previewContact.notes) {
            merged = {
              ...merged,
              notes: JSON.stringify(this.previewContact.notes)
            };
          }
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
    // this.primarySelectionModel = [];
    // this.secondarySelectionModel = [];

    if (this.isPrimaryActive()) {
      for (let i = 0; i < this.secondarySelectionModel.length; i++) {
        this.secondarySelectionModel[i] = true;
      }
      for (let i = 0; i < this.primarySelectionModel.length; i++) {
        this.primarySelectionModel[i] = false;
      }
      for (let i = 0; i < this.columns.length; i++) {
        const column = this.updateColumn[this.columns[i]];
        if (column === 'notes') {
          this.mergeColumnPreview(i, this.columns[i]);
        } else {
          this.mergeColumnPreview(i, this.columns[i]);
        }
      }
      this.selectedContact = 'Secondary';
      for (let i = 0; i < this.primaryNotesSelectionModel.length; i++) {
        this.primaryNotesSelectionModel[i] = false;
      }
      for (let i = 0; i < this.secondaryNotesSelectionModel.length; i++) {
        this.secondaryNotesSelectionModel[i] = true;
        this.mergeNotesPreview(i, 'secondary');
      }
    } else {
      for (let i = 0; i < this.primarySelectionModel.length; i++) {
        this.primarySelectionModel[i] = true;
      }
      for (let i = 0; i < this.secondarySelectionModel.length; i++) {
        this.secondarySelectionModel[i] = false;
      }
      for (let i = 0; i < this.columns.length; i++) {
        const column = this.updateColumn[this.columns[i]];
        if (column === 'notes') {
          this.mergeColumnPreview(i, this.columns[i]);
        } else {
          this.mergeColumnPreview(i, this.columns[i]);
        }
      }
      this.selectedContact = 'Primary';
      for (let i = 0; i < this.secondaryNotesSelectionModel.length; i++) {
        this.secondaryNotesSelectionModel[i] = false;
      }
      for (let i = 0; i < this.primaryNotesSelectionModel.length; i++) {
        this.primaryNotesSelectionModel[i] = true;
        this.mergeNotesPreview(i, 'primary');
      }
    }
  }

  changeCheck(row, column): void {
    if (this.primaryContact[this.updateColumn[column]]) {
      this.primarySelectionModel[row] = !this.primarySelectionModel[row];
    }
    if (this.secondaryContact[this.updateColumn[column]]) {
      this.secondarySelectionModel[row] = !this.secondarySelectionModel[row];
    }
    this.mergeColumnPreview(row, column);
  }

  changePrimarySelection(row, column): void {
    this.primarySelectionModel[row] = !this.primarySelectionModel[row];
    this.mergeColumnPreview(row, column);
  }

  changeSecondarySelection(row, column): void {
    this.secondarySelectionModel[row] = !this.secondarySelectionModel[row];
    this.mergeColumnPreview(row, column);
  }

  changePrimaryNotesSelection(row): void {
    this.primaryNotesSelectionModel[row] = !this.primaryNotesSelectionModel[row];
    this.mergeNotesPreview(row, 'primary');
  }

  changeSecondaryNotesSelection(row): void {
    this.secondaryNotesSelectionModel[row] = !this.secondaryNotesSelectionModel[row];
    this.mergeNotesPreview(row, 'secondary');
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
    let primaryColumnKey = '';
    let secondaryColumnKey = '';
    for (const key in this.updateColumn) {
      if (primaryFilter === this.updateColumn[key]) {
        primaryColumnKey = key;
      } else if (secondaryFilter === this.updateColumn[key]) {
        secondaryColumnKey = key;
      }
    }
    const primaryIndex = this.columns.indexOf(primaryColumnKey);
    const secondaryIndex = this.columns.indexOf(secondaryColumnKey);

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

  mergeColumnPreview(row, column): void {
    const updatedColumn = this.updateColumn[column];
    let i;
    for (let j = 0; j < this.columns.length; j++) {
      if (this.columns[j] === column) {
        i = j;
        break;
      }
    }
    if (this.isCheckable(updatedColumn)) {
      if (this.primarySelectionModel[i]) {
        this.previewContact[updatedColumn] = this.primaryContact[updatedColumn];
      } else {
        this.previewContact[updatedColumn] = this.secondaryContact[
          updatedColumn
        ];
      }
    } else {
      if (
        updatedColumn === 'primary_email' ||
        updatedColumn === 'primary_phone' ||
        updatedColumn === 'secondary_email' ||
        updatedColumn === 'secondary_phone'
      ) {
        const filter = updatedColumn.includes('email') ? 'email' : 'phone';
        const updatedFilter = updatedColumn.includes('email')
          ? 'email'
          : 'phone';
        const primaryFilter = 'primary_' + filter;
        const secondaryFilter = 'secondary_' + filter;
        const checkedValues = this.getAllCheckValues(updatedColumn);

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
          this.previewContact[updatedColumn] = '';
        }

        // secondary
        if (checkedValues.length > 1) {
          if (this.previewColumns.indexOf(secondaryFilter) < 0) {
            this.previewColumns.push(secondaryFilter);
          }

          if (checkedValues.length === 2) {
            this.previewContact[this.updateColumn[secondaryFilter]] =
              checkedValues[1];
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
                  this.previewContact[this.updateColumn[secondaryFilter]] =
                    res.selected;

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
                    const isExist = false;
                    for (
                      let k = 0;
                      k < this.previewContact.additional_data[filter].length;
                      k++
                    ) {
                      val.forEach((item, index) => {
                        val.splice(index, 1);
                      });
                    }
                    if (!isExist) {
                      this.previewContact.additional_data[
                        filter
                      ] = this.previewContact.additional_data[filter].concat(
                        val
                      );
                    }
                  } else {
                    this.previewContact.additional_data[
                      filter
                    ] = this.previewContact.additional_data[filter].concat(val);
                  }
                }
              });
          }
        }
      } else {
        if (updatedColumn === 'tags') {
          if (
            this.primarySelectionModel[i] &&
            this.secondarySelectionModel[i]
          ) {
            const mergeItems = [];
            if (this.secondaryContact[updatedColumn].length) {
              this.secondaryContact[updatedColumn].forEach((item, index) => {
                if (this.primaryContact[updatedColumn].indexOf(item) < 0) {
                  mergeItems.push(item);
                }
              });
            }
            this.previewContact[updatedColumn] = this.primaryContact[
              updatedColumn
            ].concat(mergeItems);
          } else {
            if (this.primarySelectionModel[i]) {
              this.previewContact[updatedColumn] = this.primaryContact[
                updatedColumn
              ];
            } else if (this.secondarySelectionModel[i]) {
              this.previewContact[updatedColumn] = this.secondaryContact[
                updatedColumn
              ];
            } else {
              this.previewContact[updatedColumn] = [];
            }
          }
        }
      }
    }
  }

  mergeNotesPreview(row, type): void {
    const mergeItems = [];
    const primaryNotes = this.getPrimaryNotes();
    const secondaryNotes = this.getSecondaryNotes();
    if (this.isPrimaryActive()) {
      if (type === 'primary') {
        for (let i = 0; i < primaryNotes.length; i++) {
          if (this.primaryNotesSelectionModel[i] && i !== row) {
            mergeItems.push(this.primaryContact['notes'][i]);
          }
        }
        for (let i = 0; i < secondaryNotes.length; i++) {
          if (this.secondaryNotesSelectionModel[i]) {
            mergeItems.push(this.secondaryContact['notes'][i]);
          }
        }
        if (this.primaryNotesSelectionModel[row]) {
          mergeItems.push(this.primaryContact['notes'][row]);
        }
      } else {
        for (let i = 0; i < primaryNotes.length; i++) {
          if (this.primaryNotesSelectionModel[i]) {
            mergeItems.push(this.primaryContact['notes'][i]);
          }
        }
        for (let i = 0; i < secondaryNotes.length; i++) {
          if (this.secondaryNotesSelectionModel[i] && i !== row) {
            mergeItems.push(this.secondaryContact['notes'][i]);
          }
        }
        if (this.secondaryNotesSelectionModel[row]) {
          mergeItems.push(this.secondaryContact['notes'][row]);
        }
      }
    } else {
      if (type === 'primary') {
        for (let i = 0; i < secondaryNotes.length; i++) {
          if (this.secondaryNotesSelectionModel[i] && i !== row) {
            mergeItems.push(this.secondaryContact['notes'][i]);
          }
        }
        for (let i = 0; i < primaryNotes.length; i++) {
          if (this.primaryNotesSelectionModel[i]) {
            mergeItems.push(this.primaryContact['notes'][i]);
          }
        }
        if (this.secondaryNotesSelectionModel[row]) {
          mergeItems.push(this.secondaryContact['notes'][row]);
        }
      } else {
        for (let i = 0; i < secondaryNotes.length; i++) {
          if (this.secondaryNotesSelectionModel[i]) {
            mergeItems.push(this.secondaryContact['notes'][i]);
          }
        }
        for (let i = 0; i < primaryNotes.length; i++) {
          if (this.primaryNotesSelectionModel[i] && i !== row) {
            mergeItems.push(this.primaryContact['notes'][i]);
          }
        }
        if (this.primaryNotesSelectionModel[row]) {
          mergeItems.push(this.primaryContact['notes'][row]);
        }
      }
    }
    this.previewContact['notes'] = mergeItems;
  }

  isSelectableColumn(column): any {
    if (ImportSelectableColumn.indexOf(column) < 0) {
      return false;
    }
    return true;
  }

  selectableContent(column, contact): any {
    let result = '';
    const updateColumn = this.updateColumn[column];

    if (updateColumn === 'tags') {
      const content = contact[column];
      for (let i = 0; i < content.length; i++) {
        if (!result.includes(content[i])) {
          if (i === content.length - 1) {
            result = result + content[i];
          } else {
            result = result + content[i] + '<br/>';
          }
        }
      }
      return result;
    } else if (updateColumn === 'notes') {
      if (contact['notes']) {
        const columnIndex = contact['notes'].findIndex((item) => item[column]);
        if (columnIndex >= 0) {
          return contact['notes'][columnIndex][column];
        } else {
          return '';
        }
      } else {
        return '';
      }
    }
  }

  getExceptNotesColumns(): any {
    const result = [];
    for (const key of this.previewColumns) {
      if (this.updateColumn[key] !== 'notes') {
        result.push(key);
      } else {
      }
    }
    return result;
  }

  getNotesColumn(row): any {
    for (const key in this.previewContact['notes'][row]) {
      return key;
    }
  }

  getNotesContents(row, contact): any {
    const result = [];
    if (contact['notes'] && contact['notes'].length) {
      for (const index of contact['notes']) {
        for (const key in index) {
          result.push(index[key]);
        }
      }
    }
    return result[row];
  }

  isShowColumn(contact, column): any {
    const updateColumn = this.updateColumn[column];
    if (this.isContact(contact) && updateColumn === 'notes') {
      return false;
    }
    if (
      !(contact[updateColumn] === '' || contact[updateColumn] === undefined)
    ) {
      if (updateColumn === 'notes') {
        if (Array.isArray(contact['notes']) !== undefined) {
          const index = contact['notes'].findIndex((item) => item[column]);
          if (index < 0) {
            return false;
          } else {
            if (
              contact['notes'][index][column] !== '' ||
              contact['notes'][index][column] !== ''
            ) {
              return true;
            }
            return false;
          }
        }
        return false;
      }
      return true;
    }
    return false;
  }
}
