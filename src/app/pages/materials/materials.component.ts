import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BulkActions } from 'src/app/constants/variable.constants';
import { MaterialService } from 'src/app/services/material.service';
import { StoreService } from 'src/app/services/store.service';
import { TabItem } from 'src/app/utils/data.types';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-materials',
  templateUrl: './materials.component.html',
  styleUrls: ['./materials.component.scss']
})
export class MaterialsComponent implements OnInit {
  BULK_ACTIONS = BulkActions.Materials;
  tabs: TabItem[] = [
    { icon: '', label: 'ALL', id: 'all' },
    { icon: 'i-icon i-video', label: 'VIDEO', id: 'videos' },
    { icon: 'i-icon i-pdf', label: 'PDF', id: 'pdfs' },
    { icon: 'i-icon i-notification', label: 'IMAGE', id: 'images' }
  ];
  selectedTab: TabItem = this.tabs[0];
  siteUrl = environment.website;

  constructor(
    public storeService: StoreService,
    public materialService: MaterialService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.materialService.loadVideos();
    this.materialService.loadPdfs();
    this.materialService.loadImages();
  }

  changeTab(tab: TabItem): void {
    this.selectedTab = tab;
  }

  createVideo(): void {
    this.router.navigate(['./materials/create']);
  }

  doAction(evt: any): void {}
}
