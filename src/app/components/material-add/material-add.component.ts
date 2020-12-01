import { Component, Inject, OnInit } from '@angular/core';
import { TabItem } from '../../utils/data.types';
import { MaterialService } from '../../services/material.service';
import { SelectionModel } from '@angular/cdk/collections';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-material-add',
  templateUrl: './material-add.component.html',
  styleUrls: ['./material-add.component.scss']
})
export class MaterialAddComponent implements OnInit {
  material_type = '';
  attaching = false;
  loading = false;

  videos = [];
  videosLoading = false;
  videosLoadError = '';

  pdfs = [];
  pdfsLoading = false;
  pdfsLoadError = '';

  images = [];
  imagesLoading = false;
  imagesLoadError = '';

  selectedMaterials = [];

  materialError = '';
  tabs: TabItem[] = [
    { icon: 'i-icon i-video', label: 'VIDEO', id: 'videos' },
    { icon: 'i-icon i-pdf', label: 'PDF', id: 'pdfs' },
    { icon: 'i-icon i-notification', label: 'IMAGE', id: 'images' }
  ];
  selectedTab: TabItem = this.tabs[0];
  selectedVideos = new SelectionModel<any>(true, []);
  selectedPdfs = new SelectionModel<any>(true, []);
  selectedImages = new SelectionModel<any>(true, []);

  constructor(
    private dialogRef: MatDialogRef<MaterialAddComponent>,
    private materialService: MaterialService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.selectedMaterials = this.data;
    this.loadVideos();
    this.loadPdfs();
    this.loadImages();

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

  changeTab(tab: TabItem): void {
    this.selectedTab = tab;
  }

  loadVideos(): void {
    this.videosLoading = true;
    this.videosLoadError = '';
    this.materialService.loadVideosImpl().subscribe(
      (res) => {
        this.videosLoading = false;
        this.videos = res;
      },
      (err) => {
        this.videosLoading = false;
      }
    );
  }

  loadPdfs(): void {
    this.pdfsLoading = true;
    this.pdfsLoadError = '';
    this.materialService.loadPdfsImpl().subscribe(
      (res) => {
        this.pdfsLoading = false;
        this.pdfs = res;
      },
      (err) => {
        this.pdfsLoading = false;
      }
    );
  }

  loadImages(): void {
    this.imagesLoading = true;
    this.imagesLoadError = '';
    this.materialService.loadImagesImpl().subscribe(
      (res) => {
        this.imagesLoading = false;
        this.images = res;
      },
      (err) => {
        this.imagesLoading = false;
        if (err.status === 400) {
          this.imagesLoadError = 'Error is occured in image loading.';
        }
        if (err.status === 500) {
          this.imagesLoadError = 'Server Error is occured in image Loading.';
        }
      }
    );
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
