import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-campaign-add-list',
  templateUrl: './campaign-add-list.component.html',
  styleUrls: ['./campaign-add-list.component.scss']
})
export class CampaignAddListComponent implements OnInit {
  listName = '';
  submitted = false;
  isLoading = false;
  constructor(private dialogRef: MatDialogRef<CampaignAddListComponent>) {}

  ngOnInit(): void {}

  addList(): void {
    this.submitted = true;
    if (this.listName === '') {
      return;
    }

    this.dialogRef.close({ name: this.listName });
  }
}
