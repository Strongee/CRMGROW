import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MailListService } from '../../services/maillist.service';

@Component({
  selector: 'app-campaign-add-list',
  templateUrl: './campaign-add-list.component.html',
  styleUrls: ['./campaign-add-list.component.scss']
})
export class CampaignAddListComponent implements OnInit {
  listName = '';
  submitted = false;
  creating = false;
  constructor(
    private dialogRef: MatDialogRef<CampaignAddListComponent>,
    private mailListService: MailListService
  ) {}

  ngOnInit(): void {}

  addList(): void {
    this.creating = true;
    this.mailListService.createList(this.listName, []).subscribe((res) => {
      this.creating = false;
      this.dialogRef.close({ data: res });
    });
  }
}
