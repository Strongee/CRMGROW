import { Component, Inject, OnInit } from '@angular/core';
import { TabItem } from '../../utils/data.types';
import { MaterialService } from '../../services/material.service';
import { SelectionModel } from '@angular/cdk/collections';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TeamService } from '../../services/team.service';
import { StoreService } from 'src/app/services/store.service';
import { Subscription } from 'rxjs';

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
  selectFilterMaterial = '';

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

  videoLoadSubscription: Subscription;
  pdfLoadSubscription: Subscription;
  imageLoadSubscription: Subscription;

  constructor(
    private dialogRef: MatDialogRef<MaterialShareComponent>,
    private materialService: MaterialService,
    public storeService: StoreService,
    private teamService: TeamService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.loadVideos();
    this.loadImages();
    this.loadPdfs();
  }

  ngOnInit(): void {
    this.teamId = this.data.team_id;
    this.materialService.loadVideos();
    this.materialService.loadPdfs();
    this.materialService.loadImages();
  }

  ngOnDestroy(): void {
    this.videoLoadSubscription && this.videoLoadSubscription.unsubscribe();
    this.pdfLoadSubscription && this.pdfLoadSubscription.unsubscribe();
    this.imageLoadSubscription && this.imageLoadSubscription.unsubscribe();
  }

  changeTab(tab: TabItem): void {
    this.selectedTab = tab;
  }

  loadVideos(): void {
    this.videosLoading = true;
    this.videosLoadError = '';
    this.videoLoadSubscription && this.videoLoadSubscription.unsubscribe();
    this.videoLoadSubscription = this.storeService.videos$.subscribe(
      (videos) => {
        this.videosLoading = false;
        this.videos = videos;
      },
      (err) => {
        this.videosLoading = false;
      }
    );
  }

  loadPdfs(): void {
    this.pdfsLoading = true;
    this.pdfsLoadError = '';
    this.pdfLoadSubscription && this.pdfLoadSubscription.unsubscribe();
    this.pdfLoadSubscription = this.storeService.pdfs$.subscribe(
      (pdfs) => {
        this.pdfsLoading = false;
        this.pdfs = pdfs;
      },
      (err) => {
        this.pdfsLoading = false;
      }
    );
  }

  loadImages(): void {
    this.imagesLoading = true;
    this.imagesLoadError = '';
    this.imageLoadSubscription && this.imageLoadSubscription.unsubscribe();
    this.imageLoadSubscription = this.storeService.images$.subscribe(
      (images) => {
        this.imagesLoading = false;
        this.images = images;
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

  toggleVideo(video: any): void {
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

  selectMaterial(material: any): void {
    this.selectedMaterials = [];
    this.selectedMaterials.push(material);
    this.selectFilterMaterial = material._id;
  }

  togglePdf(pdf: any): void {
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

  toggleImage(image: any): void {
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

  deselectMaterial(material: any): void {
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

  getMaterialType(material: any): any {
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

    this.teamService.shareVideos(this.teamId, videoIds).subscribe(
      (res) => {
        if (res) {
          this.sharing = false;
          this.dialogRef.close({
            videos: res
          });
        }
      },
      (error) => {
        this.sharing = false;
        this.dialogRef.close();
      }
    );
    // await this.teamService.sharePdfs(this.teamId, pdfIds);
    // await this.teamService.shareImages(this.teamId, imageIds);

    // this.sharing = false;
    // this.dialogRef.close();
  }

  filterMaterial(): void {
    this.dialogRef.close(this.selectedMaterials);
  }
}
