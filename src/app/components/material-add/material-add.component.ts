import { Component, Inject, OnInit } from '@angular/core';
import { TabItem } from '../../utils/data.types';
import { MaterialService } from '../../services/material.service';
import { SelectionModel } from '@angular/cdk/collections';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { StoreService } from 'src/app/services/store.service';
import { Subscription } from 'rxjs';
import { STATUS } from 'src/app/constants/variable.constants';

@Component({
  selector: 'app-material-add',
  templateUrl: './material-add.component.html',
  styleUrls: ['./material-add.component.scss']
})
export class MaterialAddComponent implements OnInit {
  STATUS = STATUS;
  tabs: TabItem[] = [
    { icon: 'i-icon i-video', label: 'VIDEO', id: 'videos' },
    { icon: 'i-icon i-pdf', label: 'PDF', id: 'pdfs' },
    { icon: 'i-icon i-notification', label: 'IMAGE', id: 'images' }
  ];
  selectedTab: TabItem = this.tabs[0];
  material_type = '';
  attaching = false;

  videos = [];
  pdfs = [];
  images = [];
  selectedMaterials = [];

  materialError = '';
  selectedVideos = new SelectionModel<any>(true, []);
  selectedPdfs = new SelectionModel<any>(true, []);
  selectedImages = new SelectionModel<any>(true, []);

  videoLoadSubscription: Subscription;
  pdfLoadSubscription: Subscription;
  imageLoadSubscription: Subscription;

  constructor(
    private dialogRef: MatDialogRef<MaterialAddComponent>,
    private materialService: MaterialService,
    public storeService: StoreService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.selectedMaterials = this.data ? this.data : [];
    this.materialService.loadVideos();
    this.materialService.loadPdfs();
    this.materialService.loadImages();

    for (let i = 0; i < this.selectedMaterials.length; i++) {
      const material = this.selectedMaterials[i];
      if (this.getMaterialType(material) === 'Video') {
        this.selectedVideos.select(material._id);
      } else if (this.getMaterialType(material) === 'PDF') {
        this.selectedPdfs.select(material._id);
      } else if (this.getMaterialType(material) === 'Image') {
        this.selectedImages.select(material._id);
      }
    }
  }

  ngOnDestroy(): void {}

  changeTab(tab: TabItem): void {
    this.selectedTab = tab;
  }

  toggleVideo(video): void {
    this.materialError = '';
    if (this.selectedVideos.isSelected(video._id)) {
      this.selectedVideos.deselect(video._id);
      const index = this.selectedMaterials.findIndex(
        (item) => item._id === video._id
      );
      if (index >= 0) {
        this.selectedMaterials.splice(index, 1);
      }
    } else {
      this.selectedVideos.select(video._id);
      this.selectedMaterials.push(video);
    }
  }

  togglePdf(pdf): void {
    this.materialError = '';
    if (this.selectedPdfs.isSelected(pdf._id)) {
      this.selectedPdfs.deselect(pdf._id);
      const index = this.selectedMaterials.findIndex(
        (item) => item._id === pdf._id
      );
      if (index >= 0) {
        this.selectedMaterials.splice(index, 1);
      }
    } else {
      this.selectedPdfs.select(pdf._id);
      this.selectedMaterials.push(pdf);
    }
  }

  toggleImage(image): void {
    this.materialError = '';
    if (this.selectedImages.isSelected(image._id)) {
      this.selectedImages.deselect(image._id);
      const index = this.selectedMaterials.findIndex(
        (item) => item._id === image._id
      );
      if (index >= 0) {
        this.selectedMaterials.splice(index, 1);
      }
    } else {
      this.selectedImages.select(image._id);
      this.selectedMaterials.push(image);
    }
  }

  deselectMaterial(material): void {
    const index = this.selectedMaterials.findIndex(
      (item) => item._id === material._id
    );
    if (index >= 0) {
      this.selectedMaterials.splice(index, 1);
    }
    if (this.selectedVideos.isSelected(material._id)) {
      this.selectedVideos.deselect(material._id);
    }
    if (this.selectedPdfs.isSelected(material._id)) {
      this.selectedPdfs.deselect(material._id);
    }
    if (this.selectedImages.isSelected(material._id)) {
      this.selectedImages.deselect(material._id);
    }
  }

  getMaterialType(material): any {
    if (material.type) {
      if (material.type === 'application/pdf') {
        return 'PDF';
      } else if (material.type.includes('image')) {
        return 'Image';
      }
    }
    return 'Video';
  }

  attachMaterial(): void {
    if (!this.selectedMaterials.length) {
      return;
    }
    this.dialogRef.close({ materials: this.selectedMaterials });
  }
}
