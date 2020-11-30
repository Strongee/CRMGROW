import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ContactDetail } from 'src/app/models/contact.model';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-contact-merge',
  templateUrl: './contact-merge.component.html',
  styleUrls: ['./contact-merge.component.scss']
})
export class ContactMergeComponent implements OnInit {
  saving = false;
  sourceContact: ContactDetail = new ContactDetail();
  mergeContact: ContactDetail = new ContactDetail();
  contactSelected = false;

  selectedSourceLists = new SelectionModel<any>(true, []);
  selectedMergeLists = new SelectionModel<any>(true, []);

  constructor(
    private dialogRef: MatDialogRef<ContactMergeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.sourceContact = this.data.contact;
  }

  addContacts(contact: any): void {
    this.mergeContact = contact;
    this.contactSelected = true;
  }

  selectAll(type: string): any {
    switch (type) {
      case 'source':
        if (this.isSelected(type)) {
          this.selectedSourceLists.clear();
        } else {
          this.selectedSourceLists.select('sourceName');
          this.selectedSourceLists.select('sourceLabel');
          this.selectedSourceLists.select('sourcePrimary');
          this.selectedSourceLists.select('sourcePrimaryPhone');
          this.selectedSourceLists.select('sourcePrimaryEmail');
          this.selectedSourceLists.select('sourcePrimaryAddress');
          this.selectedSourceLists.select('sourcePrimaryWebsite');
          this.selectedSourceLists.select('sourceSecond');
          this.selectedSourceLists.select('sourceSecondPhone');
          this.selectedSourceLists.select('sourceSecondEmail');
        }
        break;
      case 'merge':
        if (this.isSelected(type)) {
          this.selectedMergeLists.clear();
        } else {
          this.selectedMergeLists.select('mergeName');
          this.selectedMergeLists.select('mergeLabel');
          this.selectedMergeLists.select('mergePrimary');
          this.selectedMergeLists.select('mergePrimaryPhone');
          this.selectedMergeLists.select('mergePrimaryEmail');
          this.selectedMergeLists.select('mergePrimaryAddress');
          this.selectedMergeLists.select('mergePrimaryWebsite');
          this.selectedMergeLists.select('mergeSecond');
          this.selectedMergeLists.select('mergeSecondPhone');
          this.selectedMergeLists.select('mergeSecondEmail');
        }
        break;
    }
  }

  isSelected(type: string): any {
    switch (type) {
      case 'source':
        const selectedSourceCount = this.selectedSourceLists.selected.length;
        return selectedSourceCount == 10;
      case 'merge':
        const selectedMergeCount = this.selectedMergeLists.selected.length;
        return selectedMergeCount == 10;
    }
  }
}
