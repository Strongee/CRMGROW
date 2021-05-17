import { Component, OnInit, ViewChild } from '@angular/core';
import { environment } from 'src/environments/environment';
import { FileUploader } from 'ng2-file-upload';
import { Papa } from 'ngx-papaparse';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { UserService } from '../../services/user.service';
import { ConfirmComponent } from '../confirm/confirm.component';
import { ImportContactEditComponent } from '../import-contact-edit/import-contact-edit.component';
import { ImportContactMergeComponent } from '../import-contact-merge/import-contact-merge.component';
import {
  DialogSettings,
  ImportSelectableColumn
} from '../../constants/variable.constants';
import { ContactService } from '../../services/contact.service';
import { HandlerService } from '../../services/handler.service';
import { ElementRef } from '@angular/core';
import { NotifyComponent } from '../notify/notify.component';
import { ToastrService } from 'ngx-toastr';
import { saveAs } from 'file-saver';
import { ContactEditComponent } from '../contact-edit/contact-edit.component';
import { validateEmail } from '../../helper';
const phone = require('phone');
const PhoneNumber = require('awesome-phonenumber');

@Component({
  selector: 'app-upload-contacts',
  templateUrl: './upload-contacts.component.html',
  styleUrls: ['./upload-contacts.component.scss']
})
export class UploadContactsComponent implements OnInit {
  @ViewChild('file') file: any;
  public uploader: FileUploader = new FileUploader({
    url: environment.api + 'contact/import-csv',
    authToken: this.userService.getToken(),
    itemAlias: 'csv'
  });
  public overwriter: FileUploader = new FileUploader({
    url: environment.api + 'contact/overwrite-csv',
    authToken: this.userService.getToken(),
    itemAlias: 'csv'
  });
  public headers = [];
  public lines = [];
  private dataText = '';
  private failedData = [];

  columns = [];
  selectedColumn;
  selectedColumnIndex;

  updateColumn = {};

  step = 1;

  submitted = false;

  importError = false;
  uploading = false;

  contacts = []; // Contacts is loaded from file directly
  contactsToUpload = []; // Contacts to upload

  groupRecordsByEmail = {};
  groupRecordsByPhone = {};

  sameContacts = [];
  sameEmails = [];
  samePhones = [];

  filePlaceholder = 'Drag your csv files here or click in this area.';
  isCSVFile = false;
  fileSize;
  fileName = '';

  previewEmails = []; // Emails to merge contacts
  previewPhones = []; // Phones to merge contacts
  previewContacts = [];
  duplicateItems = [];
  selectedImportContacts = new SelectionModel<any>(true, []);
  selectedMergeContacts = [];
  firstImport = true;
  uploadPercent = 0;
  isUploading = false;
  UPLOAD_ONCE = 100;
  overallContacts = 0;
  uploadedCount = 0;
  isCompleteUpload = false;
  isUploadCancel = false;
  uploadedContacts = [];
  uploadLines = [];
  uploadHeaders = [];
  uploadSubTitle = '';
  checkingDuplicate = false;
  isDuplicatedExist = false;
  initPropertyColumn = {};
  initColumns = [];
  exceedContacts = [];

  duplicateLoading = false;
  lastUploadCount = 0;
  bulkDeleting = [];
  invalidContacts = [];
  invalidEmailContacts = [];
  invalidPhoneContacts = [];

  constructor(
    private dialogRef: MatDialogRef<UploadContactsComponent>,
    private userService: UserService,
    private dialog: MatDialog,
    private papa: Papa,
    private contactService: ContactService,
    private handlerService: HandlerService,
    private scrollElement: ElementRef,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
      if (this.uploader.queue.length > 1) {
        this.uploader.queue.splice(0, 1);
      }
    };

    this.uploader.onCompleteItem = (
      item: any,
      response: any,
      status: any,
      headers: any
    ) => {
      response = JSON.parse(response);

      if (response.status) {
        this.uploading = false;
        this.uploadedContacts = response.duplicate_contacts;
        this.exceedContacts = [
          ...this.exceedContacts,
          ...response.exceed_contacts
        ];
        this.isUploading = false;
        this.isCompleteUpload =
          this.uploadedCount >= this.overallContacts ? true : false;
        this.uploadPercent = Math.round(
          (this.uploadedCount / this.overallContacts) * 100
        );
        this.uploadSubTitle =
          this.uploadedCount + ' / ' + this.overallContacts + ' imported';
        if (this.uploadedContacts && this.uploadedContacts.length) {
          for (const contact of this.uploadedContacts) {
            this.failedData.push(contact);
          }
        }
        if (this.uploadedCount < this.overallContacts) {
          let uploads;
          if (this.uploadLines.length >= this.UPLOAD_ONCE) {
            uploads = this.uploadLines.slice(0, this.UPLOAD_ONCE);
            this.uploadLines.splice(0, this.UPLOAD_ONCE);
            this.uploadedCount += this.UPLOAD_ONCE;
          } else {
            uploads = this.uploadLines.slice(0, this.uploadLines.length);
            this.uploadLines.splice(0, this.uploadLines.length);
            this.uploadedCount += uploads.length;
          }
          this.uploadRecursive(uploads);
        } else {
          if (this.exceedContacts.length > 0) {
            for (const contact of this.exceedContacts) {
              if (!Array.isArray(contact['tags'])) {
                if (!!contact['tags']) {
                  contact['tags'] = contact['tags'].split(',');
                }
              }
            }
            this.step = 6;
          } else {
            this.confirmDuplicates();
          }
        }
        // this.confirmDuplicates();
      } else {
        this.uploading = false;
        this.isUploading = false;
        this.isUploadCancel = true;
        const from = this.uploadedCount - this.lastUploadCount;
        const exceed = this.contactsToUpload.slice(from);
        this.exceedContacts = [...this.exceedContacts, ...exceed];

        if (this.exceedContacts.length > 0) {
          for (const contact of this.exceedContacts) {
            if (!Array.isArray(contact['tags'])) {
              if (!!contact['tags']) {
                contact['tags'] = contact['tags'].split(',');
              }
            }
            // if (!Array.isArray(contact['note'])) {
            //   if (!!contact['note']) {
            //     contact['note'] = contact['note'].split()
            //   }
            // }
          }
          this.step = 6;
        } else {
          this.confirmDuplicates();
        }
      }
    };
  }

  readFile(evt): any {
    this.initImport();
    const file = evt.target.files[0];
    if (!file) {
      return false;
    }
    if (!file.name?.toLowerCase().endsWith('.csv')) {
      this.isCSVFile = false;
      this.filePlaceholder =
        'File is not matched. \n Drag your csv files here or click in this area.';
      return false;
    }

    this.isCSVFile = true;
    this.filePlaceholder = 'File uploaded "' + file.name?.toLowerCase() + '".';
    this.fileName = file.name;
    this.fileSize = this.humanFileSize(file.size);
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      const text = fileReader.result + '';
      this.papa.parse(text, {
        skipEmptyLines: true,
        complete: (results, file) => {

          this.columns = results.data[0];
          this.lines = results.data.slice(1);

          // remove blank header
          const blankIndexes = [];
          for (let i = 0; i < results.data[0].length; i++) {
            if (results.data[0][i] === '') {
              blankIndexes.push(i);
            }
          }

          for (let i = blankIndexes.length - 1; i >= 0; i--) {
            this.columns.splice(blankIndexes[i], 1);
            for (const line of this.lines) {
              line.splice(blankIndexes[i], 1);
            }
          }

          const blankRows = [];
          for (let i = 0; i < this.lines.length; i++) {
            let isBlank = true;
            for (const value of this.lines[i]) {
              if (value !== '') {
                isBlank = false;
              }
            }
            if (isBlank) {
              blankRows.push(i);
            }
          }

          for (let i = blankRows.length - 1; i >= 0; i--) {
            this.lines.splice(blankRows[i], 1);
          }

          this.dataText = this.papa.unparse(this.lines);

          const sameColumns = {};
          for (let i = 0; i < this.columns.length; i++) {
            let column = this.columns[i];
            column = column.replace(/(\s\(\d\))$/, '');
            if (!sameColumns[column]) {
              sameColumns[column] = 1;
            } else {
              this.columns[i] = column + ' (' + sameColumns[column] + ')';
              sameColumns[column]++;
            }
          }

          this.selectedColumn = this.columns[0];
          this.selectedColumnIndex = 0;
          this.step = 2;
        }
      });
    };
    fileReader.readAsText(evt.target.files[0]);
  }

  humanFileSize(bytes, si = true, dp = 1): any {
    const thresh = si ? 1000 : 1024;

    if (Math.abs(bytes) < thresh) {
      return bytes + ' B';
    }

    const units = si
      ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
      : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    let u = -1;
    const r = 10 ** dp;

    do {
      bytes /= thresh;
      ++u;
    } while (
      Math.round(Math.abs(bytes) * r) / r >= thresh &&
      u < units.length - 1
    );

    return bytes.toFixed(dp) + ' ' + units[u];
  }

  nextStep(): void {
    this.step++;
  }

  prevStep(): void {
    this.step--;
    if (this.step === 2) {
      this.importError = false;
    }
  }

  selectField(): void {
    if (this.isCSVFile) {
      this.step = 2;
    }
  }

  initImport(): void {
    this.isCSVFile = false;
    this.fileName = '';
    this.filePlaceholder = 'Drag your csv files here or click in this area.';
    this.updateColumn = {};
  }

  review(): void {
    this.contacts = [];
    this.contactsToUpload = [];
    this.sameEmails = [];
    this.samePhones = [];
    this.groupRecordsByEmail = {};
    this.groupRecordsByPhone = {};
    this.previewEmails = [];
    this.previewPhones = [];
    this.sameContacts = [];
    this.invalidContacts = [];
    this.invalidEmailContacts = [];
    this.invalidPhoneContacts = [];
    this.failedData = [];
    let importField = false;
    this.initPropertyColumn = { ...this.updateColumn };
    this.initColumns = [...this.columns];
    this.columns.some((e) => {
      if (this.updateColumn[e]) {
        importField = true;
        return true;
      }
    });
    if (importField) {
      this.lines.map((record) => {
        const contact = {};
        let isInvalidEmail = false;
        let isInvalidPhone = false;
        record.map((e, index) => {
          const originColumn = this.columns[index];
          const newColumn = this.updateColumn[originColumn];
          if (newColumn) {
            if (
              newColumn === 'primary_email' ||
              newColumn === 'secondary_email'
            ) {
              contact[newColumn] = e;
              if (!validateEmail(e)) {
                if (e !== '') {
                  isInvalidEmail = true;
                }
              }
            }
            if (
              newColumn === 'primary_phone' ||
              newColumn === 'secondary_phone'
            ) {
              contact[newColumn] = e;
              if (e !== '') {
                if (this.isValidPhone(e)) {
                  contact[newColumn] = phone(e)[0];
                } else {
                  isInvalidPhone = true;
                }
              }
            } else if (newColumn === 'notes') {
              if (!!e) {
                if (Array.isArray(contact[newColumn])) {
                  contact[newColumn].push(e);
                } else {
                  contact[newColumn] = [e];
                }
              }
            } else {
              contact[newColumn] = e ? e.trim() : e;
            }
          }
        });
        if (isInvalidEmail || isInvalidPhone) {
          if (isInvalidEmail && isInvalidPhone) {
            this.invalidContacts.push({
              ...contact,
              id: 'ep-' + this.contacts.length
            });
          } else {
            if (isInvalidEmail) {
              this.invalidEmailContacts.push({
                ...contact,
                id: 'e-' + this.contacts.length
              });
            } else if (isInvalidPhone) {
              this.invalidPhoneContacts.push({
                ...contact,
                id: 'p-' + this.contacts.length
              });
            }
          }
        } else {
          this.contacts.push({ ...contact, id: this.contacts.length });
        }
      });

      if (
        this.invalidEmailContacts.length > 0 ||
        this.invalidPhoneContacts.length > 0 ||
        this.invalidContacts.length > 0
      ) {
        this.rebuildColumns();
        this.rebuildInvalidContacts(this.invalidContacts);
        this.rebuildInvalidContacts(this.invalidPhoneContacts);
        this.rebuildInvalidContacts(this.invalidEmailContacts);
        this.step = 7;
      } else {
        this.duplicateLoading = true;
        const _SELF = this;
        setTimeout(function () {
          _SELF
            .checkDuplicate()
            .then((res) => {
              _SELF.duplicateLoading = false;
              _SELF.rebuildColumns();
              _SELF.rebuildContacts();
              _SELF.isDuplicatedEmail();
              if (res) {
                _SELF.step = 3;
              } else {
                _SELF.step = 4;
                _SELF.contactsToUpload = _SELF.contacts;
                _SELF.selectAllContacts();
              }
            })
            .finally(() => {
              _SELF.duplicateLoading = false;
            });
        }, 100);
      }
    } else {
      this.importError = true;
    }
  }

  checkOtherColumn(): any {
    for (let i = 0; i < this.contacts.length; i++) {
      if (this.contacts[i]['other']) {
        return true;
      }
    }
    return false;
  }

  rebuildColumns(): void {
    const rebuildColumns = [];
    for (let i = 0; i < this.columns.length; i++) {
      if (this.updateColumn[this.columns[i]] === 'notes') {
        delete this.updateColumn[this.columns[i]];
        if (!this.updateColumn['notes']) {
          this.updateColumn['notes'] = 'notes';
          if (rebuildColumns.indexOf('notes') < 0) {
            rebuildColumns.push('notes');
          }
        }
      } else {
        rebuildColumns.push(this.columns[i]);
      }
    }
    this.columns = rebuildColumns;
    const newUpdateColumn = {};
    const newColumns = [];
    for (const key in this.updateColumn) {
      if (this.updateColumn[key] === 'first_name') {
        newUpdateColumn[key] = 'first_name';
      }
    }
    for (const key in this.updateColumn) {
      if (this.updateColumn[key] === 'last_name') {
        newUpdateColumn[key] = 'last_name';
      }
    }
    for (const key in this.updateColumn) {
      if (this.updateColumn[key] === 'primary_email') {
        newUpdateColumn[key] = 'primary_email';
      }
    }
    for (const key in this.updateColumn) {
      if (this.updateColumn[key] === 'primary_phone') {
        newUpdateColumn[key] = 'primary_phone';
      }
    }
    for (const key in this.updateColumn) {
      if (this.updateColumn[key] === 'secondary_email') {
        newUpdateColumn[key] = 'secondary_email';
      }
    }
    for (const key in this.updateColumn) {
      if (this.updateColumn[key] === 'secondary_phone') {
        newUpdateColumn[key] = 'secondary_phone';
      }
    }
    for (const key in this.updateColumn) {
      if (
        this.updateColumn[key] !== 'first_name' ||
        this.updateColumn[key] !== 'last_name' ||
        this.updateColumn[key] !== 'primary_email' ||
        this.updateColumn[key] !== 'primary_phone' ||
        this.updateColumn[key] !== 'secondary_email' ||
        this.updateColumn[key] !== 'secondary_phone'
      ) {
        newUpdateColumn[key] = this.updateColumn[key];
      }
    }

    for (const key in newUpdateColumn) {
      newColumns.push(key);
    }

    for (const column of rebuildColumns) {
      if (newColumns.indexOf(column) < 0) {
        newColumns.push(column);
      }
    }

    this.updateColumn = newUpdateColumn;
    this.columns = newColumns;
  }

  rebuildInvalidContacts(contacts): void {
    if (contacts.length > 0) {
      contacts.forEach((contact) => {
        for (let i = 0; i < ImportSelectableColumn.length; i++) {
          if (ImportSelectableColumn[i] === 'tags') {
            const val = contact[ImportSelectableColumn[i]];
            if (val) {
              const tags = [];
              const tagArray = val.split(',');
              for (let j = 0; j < tagArray.length; j++) {
                if (tags.indexOf(tagArray[j]) < 0) {
                  if (tagArray[j] !== '') {
                    tags.push(tagArray[j]);
                  }
                }
              }
              contact[ImportSelectableColumn[i]] = tags;
            }
          }
        }
      });
    }
  }
  rebuildContacts(): void {
    if (this.contacts.length) {
      this.contacts.forEach((contact) => {
        for (let i = 0; i < ImportSelectableColumn.length; i++) {
          if (ImportSelectableColumn[i] === 'tags') {
            const val = contact[ImportSelectableColumn[i]];
            if (val) {
              const tags = [];
              const tagArray = val.split(',');
              for (let j = 0; j < tagArray.length; j++) {
                if (tags.indexOf(tagArray[j]) < 0) {
                  if (tagArray[j] !== '') {
                    tags.push(tagArray[j]);
                  }
                }
              }
              contact[ImportSelectableColumn[i]] = tags;
            }
          }
        }
      });
    }
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

    const content = contact[updateColumn];
    if (content) {
      for (let i = 0; i < content.length; i++) {
        if (!result.includes(content[i])) {
          if (i === content.length - 1) {
            result = result + content[i];
          } else {
            result = result + content[i] + ', ';
          }
        }
      }
    }
    return result;
  }

  isContact(contact): any {
    if (contact._id) {
      return true;
    }
    return false;
  }

  isDuplicatedEmail(): any {
    const emailKey = 'primary_email';
    const phoneKey = 'primary_phone';
    for (let i = 0; i < this.contacts.length; i++) {
      for (let j = i; j < this.contacts.length; j++) {
        if (j === i) {
          continue;
        } else {
          if (
            this.contacts[i][emailKey] &&
            this.contacts[j][emailKey] &&
            this.contacts[i][emailKey].toLowerCase() ===
              this.contacts[j][emailKey].toLowerCase()
          ) {
            return true;
          }
          if (
            this.contacts[i][phoneKey] &&
            this.contacts[j][phoneKey] &&
            this.getInternationalPhone(this.contacts[i][phoneKey]) ===
              this.getInternationalPhone(this.contacts[j][phoneKey])
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }
  checkDuplicate(): Promise<any> {
    return new Promise<any>((resolve) => {
      let emailKey = '';
      let phoneKey = '';
      let firstNameKey = '';
      let lastNameKey = '';
      for (const key in this.updateColumn) {
        if (this.updateColumn[key] === 'primary_email') {
          emailKey = key;
        }
        if (this.updateColumn[key] === 'primary_phone') {
          phoneKey = key;
        }
        if (this.updateColumn[key] === 'first_name') {
          firstNameKey = key;
        }
        if (this.updateColumn[key] === 'last_name') {
          lastNameKey = key;
        }
      }

      const mergeList = [];

      for (let i = 0; i < this.contacts.length; i++) {
        const firstContact = this.contacts[i];
        let isNewList = true;
        let merge = [];
        let selectedListIndex = -1;
        for (let k = 0; k < mergeList.length; k++) {
          if (mergeList[k].length) {
            for (let l = 0; l < mergeList[k].length; l++) {
              if (firstContact.id === mergeList[k][l].id) {
                isNewList = false;
                merge = mergeList[k];
                selectedListIndex = k;
                break;
              }
            }
          }
        }

        if (isNewList) {
          merge.push(firstContact);
        }

        for (let j = i; j < this.contacts.length; j++) {
          if (j === i) {
            continue;
          }
          const secondContact = this.contacts[j];

          let isExistSecond = false;
          for (let k = 0; k < mergeList.length; k++) {
            if (mergeList[k].length) {
              for (let l = 0; l < mergeList[k].length; l++) {
                if (secondContact.id === mergeList[k][l].id) {
                  isExistSecond = true;
                  break;
                }
              }
            }
          }

          if (!isExistSecond) {
            if (firstNameKey && lastNameKey) {
              if (
                !!firstContact.first_name &&
                !!firstContact.last_name &&
                !!secondContact.first_name &&
                !!secondContact.last_name &&
                firstContact.first_name.toLowerCase() ===
                  secondContact.first_name.toLowerCase() &&
                firstContact.last_name.toLowerCase() ===
                  secondContact.last_name.toLowerCase()
              ) {
                merge.push(secondContact);
                continue;
              }
            }

            if (emailKey) {
              if (
                !!firstContact.primary_email &&
                !!secondContact.primary_email &&
                firstContact.primary_email.toLowerCase() ===
                  secondContact.primary_email.toLowerCase()
              ) {
                merge.push(secondContact);
                continue;
              }
            }

            if (phoneKey) {
              if (
                !!firstContact.primary_phone &&
                !!secondContact.primary_phone &&
                this.getInternationalPhone(firstContact.primary_phone) ===
                  this.getInternationalPhone(secondContact.primary_phone)
              ) {
                merge.push(secondContact);
                continue;
              }
            }
          }
        }
        if (isNewList) {
          mergeList.push(merge);
        } else {
          mergeList[selectedListIndex] = merge;
        }
      }

      this.bulkDeleting = [];
      mergeList.forEach((e, index) => {
        if (e.length > 1) {
          this.sameContacts.push(e);
          this.bulkDeleting.push(false);
          this.selectedMergeContacts.push(new SelectionModel<any>(true, []));
        } else if (e.length === 1) {
          this.contactsToUpload.push(e[0]);
        }
      });

      if (this.sameContacts.length > 0) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }

  checkDuplicateColumn(dupIndex, contact, column): any {
    const key = this.updateColumn[column];
    if (
      key === 'primary_email' ||
      key === 'primary_phone' ||
      key === 'first_name' ||
      key === 'last_name'
    ) {
      for (const contactItem of this.sameContacts[dupIndex]) {
        if (key === 'primary_phone') {
          if (
            !!contactItem[key] &&
            !!contact[key] &&
            this.getInternationalPhone(contactItem[key]) === this.getInternationalPhone(contact[key]) &&
            contactItem.id !== contact.id
          ) {
            return true;
          }
        } else {
          if (
            !!contactItem[key] &&
            !!contact[key] &&
            contactItem[key].toLowerCase() === contact[key].toLowerCase() &&
            contactItem.id !== contact.id
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }

  merge(dupIndex): void {
    const contactIds = this.selectedMergeContacts[dupIndex].selected;
    const mergeContacts = [];
    if (contactIds && contactIds.length > 1) {
      for (const id of contactIds) {
        const index = this.sameContacts[dupIndex].findIndex(
          (item) => item.id === id
        );
        if (index >= 0) {
          mergeContacts.push(
            Object.assign({}, this.sameContacts[dupIndex][index])
          );
        }
      }
    }

    this.dialog
      .open(ImportContactMergeComponent, {
        ...DialogSettings.UPLOAD,
        data: {
          contacts: mergeContacts,
          updateColumn: { ...this.updateColumn }
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.toastr.success('Contacts successfully merged.');
          const merged = res.merged;
          for (const id of contactIds) {
            this.selectedMergeContacts[dupIndex].deselect(id);
            const sameIndex = this.sameContacts[dupIndex].findIndex(
              (item) => item.id === id
            );
            this.sameContacts[dupIndex].splice(sameIndex, 1);
            const contactIndex = this.contacts.findIndex(
              (item) => item.id === id
            );
            this.contacts.splice(contactIndex, 1);
          }

          if (merged['secondary_email']) {
            let secondaryEmailKey = '';
            for (const key in this.updateColumn) {
              if (this.updateColumn[key] === 'secondary_email') {
                secondaryEmailKey = key;
              }
            }
            if (secondaryEmailKey !== '') {
              if (this.columns.indexOf(secondaryEmailKey) < 0) {
                this.columns.push(secondaryEmailKey);
              }
            } else {
              this.updateColumn['secondary_email'] = 'secondary_email';
              this.columns.push('secondary_email');
            }
          }

          if (merged['secondary_phone']) {
            let secondaryPhoneKey = '';
            for (const key in this.updateColumn) {
              if (this.updateColumn[key] === 'secondary_phone') {
                secondaryPhoneKey = key;
              }
            }
            if (secondaryPhoneKey !== '') {
              if (this.columns.indexOf(secondaryPhoneKey) < 0) {
                this.columns.push(secondaryPhoneKey);
              }
            } else {
              this.updateColumn['secondary_phone'] = 'secondary_phone';
              this.columns.push('secondary_phone');
            }
          }
          let count = this.sameContacts[dupIndex].length;
          this.sameContacts[dupIndex].splice(count, 1, merged);
          count = this.contacts.length;
          this.contacts.splice(count, 1, merged);
          if (this.duplicateItems.length) {
            this.duplicateItems[dupIndex] = false;
          }
          this.checkOtherColumn();
        }
      });
  }

  isContactExist(): any {
    for (let i = 0; i < this.contacts.length; i++) {
      if (this.contacts[i]._id) {
        return true;
      }
    }
    return false;
  }

  getDuplicateContactsText(dupIndex): any {
    const emailKey = 'primary_email';
    const phoneKey = 'primary_phone';
    const firstNameKey = 'first_name';
    const lastNameKey = 'last_name';

    let isEmailDuplicate = false;
    let isPhoneDuplicate = false;
    let isFirstNameDuplicate = false;
    let isLastNameDuplicate = false;

    if (this.sameContacts[dupIndex].length > 1) {
      for (let i = 0; i < this.sameContacts[dupIndex].length; i++) {
        for (let j = i; j < this.sameContacts[dupIndex].length; j++) {
          if (i === j) {
            continue;
          } else {
            if (
              !!this.sameContacts[dupIndex][i][emailKey] &&
              !!this.sameContacts[dupIndex][j][emailKey] &&
              this.sameContacts[dupIndex][i][emailKey].toLowerCase() ===
                this.sameContacts[dupIndex][j][emailKey].toLowerCase()
            ) {
              isEmailDuplicate = true;
            }
            if (
              this.sameContacts[dupIndex][i][phoneKey] &&
              this.sameContacts[dupIndex][j][phoneKey] &&
              this.getInternationalPhone(this.sameContacts[dupIndex][i][phoneKey]) ===
                this.getInternationalPhone(this.sameContacts[dupIndex][j][phoneKey])
            ) {
              isPhoneDuplicate = true;
            }
            if (
              this.sameContacts[dupIndex][i][firstNameKey] &&
              this.sameContacts[dupIndex][j][firstNameKey] &&
              this.sameContacts[dupIndex][i][firstNameKey].toLowerCase() ===
                this.sameContacts[dupIndex][j][firstNameKey].toLowerCase()
            ) {
              isFirstNameDuplicate = true;
            }
            if (
              this.sameContacts[dupIndex][i][lastNameKey] &&
              this.sameContacts[dupIndex][j][lastNameKey] &&
              this.sameContacts[dupIndex][i][lastNameKey].toLowerCase() ===
                this.sameContacts[dupIndex][j][lastNameKey].toLowerCase()
            ) {
              isLastNameDuplicate = true;
            }
          }
        }
      }
    }

    const duplicatedKey = [];
    if (isEmailDuplicate) {
      duplicatedKey.push('email');
    }
    if (isPhoneDuplicate) {
      duplicatedKey.push('phone');
    }
    if (isFirstNameDuplicate) {
      duplicatedKey.push('first name');
    }
    if (isLastNameDuplicate) {
      duplicatedKey.push('last name');
    }

    if (duplicatedKey.length > 0) {
      let message = '';
      for (let i = 0; i < duplicatedKey.length; i++) {
        if (i === duplicatedKey.length - 1) {
          message += duplicatedKey[i];
        } else {
          message += duplicatedKey[i] + ', ';
        }
      }
      message += ' of contacts are duplicated.';
      return message.charAt(0).toUpperCase() + message.slice(1);
    }
    return '';
  }

  goToReview(): void {
    const csvImport = this.isContactExist();
    const csvContacts = [];
    let isDuplicateKey = false;
    this.duplicateItems = [];
    this.isDuplicatedExist = this.isDuplicatedEmail();
    this.sameContacts.forEach((dupItem, index) => {
      let emailKey = '';
      let phoneKey = '';
      for (const key in this.updateColumn) {
        if (this.updateColumn[key] === 'primary_email') {
          emailKey = key;
        }
        if (this.updateColumn[key] === 'primary_phone') {
          phoneKey = key;
        }
      }
      if (emailKey || phoneKey) {
        this.duplicateItems.push(false);
        for (let i = 0; i < dupItem.length; i++) {
          for (let j = i; j < dupItem.length; j++) {
            if (i === j) {
              continue;
            }
            if (
              dupItem[i]['primary_email'] !== '' &&
              dupItem[j]['primary_email'] !== '' &&
              dupItem[i]['primary_email'] !== undefined &&
              dupItem[j]['primary_email'] !== undefined &&
              dupItem[i]['primary_email'] !== null &&
              dupItem[j]['primary_email'] !== null &&
              dupItem[i]['primary_email'].toLowerCase() ===
                dupItem[j]['primary_email'].toLowerCase()
            ) {
              isDuplicateKey = true;
              this.duplicateItems[index] = true;
              if (this.duplicateItems && this.duplicateItems.length > 0) {
                let id = 'contact-group-';
                for (let k = 0; k < this.duplicateItems.length; k++) {
                  if (this.duplicateItems[k] === true) {
                    id = id + k.toString();
                    const el = document.getElementById(id);
                    el.scrollIntoView();
                    break;
                  }
                }
              }
              return;
            }
            if (
              dupItem[i]['primary_phone'] !== '' &&
              dupItem[j]['primary_phone'] !== '' &&
              dupItem[i]['primary_phone'] !== undefined &&
              dupItem[j]['primary_phone'] !== undefined &&
              dupItem[i]['primary_phone'] !== null &&
              dupItem[j]['primary_phone'] !== null &&
              this.getInternationalPhone(dupItem[i]['primary_phone']) ===
                this.getInternationalPhone(dupItem[j]['primary_phone'])
            ) {
              isDuplicateKey = true;
              this.duplicateItems[index] = true;
              if (this.duplicateItems && this.duplicateItems.length > 0) {
                let id = 'contact-group-';
                for (let k = 0; k < this.duplicateItems.length; k++) {
                  if (this.duplicateItems[k] === true) {
                    id = id + k.toString();
                    const el = document.getElementById(id);
                    el.scrollIntoView();
                    break;
                  }
                }
              }
              return;
            }
          }
        }
      }
      if (!isDuplicateKey) {
        for (const item of dupItem) {
          const contactIdx = this.contactsToUpload.findIndex((contact) => {
            return (
              contact.id === item.id ||
              (contact['primary_email'] !== '' &&
                item['primary_email'] !== '' &&
                contact['primary_email'] !== undefined &&
                item['primary_email'] !== undefined &&
                contact['primary_email'] !== null &&
                item['primary_email'] !== null &&
                contact['primary_email'].toLowerCase() ===
                  item['primary_email'].toLowerCase()) ||
              (contact['primary_phone'] !== '' &&
                item['primary_phone'] !== '' &&
                contact['primary_phone'] !== undefined &&
                item['primary_phone'] !== undefined &&
                contact['primary_phone'] !== null &&
                item['primary_phone'] !== null &&
                this.getInternationalPhone(contact['primary_phone']) ===
                  this.getInternationalPhone(item['primary_phone']))
            );
          });
          if (contactIdx < 0) {
            this.contactsToUpload.push(item);
          }
        }
      }
      for (let i = 0; i < dupItem.length; i++) {
        if (!dupItem[i]._id) {
          csvContacts.push({
            ...dupItem[i],
            email: dupItem[i].primary_email,
            cell_phone: dupItem[i].primary_phone
          });
        }
      }
    });

    if (!isDuplicateKey) {
      for (let i = 0; i < this.duplicateItems.length; i++) {
        if (this.duplicateItems[i] === true) {
          return;
        }
      }
      if (this.firstImport) {
        // this.firstImport = false;
        this.step = 4;
        this.selectAllForce();
      } else {
        if (csvContacts.length) {
          this.uploading = true;
          this.contactService.bulkCreate(csvContacts).subscribe(
            (res) => {
              this.uploading = false;
              if (res && res.failure && res.failure.length) {
                this.failedData = res.failure;
                this.confirmDuplicates();
              } else {
                this.toastr.success('Contacts successfully imported.');
                this.handlerService.bulkContactAdd$();
                this.dialogRef.close({created: true});
              }
            },
            (error) => {
              this.uploading = false;
              this.dialogRef.close({});
            }
          );
        } else {
          this.toastr.success('Contacts successfully imported.');
          this.handlerService.bulkContactAdd$();
          this.dialogRef.close({created: true});
        }
      }
    }
  }

  confirmDuplicates(): void {
    this.firstImport = false;
    this.selectedImportContacts.clear();
    if (this.failedData.length) {
      this.contacts = [];
      this.sameContacts = [];
      this.selectedMergeContacts = [];
      let tagsKey = 'tags';
      let noteKey = 'notes';
      for (const key in this.updateColumn) {
        if (this.updateColumn[key] === 'primary_email') {
          for (let i = 0; i < this.columns.length; i++) {
            if (this.columns[i] === key) {
              this.columns[i] = 'primary_email';
            }
          }
          delete this.updateColumn[key];
          this.updateColumn['primary_email'] = 'primary_email';
        } else if (this.updateColumn[key] === 'primary_phone') {
          for (let i = 0; i < this.columns.length; i++) {
            if (this.columns[i] === key) {
              this.columns[i] = 'primary_phone';
            }
          }
          delete this.updateColumn[key];
          this.updateColumn['primary_phone'] = 'primary_phone';
        } else if (this.updateColumn[key] === 'tags') {
          tagsKey = key;
        } else if (this.updateColumn[key] === 'notes') {
          noteKey = key;
        }
      }

      this.failedData.forEach((contact, index) => {
        if (contact._id) {
          contact.id = contact._id;
          contact.primary_email = contact.email;
          delete contact.email;
          contact.primary_phone = contact.cell_phone;
          delete contact.cell_phone;
        } else {
          contact.id = index;
          contact.primary_email = contact.email;
          delete contact.email;
          contact.primary_phone = contact.cell_phone;
          delete contact.cell_phone;
          const tags = contact.tags;
          if (tags) {
            if (Array.isArray(tags)) {
              contact.tags = tags;
            } else {
              contact.tags = [tags];
            }
          }
        }

        if (contact.label !== undefined && contact.label._id !== undefined) {
          const labelName = contact.label.name;
          const labelId = contact.label._id;
          delete contact.label;
          contact['label'] = labelName;
          contact['label_id'] = labelId;
        }

        if (!contact._id && contact.notes) {
          // if (Array.isArray(contact.data.notes)) {
          contact.notes = JSON.parse(contact.notes);
          // } else {
          //   contact.data.notes = JSON.stringify(contact.data.notes);
          // }
        }
        const contactIndex = this.contacts.findIndex(
          (item) => item.id === contact.id
        );
        if (contactIndex < 0) {
          this.contacts.push(contact);
        }
      });

      this.uploadPercent = 100;
      this.uploadSubTitle =
        this.overallContacts + ' / ' + this.overallContacts + ' contacts';

      this.checkingDuplicate = true;
      const dupTest = this.checkDuplicate();
      if (dupTest) {
        this.step = 3;
        this.checkingDuplicate = false;
      } else {
        this.step = 4;
        this.checkingDuplicate = false;
        this.contactsToUpload = this.contacts;
      }
    } else {
      this.toastr.success('Contacts successfully imported.');
      this.handlerService.bulkContactAdd$();
      this.dialogRef.close({created: true});
    }
  }

  upload(): void {
    if (
      this.selectedImportContacts.selected &&
      this.selectedImportContacts.selected.length <= 0
    ) {
      return;
    }

    this.failedData = [];
    let headers = [];
    const lines = [];
    for (const key in this.updateColumn) {
      if (this.updateColumn[key]) {
        headers.push(this.updateColumn[key]);
      }
    }
    // headers.push('id');
    const uploadContacts = this.contactsToUpload;

    if (uploadContacts.length < 0) {
      return;
    }

    this.step = 5;

    for (const contact of uploadContacts) {
      if (this.selectedImportContacts.isSelected(contact.id)) {
        const record = [];
        for (let i = 0; i < headers.length; i++) {
          const key = headers[i];
          if (key === 'primary_phone') {
            const cell_phone = phone(contact['primary_phone'])[0];
            record.push(cell_phone || '');
          } else if (key === 'secondary_phone') {
            const secondary_phone = phone(contact['secondary_phone'])[0];
            record.push(secondary_phone || '');
          } else if (key === 'primary_email') {
            const email = contact['primary_email'];
            record.push(email || '');
          } else if (key === 'notes') {
            if (contact['notes'] && contact['notes'].length) {
              record.push(JSON.stringify(contact['notes']));
            } else {
              record.push([]);
            }
          } else {
            record.push(contact[key] || '');
          }
        }
        lines.push(record);
      }
    }
    headers = [];
    for (const key in this.updateColumn) {
      if (this.updateColumn[key]) {
        if (this.updateColumn[key] === 'primary_email') {
          headers.push('email');
        } else if (this.updateColumn[key] === 'primary_phone') {
          headers.push('cell_phone');
        } else {
          headers.push(this.updateColumn[key]);
        }
      }
    }

    this.uploadLines = lines;
    this.uploadHeaders = headers;
    this.overallContacts = lines.length;
    this.isCompleteUpload = false;
    if (this.uploadLines.length) {
      let uploads;
      if (this.uploadLines.length >= this.UPLOAD_ONCE) {
        this.uploadedCount += this.UPLOAD_ONCE;
        this.lastUploadCount = this.UPLOAD_ONCE;
        uploads = this.uploadLines.slice(0, this.UPLOAD_ONCE);
        this.uploadLines.splice(0, this.UPLOAD_ONCE);
      } else {
        this.uploadedCount += this.uploadLines.length;
        this.lastUploadCount = this.uploadLines.length;
        uploads = this.uploadLines.slice(0, this.uploadLines.length);
        this.uploadLines.splice(0, this.uploadLines.length);
      }
      this.uploadSubTitle = '0 / ' + this.overallContacts + ' contacts';
      this.uploadRecursive(uploads);
    }
  }

  uploadRecursive(lines): void {
    const uploadContacts = lines;
    uploadContacts.unshift(this.uploadHeaders);
    this.dataText = this.papa.unparse(lines);
    this.uploadCSV();
  }

  uploadCSV(): void {
    let file;
    try {
      file = new File([this.dataText], 'upload.csv');
    } catch {
      const blob = new Blob([this.dataText]);
      Object.assign(blob, {});
      file = blob as File;
    }
    this.uploader.addToQueue([file]);
    this.uploader.queue[0].withCredentials = false;
    this.uploader.uploadAll();
    this.uploading = true;
  }

  close(): void {
    if (!this.firstImport) {
      this.handlerService.bulkContactAdd$();
      this.dialogRef.close({created: true});
    } else {
      this.dialogRef.close();
    }
  }

  selectAllContacts(): void {
    if (this.isSelectedContacts()) {
      this.contactsToUpload.forEach((e) => {
        this.selectedImportContacts.deselect(e.id);
      });
    } else {
      this.contactsToUpload.forEach((e) => {
        this.selectedImportContacts.select(e.id);
      });
    }
  }

  selectAllForce(): void {
    this.contactsToUpload.forEach((e) => {
      if (!this.selectedImportContacts.isSelected(e.id)) {
        this.selectedImportContacts.select(e.id);
      }
    });
  }

  isSelectedContacts(): any {
    if (this.contactsToUpload.length) {
      for (let i = 0; i < this.contactsToUpload.length; i++) {
        const e = this.contactsToUpload[i];
        if (!this.selectedImportContacts.isSelected(e.id)) {
          return false;
        }
      }
    } else {
      return false;
    }
    return true;
  }

  selectedImportContactsCount(): any {
    let result = 0;
    for (let i = 0; i < this.contactsToUpload.length; i++) {
      const e = this.contactsToUpload[i];
      if (this.selectedImportContacts.isSelected(e.id)) {
        result++;
      }
    }
    return result;
  }

  editInvalidContact(id): void {
    let editContact;
    const invalidContacts = this.getInvalidContacts();
    invalidContacts.forEach((contact) => {
      if (contact.id === id) {
        editContact = contact;
      }
    });

    if (editContact) {
      this.dialog
        .open(ImportContactEditComponent, {
          data: {
            ...editContact
          }
        })
        .afterClosed()
        .subscribe((res) => {
          if (res) {
            const updated = res.contact;
            if (updated) {
              const contactIndex = this.invalidContacts.findIndex(
                (contact) => contact.id === id
              );
              if (contactIndex >= 0) {
                this.invalidContacts.splice(contactIndex, 1, updated);
              }

              const emailIndex = this.invalidEmailContacts.findIndex(
                (contact) => contact.id === id
              );
              if (emailIndex >= 0) {
                this.invalidEmailContacts.splice(emailIndex, 1, updated);
              }

              const phoneIndex = this.invalidPhoneContacts.findIndex(
                (contact) => contact.id === id
              );
              if (phoneIndex >= 0) {
                this.invalidPhoneContacts.splice(phoneIndex, 1, updated);
              }
            }
          }
        });
    }
  }

  backVaildation(): void {
    this.invalidContacts = [];
    this.invalidEmailContacts = [];
    this.invalidPhoneContacts = [];
    this.step = 2;
    this.updateColumn = { ...this.initPropertyColumn };
    this.columns = [...this.initColumns];
  }

  reviewValidation(): void {
    let isInvalidExist = false;
    for (const contact of this.getInvalidContacts()) {
      if (this.isInvalidContact(contact)) {
        isInvalidExist = true;
        break;
      }
    }
    if (isInvalidExist) {
      const id = 'invalid-' + this.getInvalidContacts()[0].id;
      const el = document.getElementById(id);
      el.scrollIntoView();
    } else {
      this.rebuildColumns();
      this.rebuildContacts();
      this.contacts = [...this.contacts, ...this.getInvalidContacts()];
      this.duplicateLoading = true;
      const _SELF = this;
      setTimeout(function () {
        _SELF
          .checkDuplicate()
          .then((res) => {
            _SELF.duplicateLoading = false;
            _SELF.isDuplicatedEmail();
            if (res) {
              _SELF.step = 3;
            } else {
              _SELF.step = 4;
              _SELF.contactsToUpload = _SELF.contacts;
              _SELF.selectAllContacts();
            }
          })
          .finally(() => {
            this.duplicateLoading = false;
          });
      }, 200);
    }
  }

  editContact(id): void {
    let editContact;
    this.contacts.forEach((contact) => {
      if (contact.id === id) {
        editContact = contact;
      }
    });
    if (editContact) {
      if (this.isContact(editContact)) {
        editContact['email'] = editContact['primary_email'];
        editContact['cell_phone'] = editContact['primary_phone'];
        const label = editContact['label'];
        const labelId = editContact['label_id'];
        editContact['label'] = editContact['label_id'];
        this.dialog
          .open(ContactEditComponent, {
            width: '98vw',
            maxWidth: '600px',
            disableClose: true,
            data: {
              contact: editContact,
              type: 'main'
            }
          })
          .afterClosed()
          .subscribe((res) => {
            if (res) {
              const updated = res;
              updated['primary_contact'] = updated['email'];
              updated['primary_phone'] = updated['cell_phone'];
              updated['label_id'] = updated['label'];
              updated['label'] = label;
              const contactIndex = this.contacts.findIndex(
                (contact) => contact.id === id
              );
              if (contactIndex >= 0) {
                this.contacts.splice(contactIndex, 1, updated);
              }

              this.sameContacts.some((e, index) => {
                e.some((item, idx) => {
                  if (item.id === id) {
                    e.splice(idx, 1, updated);
                  }
                });
              });
              const nIndex = this.contactsToUpload.findIndex(
                (item) => item.id === id
              );
              if (nIndex >= 0) {
                this.contactsToUpload.splice(nIndex, 1, updated);
              }
            } else {
              editContact['primary_contact'] = editContact['email'];
              editContact['primary_phone'] = editContact['cell_phone'];
              editContact['label_id'] = labelId;
              editContact['label'] = label;
            }
          });
      } else {
        this.dialog
          .open(ImportContactEditComponent, {
            data: {
              ...editContact
            }
          })
          .afterClosed()
          .subscribe((res) => {
            if (res) {
              const updated = res.contact;
              if (updated) {
                const contactIndex = this.contacts.findIndex(
                  (contact) => contact.id === id
                );
                if (contactIndex >= 0) {
                  this.contacts.splice(contactIndex, 1, updated);
                }

                this.sameContacts.some((e, index) => {
                  e.some((item, idx) => {
                    if (item.id === id) {
                      e.splice(idx, 1, updated);
                    }
                  });
                });
                const nIndex = this.contactsToUpload.findIndex(
                  (item) => item.id === id
                );
                if (nIndex >= 0) {
                  this.contactsToUpload.splice(nIndex, 1, updated);
                }
              }
            }
          });
      }
    }
  }

  removeContact(id, dupIndex): void {
    const dialog = this.dialog.open(ConfirmComponent, {
      data: {
        title: 'Delete contact',
        message: 'Are you sure you want to delete this contact?',
        confirmLabel: 'Delete'
      }
    });

    dialog.afterClosed().subscribe((res) => {
      if (res) {
        const contactIndex = this.contacts.findIndex(
          (contact) => contact.id === id
        );
        if (contactIndex >= 0) {
          const deleteContact = this.contacts[contactIndex];
          if (this.isContact(deleteContact)) {
            this.contactService
              .bulkDelete([deleteContact._id])
              .subscribe((status) => {
                if (status) {
                  this.contacts.splice(contactIndex, 1);
                  this.sameContacts.some((e, index) => {
                    e.some((contact, idx) => {
                      if (contact.id === id) {
                        e.splice(idx, 1);
                      }
                    });
                  });
                  const nIndex = this.contactsToUpload.findIndex(
                    (item) => item.id === id
                  );
                  if (nIndex >= 0) {
                    this.contactsToUpload.splice(nIndex, 1);
                  }
                  if (this.sameContacts[dupIndex].length) {
                    let isDuplicatedKey = false;
                    for (
                      let i = 0;
                      i < this.sameContacts[dupIndex].length;
                      i++
                    ) {
                      for (
                        let j = i;
                        j < this.sameContacts[dupIndex].length;
                        j++
                      ) {
                        if (i === j) {
                          continue;
                        } else {
                          if (
                            this.sameContacts[dupIndex][i].primary_email ===
                            this.sameContacts[dupIndex][j].primary_email
                          ) {
                            isDuplicatedKey = true;
                            break;
                          }
                        }
                      }
                    }
                    if (!isDuplicatedKey) {
                      if (this.duplicateItems.length) {
                        this.duplicateItems[dupIndex] = false;
                      }
                    }
                  }

                  if (this.selectedMergeContacts[dupIndex].isSelected(id)) {
                    this.selectedMergeContacts[dupIndex].deselect(id);
                  }
                }
              });
          } else {
            this.contacts.splice(contactIndex, 1);
            this.sameContacts.some((e, index) => {
              e.some((contact, idx) => {
                if (contact.id === id) {
                  e.splice(idx, 1);
                }
              });
            });
            const nIndex = this.contactsToUpload.findIndex(
              (item) => item.id === id
            );
            if (nIndex >= 0) {
              this.contactsToUpload.splice(nIndex, 1);
            }
            if (this.sameContacts[dupIndex].length) {
              let isDuplicatedKey = false;
              for (let i = 0; i < this.sameContacts[dupIndex].length; i++) {
                for (let j = i; j < this.sameContacts[dupIndex].length; j++) {
                  if (i === j) {
                    continue;
                  } else {
                    if (
                      this.sameContacts[dupIndex][i].primary_email ===
                      this.sameContacts[dupIndex][j].primary_email
                    ) {
                      isDuplicatedKey = true;
                      break;
                    }
                  }
                }
              }
              if (!isDuplicatedKey) {
                if (this.duplicateItems.length) {
                  this.duplicateItems[dupIndex] = false;
                }
              }
            }

            if (this.selectedMergeContacts[dupIndex].isSelected(id)) {
              this.selectedMergeContacts[dupIndex].deselect(id);
            }
          }
        }
      }
    });
  }

  isSelectedMerge(dupIndex, id): any {
    if (this.selectedMergeContacts[dupIndex].isSelected(id)) {
      return true;
    }
    return false;
  }

  isDisable(dupIndex, id): any {
    if (this.selectedMergeContacts[dupIndex].selected.length > 1) {
      if (this.selectedMergeContacts[dupIndex].isSelected(id)) {
        return false;
      }
      return true;
    }
    return false;
  }

  back(): void {
    if (this.step === 3) {
      this.updateColumn = { ...this.initPropertyColumn };
      this.columns = [...this.initColumns];
      this.step--;
    } else if (this.step === 4) {
      if (this.sameContacts.length > 0) {
        this.step--;
      } else {
        this.step -= 2;
      }
    } else {
      this.isDuplicatedExist = false;
      this.step--;
    }
  }

  selectContact($event, dupIndex, contact): void {
    if ($event) {
      if (this.overContactCount(dupIndex, contact)) {
        this.selectedMergeContacts[dupIndex].toggle(contact.id);
      } else {
        $event.preventDefault();
      }
    }
  }

  overContactCount(dupIndex, contact): any {
    let selectedContactCount = 0;
    let selectedCSVCount = 0;
    for (const id of this.selectedMergeContacts[dupIndex].selected) {
      const index = this.sameContacts[dupIndex].findIndex(
        (item) => item._id && contact._id === id
      );
      if (index >= 0) {
        selectedContactCount++;
      } else {
        selectedCSVCount++;
      }
    }
    if (selectedContactCount === 1 && this.isContact(contact)) {
      if (selectedCSVCount > 0) {
        this.dialog.open(NotifyComponent, {
          maxWidth: '360px',
          width: '96vw',
          data: {
            message: 'Can not merge more than 2 contacts and CSV'
          }
        });
        return false;
      } else {
        return true;
      }
    } else if (selectedContactCount === 2 && this.isContact(contact)) {
      if (this.selectedMergeContacts[dupIndex].isSelected(contact._id)) {
        return true;
      } else {
        this.dialog.open(NotifyComponent, {
          maxWidth: '360px',
          width: '96vw',
          data: {
            message: 'Can not merge more than 2 contacts'
          }
        });
        return false;
      }
    } else if (selectedContactCount === 2 && !this.isContact(contact)) {
      this.dialog.open(NotifyComponent, {
        maxWidth: '360px',
        width: '96vw',
        data: {
          message: 'Can not merge more than 2 contacts'
        }
      });
      return false;
    }
    return true;
  }

  selectAllContactGroup($event, dupIndex, contacts): void {
    let contactCount = 0;
    let csvCount = 0;
    for (const contact of contacts) {
      if (this.isContact(contact)) {
        contactCount++;
      } else {
        csvCount++;
      }
    }
    if (contactCount > 2 || (contactCount === 2 && csvCount > 0)) {
      this.dialog.open(NotifyComponent, {
        maxWidth: '360px',
        width: '96vw',
        data: {
          message: 'Can not merge more than 2 contacts'
        }
      });
      $event.preventDefault();
      return;
    } else {
      if (this.isSelectedGroup(dupIndex, contacts)) {
        for (const contact of contacts) {
          if (this.selectedMergeContacts[dupIndex].isSelected(contact.id)) {
            this.selectedMergeContacts[dupIndex].deselect(contact.id);
          }
        }
      } else {
        for (const contact of contacts) {
          if (!this.selectedMergeContacts[dupIndex].isSelected(contact.id)) {
            this.selectedMergeContacts[dupIndex].select(contact.id);
          }
        }
      }
    }
  }

  isSelectedGroup(index, contacts): any {
    if (this.selectedMergeContacts && this.selectedMergeContacts[index]) {
      for (const contact of contacts) {
        if (!this.selectedMergeContacts[index].isSelected(contact.id)) {
          return false;
        }
      }
      return true;
    }
    return false;
  }

  selectProperty(column, value): void {
    for (const key in this.updateColumn) {
      if (this.updateColumn[key] === value && value !== 'notes') {
        const index = this.fields.findIndex((item) => item.value === value);
        this.fields.splice(index, 1);
      }
    }
  }

  getFieldLabel(value): any {
    const index = this.fields.findIndex((item) => item.value === value);
    return this.fields[index].label;
  }

  getColumnFields(): any {
    const fields = [...this.fields];
    for (const key in this.updateColumn) {
      if (this.updateColumn[key] && this.updateColumn[key] !== 'notes') {
        const index = fields.findIndex(
          (item) => item.value === this.updateColumn[key]
        );
        fields.splice(index, 1);
      }
    }
    return fields;
  }

  getDuplicateContactCount(): any {
    let count = 0;
    for (const contacts of this.sameContacts) {
      if (contacts && contacts.length > 1) {
        count++;
      }
    }
    return count;
  }

  bulkRemove(dupIndex): void {
    const selectedContacts = this.selectedMergeContacts[dupIndex].selected;
    const dialog = this.dialog.open(ConfirmComponent, {
      data: {
        title: 'Delete contacts',
        message: 'Are you sure you want to delete selected contacts?',
        confirmLabel: 'Delete'
      }
    });
    dialog.afterClosed().subscribe((res) => {
      if (res) {
        const contacts = [];
        for (const id of selectedContacts) {
          const contactIndex = this.contacts.findIndex(
            (contact) => contact.id === id
          );
          if (contactIndex >= 0) {
            if (this.isContact(this.contacts[contactIndex])) {
              contacts.push(this.contacts[contactIndex].id);
            } else {
              this.contacts.splice(contactIndex, 1);
              this.sameContacts.some((e, index) => {
                e.some((contact, idx) => {
                  if (contact.id === id) {
                    e.splice(idx, 1);
                  }
                });
              });
              const nIndex = this.contactsToUpload.findIndex(
                (item) => item.id === id
              );
              if (nIndex >= 0) {
                this.contactsToUpload.splice(nIndex, 1);
              }
              if (this.sameContacts[dupIndex].length) {
                let isDuplicatedKey = false;
                for (let i = 0; i < this.sameContacts[dupIndex].length; i++) {
                  for (let j = i; j < this.sameContacts[dupIndex].length; j++) {
                    if (i === j) {
                      continue;
                    } else {
                      if (
                        this.sameContacts[dupIndex][i].primary_email ===
                        this.sameContacts[dupIndex][j].primary_email
                      ) {
                        isDuplicatedKey = true;
                        break;
                      }
                    }
                  }
                }
                if (!isDuplicatedKey) {
                  if (this.duplicateItems.length) {
                    this.duplicateItems[dupIndex] = false;
                  }
                }
              }

              if (this.selectedMergeContacts[dupIndex].isSelected(id)) {
                this.selectedMergeContacts[dupIndex].deselect(id);
              }
            }
          }
        }
        if (contacts.length > 0) {
          this.bulkDeleting[dupIndex] = true;
          this.contactService.bulkDelete(contacts).subscribe((status) => {
            this.bulkDeleting[dupIndex] = false;
            if (status) {
              for (const id of contacts) {
                const contactIndex = this.contacts.findIndex(
                  (contact) => contact.id === id
                );
                if (contactIndex >= 0) {
                  this.contacts.splice(contactIndex, 1);
                  this.sameContacts.some((e, index) => {
                    e.some((contact, idx) => {
                      if (contact.id === id) {
                        e.splice(idx, 1);
                      }
                    });
                  });
                  const nIndex = this.contactsToUpload.findIndex(
                    (item) => item.id === id
                  );
                  if (nIndex >= 0) {
                    this.contactsToUpload.splice(nIndex, 1);
                  }
                  if (this.sameContacts[dupIndex].length) {
                    let isDuplicatedKey = false;
                    for (
                      let i = 0;
                      i < this.sameContacts[dupIndex].length;
                      i++
                    ) {
                      for (
                        let j = i;
                        j < this.sameContacts[dupIndex].length;
                        j++
                      ) {
                        if (i === j) {
                          continue;
                        } else {
                          if (
                            this.sameContacts[dupIndex][i].primary_email ===
                            this.sameContacts[dupIndex][j].primary_email
                          ) {
                            isDuplicatedKey = true;
                            break;
                          }
                        }
                      }
                    }
                    if (!isDuplicatedKey) {
                      if (this.duplicateItems.length) {
                        this.duplicateItems[dupIndex] = false;
                      }
                    }
                  }

                  if (this.selectedMergeContacts[dupIndex].isSelected(id)) {
                    this.selectedMergeContacts[dupIndex].deselect(id);
                  }
                }
              }
            }
          });
        }
      }
    });
  }

  exceed(): void {
    this.step = 5;
    this.confirmDuplicates();
  }

  downloadExceed(): void {
    const headers = [];
    for (const key in this.updateColumn) {
      if (this.updateColumn[key]) {
        headers.push(this.updateColumn[key]);
      }
    }
    const downloadContacts = [];
    for (const contact of this.exceedContacts) {
      const duplicate = Object.assign({}, contact);
      if (Array.isArray(duplicate['notes'])) {
        duplicate['notes'] = duplicate['notes'].join('     ');
      }
      if (Array.isArray(duplicate['tags'])) {
        duplicate['tags'] = duplicate['tags'].join(',');
      }
      downloadContacts.push(duplicate);
    }
    if (downloadContacts.length) {
      const replacer = (key, value) => (value === null ? '' : value); // specify how you want to handle null values here
      const csv = downloadContacts.map((row) =>
        headers
          .map((fieldName) => JSON.stringify(row[fieldName], replacer))
          .join(',')
      );
      csv.unshift(headers.join(','));
      const csvArray = csv.join('\r\n');

      const blob = new Blob([csvArray], { type: 'text/csv' });
      saveAs(blob, 'exceed.csv');
    }
  }

  downloadReview(): void {
    const headers = [];
    for (const key in this.updateColumn) {
      if (this.updateColumn[key]) {
        headers.push(this.updateColumn[key]);
      }
    }
    const downloadContacts = [];
    for (const contact of this.contactsToUpload) {
      const duplicate = Object.assign({}, contact);
      if (Array.isArray(duplicate['notes'])) {
        duplicate['notes'] = duplicate['notes'].join('     ');
      }
      if (Array.isArray(duplicate['tags'])) {
        duplicate['tags'] = duplicate['tags'].join(', ');
      }
      downloadContacts.push(duplicate);
    }
    if (downloadContacts.length) {
      const replacer = (key, value) => (value === null ? '' : value); // specify how you want to handle null values here
      const csv = downloadContacts.map((row) =>
        headers
          .map((fieldName) => JSON.stringify(row[fieldName], replacer))
          .join(',')
      );
      csv.unshift(headers.join(','));
      const csvArray = csv.join('\r\n');

      const blob = new Blob([csvArray], { type: 'text/csv' });
      saveAs(blob, 'review.csv');
    }
  }

  getInvalidContacts(): any {
    let invalidContacts = [];
    invalidContacts = [
      ...this.invalidContacts,
      ...this.invalidEmailContacts,
      ...this.invalidPhoneContacts
    ];
    return invalidContacts;
  }

  isValidPhone(val): any {
    if (val === '') {
      return true;
    } else {
      if (PhoneNumber(val).isValid() || this.matchUSPhoneNumber(val)) {
        return true;
      }
    }
    return false;
  }

  matchUSPhoneNumber(phoneNumberString): any {
    const cleaned = ('' + phoneNumberString).replace(/\D/g, '');
    const match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/);
    let phoneNumber;
    if (match) {
      phoneNumber = '(' + match[2] + ') ' + match[3] + '-' + match[4];
    }
    return phoneNumber;
  }

  isValidEmail(val): any {
    if (val !== '' && validateEmail(val)) {
      return true;
    }
    return false;
  }

  isInvalidContact(contact): any {
    for (const key in this.updateColumn) {
      if (contact[this.updateColumn[key]] !== '') {
        if (
          this.updateColumn[key] === 'primary_email' ||
          this.updateColumn[key] === 'secondary_email'
        ) {
          if (!this.isValidEmail(contact[this.updateColumn[key]])) {
            return true;
          }
        }
        if (
          this.updateColumn[key] === 'primary_phone' ||
          this.updateColumn[key] === 'secondary_phone'
        ) {
          if (!this.isValidPhone(contact[this.updateColumn[key]])) {
            return true;
          }
        }
      }
    }
    return false;
  }

  getInternationalPhone(phoneNumber): any {
    if (phoneNumber) {
      if (phoneNumber.indexOf('(') === 0) {
        phoneNumber = '+1 ' + phoneNumber;
      }
      const phoneObj = new PhoneNumber(phoneNumber);
      return phoneObj.getNumber('international');
    }
    return phoneNumber;
  }

  fields = [
    {
      value: 'first_name',
      label: 'First Name'
    },
    {
      value: 'last_name',
      label: 'Last Name'
    },
    {
      value: 'primary_email',
      label: 'Primary Email'
    },
    {
      value: 'primary_phone',
      label: 'Primary Phone'
    },
    {
      value: 'secondary_email',
      label: 'Secondary Email'
    },
    {
      value: 'secondary_phone',
      label: 'Secondary Phone'
    },
    {
      value: 'brokerage',
      label: 'Company'
    },
    {
      value: 'website',
      label: 'Website'
    },
    {
      value: 'address',
      label: 'Address'
    },
    {
      value: 'country',
      label: 'Country'
    },
    {
      value: 'state',
      label: 'State'
    },
    {
      value: 'city',
      label: 'City'
    },
    {
      value: 'zip',
      label: 'Zipcode'
    },
    {
      value: 'notes',
      label: 'Notes'
    },
    {
      value: 'tags',
      label: 'Tags'
    },
    {
      value: 'source',
      label: 'Source'
    },
    {
      value: 'label',
      label: 'Label'
    }
  ];
}
