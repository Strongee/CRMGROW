import { Component, Input, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';

@Component({
  selector: 'app-campaign-bulk-mailing-item',
  templateUrl: './campaign-bulk-mailing-item.component.html',
  styleUrls: ['./campaign-bulk-mailing-item.component.scss']
})
export class CampaignBulkMailingItemComponent implements OnInit {
  @Input('id') id: string;
  constructor(private location: Location, private dialog: MatDialog) {}

  ngOnInit(): void {}

  editBulk(): void {}
}
