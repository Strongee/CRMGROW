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

const phone = require('phone');

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

  constructor(
    private dialogRef: MatDialogRef<UploadContactsComponent>,
    private userService: UserService,
    private dialog: MatDialog,
    private papa: Papa,
    private contactService: ContactService,
    private handlerService: HandlerService,
    private scrollElement: ElementRef
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
        this.uploadedContacts = response.failure;
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
          this.confirmDuplicates();
        }
      } else {
        this.uploading = false;
        this.isUploading = false;
        this.isUploadCancel = true;
        this.file.nativeElement.value = '';
      }
    };
  }

  readFile(evt): any {
    const file = evt.target.files[0];
    if (!file) {
      return false;
    }
    if (!file.name.toLowerCase().endsWith('.csv')) {
      this.isCSVFile = false;
      this.filePlaceholder =
        'File is not matched. \n Drag your csv files here or click in this area.';
      return false;
    }

    this.isCSVFile = true;
    this.filePlaceholder = 'File uploaded "' + file.name.toLowerCase() + '".';
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
    let importField = false;
    this.columns.some((e) => {
      if (this.updateColumn[e]) {
        importField = true;
        return true;
      }
    });
    if (importField) {
      this.lines.map((record) => {
        const contact = {};
        record.map((e, index) => {
          const originColumn = this.columns[index];
          const newColumn = this.updateColumn[originColumn];
          if (newColumn) {
            if (newColumn === 'notes') {
              if (!!e) {
                if (Array.isArray(contact[newColumn])) {
                  contact[newColumn].push(e);
                } else {
                  contact[newColumn] = [e];
                }
              }
            } else {
              contact[newColumn] = e;
            }
          }
        });
        this.contacts.push({ ...contact, id: this.contacts.length });
      });
      const dupTest = this.checkDuplicate();
      console.log(dupTest, this.sameEmails);
      this.rebuildColumns();
      this.rebuildContacts();
      if (dupTest) {
        this.step = 3;
      } else {
        this.step = 4;
        this.contactsToUpload = this.contacts;
        this.selectAllContacts();
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
                  tags.push(tagArray[j]);
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
    const key = 'primary_email';
    for (let i = 0; i < this.contacts.length; i++) {
      for (let j = i; j < this.contacts.length; j++) {
        if (j === i) {
          continue;
        } else {
          if (
            this.contacts[i][key] &&
            this.contacts[j][key] &&
            this.contacts[i][key] === this.contacts[j][key]
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }

  checkDuplicate(): any {
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
              firstContact.first_name === secondContact.first_name &&
              firstContact.last_name === secondContact.last_name
            ) {
              merge.push(secondContact);
              continue;
            }
          }

          if (emailKey) {
            if (
              !!firstContact.primary_email &&
              !!secondContact.primary_email &&
              firstContact.primary_email === secondContact.primary_email
            ) {
              merge.push(secondContact);
              continue;
            }
          }

          if (phoneKey) {
            if (
              !!firstContact.primary_phone &&
              !!secondContact.primary_phone &&
              firstContact.primary_phone === secondContact.primary_phone
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

    mergeList.forEach((e, index) => {
      if (e.length > 1) {
        this.sameContacts.push(e);
        this.selectedMergeContacts.push(new SelectionModel<any>(true, []));
      } else if (e.length === 1) {
        this.contactsToUpload.push(e[0]);
      }
    });

    if (this.sameContacts.length) {
      return true;
    } else {
      return false;
    }
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
        if (
          !!contactItem[key] &&
          !!contact[key] &&
          contactItem[key] === contact[key] &&
          contactItem.id !== contact.id
        ) {
          if (key === 'first_name' || key === 'last_name') {
            if (
              contactItem['first_name'] + contactItem['last_name'] ===
              contact['first_name'] + contact['last_name']
            ) {
              return true;
            }
          } else {
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
          updateColumn: this.updateColumn
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
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
              this.sameContacts[dupIndex][i][emailKey] ===
              this.sameContacts[dupIndex][j][emailKey]
            ) {
              isEmailDuplicate = true;
            }
            if (
              this.sameContacts[dupIndex][i][phoneKey] ===
              this.sameContacts[dupIndex][j][phoneKey]
            ) {
              isPhoneDuplicate = true;
            }
            if (
              this.sameContacts[dupIndex][i][firstNameKey] ===
              this.sameContacts[dupIndex][j][firstNameKey]
            ) {
              isFirstNameDuplicate = true;
            }
            if (
              this.sameContacts[dupIndex][i][lastNameKey] ===
              this.sameContacts[dupIndex][j][lastNameKey]
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
      for (const key in this.updateColumn) {
        if (this.updateColumn[key] === 'primary_email') {
          emailKey = key;
        }
      }
      if (emailKey) {
        this.duplicateItems.push(false);
        for (let i = 0; i < dupItem.length; i++) {
          for (let j = i; j < dupItem.length; j++) {
            if (i === j) {
              continue;
            }
            if (
              dupItem[i]['primary_email'] !== '' &&
              dupItem[j]['primary_email'] !== '' &&
              dupItem[i]['primary_email'] !== null &&
              dupItem[j]['primary_email'] !== null &&
              dupItem[i]['primary_email'] === dupItem[j]['primary_email']
            ) {
              isDuplicateKey = true;
              this.duplicateItems[index] = true;
              return;
            }
          }
        }
      }
      if (!isDuplicateKey) {
        this.contactsToUpload = this.contactsToUpload.concat(dupItem);
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

    if (isDuplicateKey) {
      if (this.duplicateItems && this.duplicateItems.length > 0) {
        let id = 'contact-group-';
        for (let i = 0; i < this.duplicateItems.length; i++) {
          if (this.duplicateItems[i] === true) {
            id = id + i.toString();
            const el = document.getElementById(id);
            el.scrollIntoView();
            return;
          }
        }
      }
    } else {
      for (let i = 0; i < this.duplicateItems.length; i++) {
        if (this.duplicateItems[i] === true) {
          return;
        }
      }
      if (this.firstImport) {
        this.firstImport = false;
        this.step = 4;
        this.selectAllContacts();
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
                this.dialogRef.close({});
                this.handlerService.bulkContactAdd$();
              }
            },
            (error) => {
              this.uploading = false;
              this.dialogRef.close({});
            }
          );
        } else {
          this.dialogRef.close({});
          this.handlerService.bulkContactAdd$();
        }
      }
    }
  }

  confirmDuplicates(): void {
    this.firstImport = false;
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
        if (contact.data._id) {
          contact.data.id = contact.data._id;
          contact.data.primary_email = contact.data.email;
          delete contact.data.email;
          contact.data.primary_phone = contact.data.cell_phone;
          delete contact.data.cell_phone;
        } else {
          contact.data.id = index;
          contact.data.primary_email = contact.data.email;
          delete contact.data.email;
          contact.data.primary_phone = contact.data.cell_phone;
          delete contact.data.cell_phone;
          const tags = contact.data.tags;
          if (tags) {
            if (Array.isArray(tags)) {
              contact.data.tags = tags;
            } else {
              contact.data.tags = [tags];
            }
          }
        }

        if (
          contact.data.label !== undefined &&
          contact.data.label._id !== undefined
        ) {
          const labelName = contact.data.label.name;
          const labelId = contact.data.label._id;
          delete contact.data.label;
          contact.data['label'] = labelName;
          contact.data['label_id'] = labelId;
        }

        if (!contact.data._id && contact.data.notes) {
          // if (Array.isArray(contact.data.notes)) {
          contact.data.notes = JSON.parse(contact.data.notes);
          // } else {
          //   contact.data.notes = JSON.stringify(contact.data.notes);
          // }
        }
        const contactIndex = this.contacts.findIndex(
          (item) => item.id === contact.data.id
        );
        if (contactIndex < 0) {
          this.contacts.push(contact.data);
        }
      });

      this.uploadPercent = 100;
      this.uploadSubTitle =
        this.overallContacts + ' / ' + this.overallContacts + ' contacts';

      this.checkingDuplicate = true;
      const _SELF = this;
      setTimeout(() => {
        const dupTest = _SELF.checkDuplicate();
        if (dupTest) {
          _SELF.step = 3;
          _SELF.checkingDuplicate = false;
        } else {
          _SELF.step = 4;
          _SELF.checkingDuplicate = false;
          _SELF.contactsToUpload = _SELF.contacts;
        }
      }, 2000);
    } else {
      this.dialogRef.close({});
      this.handlerService.bulkContactAdd$();
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
        uploads = this.uploadLines.slice(0, this.UPLOAD_ONCE);
        this.uploadLines.splice(0, this.UPLOAD_ONCE);
      } else {
        this.uploadedCount += this.uploadLines.length;
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
    this.dialogRef.close();
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

  editContact(id): void {
    let editContact;
    this.contacts.forEach((contact) => {
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

  removeContact(id, dupIndex): void {
    const dialog = this.dialog.open(ConfirmComponent, {
      data: {
        title: 'Delete contact',
        message: 'Are you sure to delete the contact?',
        confirmLabel: 'Delete'
      }
    });

    dialog.afterClosed().subscribe((res) => {
      if (res) {
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
    if (this.step === 4) {
      if (this.sameContacts.length) {
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
        (contact) => contact._id && contact._id === id
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
      label: 'Current Brokerage'
    },
    {
      value: 'recruiting_stage',
      label: 'Recruiting Stage'
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
