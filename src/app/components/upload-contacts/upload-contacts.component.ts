import { Component, OnInit, ViewChild } from '@angular/core';
import { environment } from 'src/environments/environment';
import { FileUploader } from 'ng2-file-upload';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Papa } from 'ngx-papaparse';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import * as d3 from 'd3-collection';
import { SelectionModel } from '@angular/cdk/collections';
import { UserService } from '../../services/user.service';

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
  public uploadHeaders = [];
  public newHeaders = [];
  public lines = [];
  private dataText = '';
  private failedData = [];
  public failedRecords = [];

  columns = [];
  selectedColumn;
  selectedColumnIndex;

  updateColumn = {};

  step = 1;

  confirm1 = false;
  confirm2 = false;
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

  previewEmails = []; // Emails to merge contacts
  previewPhones = []; // Phones to merge contacts
  previewContacts = [];
  duplicateItems = [];
  selectedImportContacts = new SelectionModel<any>(true, []);
  overwriteContacts = new SelectionModel(true, []); // Contacts to overwrite
  overwriting = false;

  constructor(
    private dialogRef: MatDialogRef<UploadContactsComponent>,
    private userService: UserService,
    private dialog: MatDialog,
    private papa: Papa
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
      this.uploading = false;
      if (response.status) {
        this.failedData = response.failure;
        this.failedRecords = [];
        const emails = [];
        this.failedData.forEach((e) => {
          emails.push(e.email);
        });
        this.contactsToUpload.forEach((e) => {
          if (emails.indexOf(e.email) !== -1) {
            this.failedRecords.push({ ...e });
          }
        });
        if (!this.failedData.length) {
          this.dialogRef.close({ status: true });
        } else {
          this.step = 5;
        }
      } else {
        this.uploading = false;
        this.file.nativeElement.value = '';
      }
    };
    this.overwriter.onAfterAddingFile = (file) => {
      file.withCredentials = false;
      if (this.overwriter.queue.length > 1) {
        this.overwriter.queue.splice(0, 1);
      }
    };
    this.overwriter.onCompleteItem = (
      item: any,
      response: any,
      status: any,
      headers: any
    ) => {
      response = JSON.parse(response);
      this.overwriting = false;
      if (response.status) {
        this.dialogRef.close({ status: true });
      } else {
        this.overwriting = false;
        this.file.nativeElement.value = '';
        // Overwriting Error Display
      }
    };
  }

  openFileDialog(): void {
    this.file.nativeElement.click();
  }

  readFile(evt): any {
    const file = evt.target.files[0];
    if (!file) {
      return false;
    }
    console.log('csv file ===========>', file.name.toLowerCase());
    if (!file.name.toLowerCase().endsWith('.csv')) {
      this.isCSVFile = false;
      this.filePlaceholder =
        'File is not matched. \n Drag your csv files here or click in this area.';
      return false;
    }

    this.isCSVFile = true;
    this.filePlaceholder = 'File uploaded "' + file.name.toLowerCase() + '".';
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

  selectColumn(column): void {
    this.selectedColumn = column;
    this.selectedColumnIndex = this.columns.indexOf(column);
  }

  selectField(): void {
    if (this.isCSVFile) {
      this.step = 2;
    }
  }

  initImport(): void {
    this.isCSVFile = false;
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
            contact[newColumn] = e;
          }
        });
        this.contacts.push({ ...contact, id: this.contacts.length });
      });
      const dupTest = this.checkDuplicate();
      console.log(
        'duplicate email ================>',
        dupTest,
        this.sameEmails
      );
      if (dupTest) {
        this.step = 3;
      } else {
        this.step = 4;
        this.contactsToUpload = this.contacts;
      }
    } else {
      this.importError = true;
    }
  }

  checkDuplicate(): any {
    let emailKey = '';
    let phoneKey = '';
    let firstNameKey = '';
    let lastNameKey = '';
    for (const key in this.updateColumn) {
      if (this.updateColumn[key] === 'email') {
        emailKey = key;
      }
      if (this.updateColumn[key] === 'phone') {
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
              firstContact.first_name !== '' &&
              secondContact.first_name !== '' &&
              firstContact.first_name === secondContact.first_name &&
              firstContact.last_name === secondContact.last_name
            ) {
              merge.push(secondContact);
              continue;
            }
          } else {
            if (firstNameKey) {
              if (
                firstContact.first_name !== '' &&
                secondContact.first_name !== '' &&
                firstContact.first_name === secondContact.first_name
              ) {
                merge.push(secondContact);
                continue;
              }
            } else if (lastNameKey) {
              if (
                firstContact.last_name !== '' &&
                secondContact.last_name !== '' &&
                firstContact.last_name === secondContact.last_name
              ) {
                merge.push(secondContact);
                continue;
              }
            }
          }

          if (emailKey) {
            if (
              firstContact.email !== '' &&
              secondContact.email !== '' &&
              firstContact.email === secondContact.email
            ) {
              merge.push(secondContact);
              continue;
            }
          }

          if (phoneKey) {
            if (
              firstContact.phone !== '' &&
              secondContact.phone !== '' &&
              firstContact.phone === secondContact.phone
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

    mergeList.forEach((e) => {
      if (e.length > 1) {
        e.primaryId = e[0].id;
        e.secondaryId = [];
        e.forEach((val) => {
          e.secondaryId.push(val.id);
        });
        e.values = e;
        this.sameContacts.push(e);
      } else if (e.length === 1) {
        this.contactsToUpload.push(e[0]);
      }
    });

    if (this.sameContacts.length) {
      return true;
    } else {
      return false;
    }

    // if (emailKey) {
    //   const groupsByEmail = d3
    //     .nest()
    //     .key(function (d) {
    //       return d.email;
    //     })
    //     .entries(this.contacts);
    //
    //   groupsByEmail.forEach((e) => {
    //     if (e.values.length > 1 && e.key && e.key !== 'undefined') {
    //       e.secondaries = [];
    //       e.primary = e.values[0].id;
    //       this.sameEmails.push(e);
    //       e.values.forEach((val) => {
    //         e.secondaries.push(val.id);
    //       });
    //     } else if (e.values.length === 1) {
    //       this.contactsToUpload.push(e.values[0]);
    //     }
    //   });
    // }
    // if (phoneKey) {
    //   const groupsByPhone = d3
    //     .nest()
    //     .key(function (d) {
    //       return d.phone;
    //     })
    //     .entries(this.contacts);
    //   groupsByPhone.forEach((e) => {
    //     if (e.values.length > 1 && e.key && e.key !== 'undefined') {
    //       e.secondaries = [];
    //       e.primary = e.values[0].id;
    //       this.samePhones.push(e);
    //     }
    //   });
    // }
    // console.log('this.sameEmails', this.sameEmails, this.samePhones);
    // if (this.sameEmails.length) {
    //   return true;
    // } else {
    //   return false;
    // }
  }

  toggleSecContact(dupItem, contact): void {
    const pos = dupItem.secondaryId.indexOf(contact.id);
    if (pos !== -1) {
      dupItem.secondaryId.splice(pos, 1);
    } else {
      dupItem.secondaryId.push(contact.id);
    }
  }

  keepSeparated(dupItem): void {
    this.contactsToUpload = this.contactsToUpload.concat(dupItem.values);
    this.sameContacts.some((e, index) => {
      if (e.primaryId === dupItem.primaryId) {
        this.sameContacts.splice(index, 1);
        return true;
      }
    });
    if (!this.sameContacts.length) {
      this.goToReview();
    }
  }

  mergePreview(dupItem): void {
    let result = {};
    let primary = {};
    const unmerged = [];
    dupItem.values.forEach((e) => {
      if (e.id === dupItem.primaryId) {
        primary = { ...e };
        return;
      }
      if (dupItem.secondaryId.indexOf(e.id) !== -1) {
        const el = { ...e };
        result = { ...result, ...el };
        return;
      }
      unmerged.push(e);
    });
    result = { ...result, ...primary };
    dupItem.previews = [result, ...unmerged];
    this.previewContacts.push(dupItem.primaryId);
  }

  cancelPreview(dupItem): void {
    dupItem.previews = [];
    const pos = this.previewContacts.indexOf(dupItem.primaryId);
    if (pos !== -1) {
      this.previewContacts.splice(pos, 1);
    }
  }

  mergeConfirm(dupItem): void {
    dupItem.values = [...dupItem.previews];
    dupItem.previews = [];
    dupItem.secondaryId = [];
    dupItem.values.forEach((e) => {
      dupItem.secondaryId.push(e.id);
    });
    const pos = this.previewContacts.indexOf(dupItem.primaryId);
    if (pos !== -1) {
      this.previewContacts.splice(pos, 1);
    }
  }

  goToReview(): void {
    let isDuplicateKey = false;
    this.duplicateItems = [];
    this.sameContacts.forEach((dupItem) => {
      let emailKey = '';
      for (const key in this.updateColumn) {
        if (this.updateColumn[key] === 'email') {
          emailKey = key;
        }
      }
      if (emailKey) {
        for (let i = 0; i < dupItem.values.length; i++) {
          for (let j = i; j < dupItem.values.length; j++) {
            if (i === j) {
              continue;
            }
            if (dupItem.values[i][emailKey] === dupItem.values[j][emailKey]) {
              isDuplicateKey = true;
              this.duplicateItems.push(dupItem.primaryId);
              return;
            }
          }
        }
      }
      if (!isDuplicateKey) {
        this.contactsToUpload = this.contactsToUpload.concat(dupItem.values);
      }
    });

    if (!isDuplicateKey && !this.duplicateItems.length) {
      this.step = 4;
    }
  }

  goToMatch(): void {
    this.step = 2;
  }

  upload(): void {
    // this.dialogRef.close({ data: this.contactsToUpload });
    const headers = [];
    const lines = [];
    for (const key in this.updateColumn) {
      if (this.updateColumn[key]) {
        headers.push(this.updateColumn[key]);
      }
    }
    this.contactsToUpload.forEach((contact) => {
      const record = [];
      for (let i = 0; i < headers.length; i++) {
        const key = headers[i];
        if (key === 'phone') {
          let cell_phone = contact['phone'];
          if (cell_phone) {
            if (cell_phone[0] === '+') {
              cell_phone = cell_phone.replace(/\D/g, '');
              cell_phone = '+' + cell_phone;
            } else {
              cell_phone = cell_phone.replace(/\D/g, '');
              cell_phone = '+1' + cell_phone;
            }
          }
          record.push(cell_phone || '');
        } else {
          record.push(contact[key] || '');
        }
      }
      lines.push(record);
    });
    lines.unshift(headers);
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

  toggleAllFailedRecords(): void {
    if (this.failedRecords.length !== this.overwriteContacts.selected.length) {
      this.failedRecords.forEach((e) => {
        if (!this.overwriteContacts.isSelected(e)) {
          this.overwriteContacts.select(e);
        }
      });
    } else {
      this.overwriteContacts.clear();
    }
  }

  toggleFailedRecord(contact): void {
    this.overwriteContacts.toggle(contact);
  }

  overwrite(): void {
    const headers = [];
    const lines = [];
    for (const key in this.updateColumn) {
      if (this.updateColumn[key]) {
        headers.push(this.updateColumn[key]);
      }
    }
    this.overwriteContacts.selected.forEach((contact) => {
      const record = [];
      for (let i = 0; i < headers.length; i++) {
        const key = headers[i];
        if (key === 'phone') {
          let cell_phone = contact['phone'];
          if (cell_phone) {
            if (cell_phone[0] === '+') {
              cell_phone = cell_phone.replace(/\D/g, '');
              cell_phone = '+' + cell_phone;
            } else {
              cell_phone = cell_phone.replace(/\D/g, '');
              cell_phone = '+1' + cell_phone;
            }
          }
          record.push(cell_phone || '');
        } else {
          record.push(contact[key] || '');
        }
      }
      lines.push(record);
    });
    lines.unshift(headers);
    const dataText = this.papa.unparse(lines);
    let file;
    try {
      file = new File([dataText], 'upload.csv');
    } catch {
      const blob = new Blob([dataText]);
      Object.assign(blob, {});
      file = blob as File;
    }
    this.overwriter.addToQueue([file]);
    this.overwriter.queue[0].withCredentials = false;
    this.overwriter.uploadAll();
    this.overwriting = true;
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
      value: 'email',
      label: 'Email'
    },
    {
      value: 'phone',
      label: 'Phone'
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
      value: 'note',
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
