import { Component, Input, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { CampaignService } from '../../services/campaign.service';
import { MailListService } from '../../services/maillist.service';
import { TemplatesService } from '../../services/templates.service';
import {MaterialService} from "../../services/material.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-campaign-bulk-mailing-item',
  templateUrl: './campaign-bulk-mailing-item.component.html',
  styleUrls: ['./campaign-bulk-mailing-item.component.scss']
})
export class CampaignBulkMailingItemComponent implements OnInit {
  isLoading = false;
  id = '';
  campaign;

  constructor(
    private campaignService: CampaignService,
    private mailListService: MailListService,
    private templateService: TemplatesService,
    private materialService: MaterialService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.params.id;
    this.loadBulk();
  }

  loadBulk(): void {
    this.isLoading = true;
    this.campaignService.get(this.id).subscribe(
      (res) => {
        if (res) {
          this.campaign = res;
        }
      },
      (error) => {}
    );
  }

  editBulk(): void {}
}
