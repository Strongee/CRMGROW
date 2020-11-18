import { Component, Inject, OnInit } from '@angular/core';
import { TabItem } from '../../utils/data.types';
import { MaterialService } from '../../services/material.service';
import { SelectionModel } from '@angular/cdk/collections';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {TeamService} from "../../services/team.service";

@Component({
  selector: 'app-material-share',
  templateUrl: './material-share.component.html',
  styleUrls: ['./material-share.component.scss']
})
export class MaterialShareComponent implements OnInit {

  material_type = '';
  teamId = '';
  sharing = false;
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
    private dialogRef: MatDialogRef<MaterialShareComponent>,
    private materialService: MaterialService,
    private teamService: TeamService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.teamId = this.data.team_id;
    this.loadVideos();
    this.loadPdfs();
    this.loadImages();
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
        console.log('material pdfs ===========>', res);
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
        console.log('material images ===========>', res);
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

  async shareMaterials(): Promise<void> {
    if (this.selectedMaterials.length <= 0) {
      return;
    }

    this.sharing = true;
    const videoIds = [];
    const pdfIds = [];
    const imageIds = [];

    for (let i = 0; i < this.selectedMaterials.length; i++) {
      if (this.getMaterialType(this.selectedMaterials[i]) === 'Video') {
        videoIds.push(this.selectedMaterials[i]._id);
      } else if (this.getMaterialType(this.selectedMaterials[i]) === 'PDF') {
        pdfIds.push(this.selectedMaterials[i]._id);
      } else if (this.getMaterialType(this.selectedMaterials[i]) === 'Image') {
        imageIds.push(this.selectedMaterials[i]._id);
      }
    }

    this.teamService.shareVideos(this.teamId, videoIds).subscribe((res) => {

    });
    // await this.teamService.sharePdfs(this.teamId, pdfIds);
    // await this.teamService.shareImages(this.teamId, imageIds);

    this.sharing = false;
    this.dialogRef.close();
  }
}
