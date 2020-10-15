import { Component, OnInit } from '@angular/core';
import { MaterialService } from 'src/app/services/material.service';
import { StoreService } from 'src/app/services/store.service';
import { TabItem } from 'src/app/utils/data.types';

@Component({
  selector: 'app-materials',
  templateUrl: './materials.component.html',
  styleUrls: ['./materials.component.scss']
})
export class MaterialsComponent implements OnInit {
  tabs: TabItem[] = [
    { icon: '', label: 'ALL', id: 'all' },
    { icon: 'i-icon i-notification', label: 'VIDEO', id: 'videos' },
    { icon: 'i-icon i-notification', label: 'PDF', id: 'pdfs' },
    { icon: 'i-icon i-notification', label: 'IMAGE', id: 'images' }
  ];
  selectedTab: TabItem = this.tabs[0];

  constructor(
    public storeService: StoreService,
    public materialService: MaterialService
  ) {}

  ngOnInit(): void {
    this.materialService.loadVideos();
  }

  changeTab(tab: TabItem): void {
    this.selectedTab = tab;
  }
}
