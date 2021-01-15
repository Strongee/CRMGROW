import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Contact } from 'src/app/models/contact.model';
import { FormControl } from '@angular/forms';
import { HtmlEditorComponent } from '../html-editor/html-editor.component';

@Component({
  selector: 'app-material-send',
  templateUrl: './material-send.component.html',
  styleUrls: ['./material-send.component.scss']
})
export class MaterialSendComponent implements OnInit {
  selected = new FormControl(0);
  contacts: Contact[] = [];
  selectedTemplate = { subject: '', content: '' };
  submitted = false;
  saving = false;
  videos: any[] = [];
  pdfs: any[] = [];
  images: any[] = [];

  focusedField = '';
  @ViewChild('emailEditor') htmlEditor: HtmlEditorComponent;

  constructor(
    private dialogRef: MatDialogRef<MaterialSendComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    if (this.data.material.length > 1) {
      this.data.material.forEach((material) => {
        if (material.type && material.type.startsWith('video')) {
          this.videos.push(material);
        }
        if (material.type && material.type.endsWith('pdf')) {
          this.pdfs.push(material);
        }
        if (material.type && material.type.startsWith('image')) {
          this.images.push(material);
        }
      });
    }
    if (this.data.type) {
      if (this.data.type == 'email') {
        this.selected.setValue(1);
      } else {
        this.selected.setValue(0);
      }
    }
  }

  selectTemplate(event): void {
    this.selectedTemplate = event;
  }

  send(): void {
    if (this.contacts.length == 0) {
      this.submitted = false;
      return;
    } else {
      // this.saving = true;
      if (this.selected.value == 0) {
      }
    }
  }

  focusEditor(): void {
    this.focusedField = 'editor';
  }
}
