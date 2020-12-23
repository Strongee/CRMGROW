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
import { ConfirmComponent } from '../confirm/confirm.component';
import { ImportContactEditComponent } from '../import-contact-edit/import-contact-edit.component';
import { ImportContactMergeComponent } from '../import-contact-merge/import-contact-merge.component';
import {
  DialogSettings,
  ImportSelectableColumn
} from '../../constants/variable.constants';
import { ContactService } from '../../services/contact.service';
import { HandlerService } from '../../services/handler.service';

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
  selectedMergeContacts = [];
  firstImport = true;
  notesColumns = [];
  uploadPercent = 0;
  uploadCompleted = false;
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

  constructor(
    private dialogRef: MatDialogRef<UploadContactsComponent>,
    private userService: UserService,
    private dialog: MatDialog,
    private papa: Papa,
    private contactService: ContactService,
    private handlerService: HandlerService
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
        this.isCompleteUpload = this.uploadedCount >= this.overallContacts ? true : false;
        this.uploadPercent = Math.round(this.uploadedCount / this.overallContacts * 100 ) ;
        this.uploadSubTitle = this.uploadedCount + ' / ' + this.overallContacts + ' contacts';
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
                this.updateColumn['primary_email'] = 'primary_email';
                delete this.updateColumn[key];
              } else if (this.updateColumn[key] === 'primary_phone') {
                for (let i = 0; i < this.columns.length; i++) {
                  if (this.columns[i] === key) {
                    this.columns[i] = 'primary_phone';
                  }
                }
                this.updateColumn['primary_phone'] = 'primary_phone';
                delete this.updateColumn[key];
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
                const tags = contact.data[tagsKey];
                if (tags) {
                  contact.data[tagsKey] = tags.split(',');
                }
              }

              if (contact.data.label !== undefined && contact.data.label._id !== undefined) {
                const labelName = contact.data.label.name;
                const labelId = contact.data.label._id;
                delete contact.data.label;
                contact.data['label'] = labelName;
                contact.data['label_id'] = labelId;
              }

              if (!contact.data._id && contact.data.notes) {
                const notes = JSON.parse(contact.data.notes);
                const parseNotes = [];

                for (const note of notes) {
                  let noteObj = {};
                  noteObj[note.title] = note.content;
                  parseNotes.push(noteObj);
                }

                // const tempNotes = [];
                // for (let i = 0; i < parseNotes.length; i++) {
                //   tempNotes.push(parseNotes);
                // }
                //
                // for (let i = 0; i < this.notesColumns.length; i++) {
                //   const columnIndex = tempNotes.findIndex((item) => item[this.notesColumns[i]]);
                //   if (columnIndex >= 0) {
                //     tempNotes.splice(columnIndex, 1);
                //   }
                // }
                // if (tempNotes.length) {
                //   contact.data['other'] = JSON.stringify(tempNotes);
                // }
                contact.data.notes = parseNotes;
              }
              this.contacts.push(contact.data);
            });

            this.uploadPercent = 100;
            this.uploadSubTitle = this.overallContacts + ' / ' + this.overallContacts + ' contacts';

            this.checkingDuplicate = true;
            const _SELF = this;
            setTimeout( () => {
              const dupTest = _SELF.checkDuplicate();
              if (dupTest) {
                _SELF.step = 3;
                _SELF.checkingDuplicate = false;
              } else {
                _SELF.step = 4;
                _SELF.checkingDuplicate = false;
                _SELF.contactsToUpload = _SELF.contacts;
              }
            }, 1000);
          } else {
            this.uploading = false;
            this.dialogRef.close({status: true});
            this.handlerService.bulkContactAdd$();
          }

          // this.failedRecords = [];
          // const emails = [];
          // this.failedData.forEach((e) => {
          //   emails.push(e.email);
          // });
          // this.contactsToUpload.forEach((e) => {
          //   if (emails.indexOf(e.email) !== -1) {
          //     this.failedRecords.push({ ...e });
          //   }
          // });
          // if (!this.failedData.length) {
          //   this.dialogRef.close({ status: true });
          // } else {
          //   this.step = 5;
          // }
        }
      } else {
        this.uploading = false;
        this.isUploading = false;
        this.isUploadCancel = true;
        this.file.nativeElement.value = '';
      }
    };
    // this.overwriter.onAfterAddingFile = (file) => {
    //   file.withCredentials = false;
    //   if (this.overwriter.queue.length > 1) {
    //     this.overwriter.queue.splice(0, 1);
    //   }
    // };
    // this.overwriter.onCompleteItem = (
    //   item: any,
    //   response: any,
    //   status: any,
    //   headers: any
    // ) => {
    //   response = JSON.parse(response);
    //   this.overwriting = false;
    //   if (response.status) {
    //     this.dialogRef.close({ status: true });
    //   } else {
    //     this.overwriting = false;
    //     this.file.nativeElement.value = '';
    //     // Overwriting Error Display
    //   }
    // };
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
            if (newColumn === 'notes') {
              const obj = {};
              obj[originColumn] = e;
              if (Array.isArray(contact[newColumn])) {
                contact[newColumn].push(obj);
              } else {
                contact[newColumn] = [obj];
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
        this.notesColumns.push(this.columns[i]);
      } else {
        rebuildColumns.push(this.columns[i]);
      }
    }
    this.columns = rebuildColumns;
  }

  rebuildContacts(): void {
    // let deleted = false;
    // this.columns.forEach((column) => {
    //   const newColumn = this.updateColumn[column];
    //   if (newColumn === 'notes') {
    //     delete this.updateColumn[column];
    //     deleted = true;
    //   }
    // });
    // if (deleted) {
    //   this.updateColumn['notes'] = 'notes';
    // }

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
          } else {
            // const val = contact[ImportSelectableColumn[i]];
            // const notes = [];
            // if (val) {
            //   if (!Array.isArray(val)) {
            //     Object.keys(val).forEach((key) => {
            //       if (val[key]) {
            //         const note = {
            //           title: key,
            //           content: val[key]
            //         };
            //         notes.push(note);
            //       }
            //     });
            //   } else {
            //     for (let j = 0; j < val.length; j++) {
            //       Object.keys(val[j]).forEach((key) => {
            //         if (val[j][key]) {
            //           const note = {
            //             title: key,
            //             content: val[j][key]
            //           };
            //           notes.push(note);
            //         }
            //       });
            //     }
            //   }
            //   contact[ImportSelectableColumn[i]] = notes;
            // }
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

  getNotesContent(index, column, contact): any {
    if (contact.notes) {
      for (let i = 0; i < contact.notes.length; i++) {
        for (const key in contact.notes[i]) {
          if (key === column) {
            return contact['notes'][i][key];
          }
        }
      }
    }
    return '';
  }

  getOtherContent(contact): any {
    return JSON.stringify(contact['other']);
  }

  selectableContent(column, contact): any {
    let result = '';
    const updateColumn = this.updateColumn[column];

    if (updateColumn === 'tags') {
      const content = contact[column];
      if (content) {
        for (let i = 0; i < content.length; i++) {
          if (!result.includes(content[i])) {
            if (i === content.length - 1) {
              result = result + content[i];
            } else {
              result = result + content[i] + '<br/>';
            }
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
          if (this.contacts[i][key] && this.contacts[j][key] && this.contacts[i][key] === this.contacts[j][key]) {
            return true;
          }
        }
      }
    }
    return false;
  }

  checkDuplicateEmail(contact): any {
    const key = 'primary_email';
    if (contact[key]) {
      for (let i = 0; i < this.contacts.length; i++) {
        if (
          this.contacts[i][key] &&
          this.contacts[i].id !== contact.id &&
          this.contacts[i][key] === contact[key]
        ) {
          return true;
        }
      }
      return false;
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
          // else {
          //   if (firstNameKey) {
          //     if (
          //       firstContact.first_name? &&
          //       secondContact.first_name !== '' &&
          //       firstContact.first_name === secondContact.first_name
          //     ) {
          //       merge.push(secondContact);
          //       continue;
          //     }
          //   } else if (lastNameKey) {
          //     if (
          //       firstContact.last_name !== '' &&
          //       secondContact.last_name !== '' &&
          //       firstContact.last_name === secondContact.last_name
          //     ) {
          //       merge.push(secondContact);
          //       continue;
          //     }
          //   }
          // }

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

  // toggleSecContact(dupItem, contact): void {
  //   const pos = dupItem.secondaryId.indexOf(contact.id);
  //   if (pos !== -1) {
  //     dupItem.secondaryId.splice(pos, 1);
  //   } else {
  //     dupItem.secondaryId.push(contact.id);
  //   }
  // }

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

  merge(dupIndex): void {
    const primaryContactId = this.selectedMergeContacts[dupIndex].selected[0];
    const secondaryContactId = this.selectedMergeContacts[dupIndex].selected[1];
    const primaryIndex = this.sameContacts[dupIndex].findIndex(
      (item) => item.id === primaryContactId
    );
    let secondaryIndex = this.sameContacts[dupIndex].findIndex(
      (item) => item.id === secondaryContactId
    );

    if (primaryIndex < 0 || secondaryIndex < 0) {
      return;
    }

    const primaryContact = this.sameContacts[dupIndex][primaryIndex];
    const secondaryContact = this.sameContacts[dupIndex][secondaryIndex];

    this.dialog
      .open(ImportContactMergeComponent, {
        ...DialogSettings.UPLOAD,
        data: {
          primary: primaryContact,
          secondary: secondaryContact,
          updateColumn: this.updateColumn
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          const merged = res.merged;

          this.selectedMergeContacts[dupIndex].deselect(primaryContactId);
          this.selectedMergeContacts[dupIndex].deselect(secondaryContactId);
          this.sameContacts[dupIndex].splice(primaryIndex, 1);
          secondaryIndex = this.sameContacts[dupIndex].findIndex(
            (item) => item.id === secondaryContactId
          );
          this.sameContacts[dupIndex].splice(secondaryIndex, 1);

          const idxPrimary = this.contacts.findIndex(
            (item) => item.id === primaryContactId
          );

          if (idxPrimary >= 0) {
            this.contacts.splice(idxPrimary, 1);
          }

          const idxSecondary = this.contacts.findIndex(
            (item) => item.id === secondaryContactId
          );
          if (idxSecondary >= 0) {
            this.contacts.splice(idxSecondary, 1);
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

          if (res.type === 'csv') {
            if (merged['notes']) {
              const tempNotes = [];
              for (let i = 0; i < merged['notes'].length; i++) {
                if (!!merged['notes'][i]) {
                  for (const key in merged['notes'][i]) {
                    if (!!merged['notes'][i][key]) {
                      tempNotes.push(merged['notes'][i]);
                    }
                  }
                }
              }

              for (let i = 0; i < this.notesColumns.length; i++) {
                const columnIndex = tempNotes.findIndex((item) => item[this.notesColumns[i]]);
                if (columnIndex >= 0) {
                  tempNotes.splice(columnIndex, 1);
                }
              }
              if (tempNotes.length) {
                merged['other'] = tempNotes;
              }
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

  isContactExist(): any {
    for (let i = 0; i < this.contacts.length; i++) {
      if (this.contacts[i]._id) {
        return true;
      }
    }
    return false;
  }

  goToReview(): void {
    const csvImport = this.isContactExist();
    const csvContacts = [];
    let isDuplicateKey = false;
    this.duplicateItems = [];
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
            if (dupItem[i]['primary_email'] !== '' && dupItem[j]['primary_email'] !== '' &&
              dupItem[i]['primary_email'] !== null && dupItem[j]['primary_email'] !== null &&
              dupItem[i]['primary_email'] === dupItem[j]['primary_email']) {
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

    if (!isDuplicateKey) {
      for (let i = 0; i < this.duplicateItems.length; i++) {
        if (this.duplicateItems[i] === true) {
          return;
        }
      }
      if (this.firstImport) {
        this.firstImport = false;
        this.step = 4;
      } else {
        if (csvContacts.length) {
          this.uploading = true;
          this.contactService.bulkCreate(csvContacts).subscribe(
            (res) => {
              this.uploading = false;
              if (res) {
              }
              this.dialogRef.close({});
              this.handlerService.bulkContactAdd$();
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

  goToMatch(): void {
    this.step = 2;
  }

  rebuildContactForNote(): any {
    const uploadContacts = [];
    for (let i = 0; i < this.contactsToUpload.length; i++) {
      uploadContacts.push(Object.assign({}, this.contactsToUpload[i]));
    }
    for (const contact of uploadContacts) {
      if (contact.notes && contact.notes.length) {
        const tempNotes = [];
        for (let i = 0; i < contact.notes.length; i++) {
          for (let key in contact.notes[i]) {
            if (contact.notes[i][key] && contact.notes[i][key] !== '') {
              tempNotes.push({
                title: key,
                content: contact.notes[i][key]
              });
            }
          }
        }
        contact.notes = tempNotes;
      }
    }
    return uploadContacts;
  }

  upload(): void {
    this.failedData = [];
    let headers = [];
    const lines = [];
    for (const key in this.updateColumn) {
      if (this.updateColumn[key]) {
        headers.push(this.updateColumn[key]);
      }
    }
    const uploadContacts = this.rebuildContactForNote();

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
            continue;
          } else {
            record.push(contact[key] || '');
          }
        }
        if (contact['notes']) {
          if (contact['notes'].length) {
            record.push(JSON.stringify(contact['notes']));
          }
        }
        lines.push(record);
      }
    }
    headers = [];
    let isNotesExist = false;
    for (const key in this.updateColumn) {
      if (this.updateColumn[key]) {
        if (this.updateColumn[key] === 'primary_email') {
          headers.push('email');
        } else if (this.updateColumn[key] === 'primary_phone') {
          headers.push('cell_phone');
        } else if (this.updateColumn[key] === 'notes') {
          isNotesExist = true;
          continue;
        } else {
          headers.push(this.updateColumn[key]);
        }
      }
    }
    if (isNotesExist) {
      headers.push('notes');
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
              const contactIndex = this.contacts.findIndex((contact) => contact.id === id);
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
        message: 'Are you sure to remove the contact?',
        cancelLabel: 'No',
        confirmLabel: 'Remove'
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
