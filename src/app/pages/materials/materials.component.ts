import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MaterialService } from 'src/app/services/material.service';
import { StoreService } from 'src/app/services/store.service';
import { ToastrService } from 'ngx-toastr';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/models/user.model';
import { Garbage } from 'src/app/models/garbage.model';
import { TabItem } from 'src/app/utils/data.types';
import { environment } from 'src/environments/environment';
import { BulkActions } from 'src/app/constants/variable.constants';
import { SelectionModel } from '@angular/cdk/collections';
import { MaterialEditTemplateComponent } from 'src/app/components/material-edit-template/material-edit-template.component';
import { getJSDocThisTag } from 'typescript';
import { Subscription } from 'rxjs';
import { ConfirmComponent } from 'src/app/components/confirm/confirm.component';

@Component({
  selector: 'app-materials',
  templateUrl: './materials.component.html',
  styleUrls: ['./materials.component.scss']
})
export class MaterialsComponent implements OnInit {
  user: User = new User();
  garbage: Garbage = new Garbage();
  BULK_ACTIONS = BulkActions.Materials;
  tabs: TabItem[] = [
    { icon: '', label: 'ALL', id: 'all' },
    { icon: 'i-icon i-video', label: 'VIDEO', id: 'videos' },
    { icon: 'i-icon i-pdf', label: 'PDF', id: 'pdfs' },
    { icon: 'i-icon i-notification', label: 'IMAGE', id: 'images' }
  ];
  selectedTab: TabItem = this.tabs[0];
  siteUrl = environment.website;
  user_id = '';

  videos: any[] = [];
  adminVideos: any[] = [];
  ownVideos: any[] = [];
  teamVideos: any[] = [];

  pdfs: any[] = [];
  adminPdfs: any[] = [];
  ownPdfs: any[] = [];
  teamPdfs: any[] = [];

  images: any[] = [];
  adminImages: any[] = [];
  ownImages: any[] = [];
  teamImages: any[] = [];

  videoLoadSubscription: Subscription;
  pdfLoadSubscription: Subscription;
  imageLoadSubscription: Subscription;

  videoDeleteSubscription: Subscription;
  pdfDeleteSubscription: Subscription;
  imageDeleteSubscription: Subscription;

  selectedVideoLists = new SelectionModel<any>(true, []);
  selectedPdfLists = new SelectionModel<any>(true, []);
  selectedImageLists = new SelectionModel<any>(true, []);
  captureVideos = [];
  editedVideos;
  capturePdfs = [];
  editedPdfs;
  captureImages = [];
  editedImages;

  constructor(
    private dialog: MatDialog,
    public storeService: StoreService,
    public materialService: MaterialService,
    private userService: UserService,
    private toast: ToastrService,
    private router: Router
  ) {
    this.loadVideos();
    this.loadImages();
    this.loadPdfs();
    this.userService.profile$.subscribe((profile) => {
      this.user = profile;
      this.user_id = this.user._id;
    });
    this.userService.garbage$.subscribe((res) => {
      this.garbage = new Garbage().deserialize(res);
      this.captureVideos = this.garbage['capture_videos'] || [];
      this.editedVideos = this.garbage['edited_video'] || [];
      this.capturePdfs = this.garbage['capture_pdfs'] || [];
      this.editedPdfs = this.garbage['edited_pdf'] || [];
      this.captureImages = this.garbage['capture_images'] || [];
      this.editedImages = this.garbage['edited_image'] || [];
    });
  }

  ngOnInit(): void {
    this.materialService.loadVideos();
    this.materialService.loadPdfs();
    this.materialService.loadImages();
  }

  ngOnDestroy(): void {
    this.videoLoadSubscription && this.videoLoadSubscription.unsubscribe();
    this.pdfLoadSubscription && this.pdfLoadSubscription.unsubscribe();
    this.imageLoadSubscription && this.imageLoadSubscription.unsubscribe();
    this.videoDeleteSubscription && this.videoDeleteSubscription.unsubscribe();
    this.pdfDeleteSubscription && this.pdfDeleteSubscription.unsubscribe();
    this.imageDeleteSubscription && this.imageDeleteSubscription.unsubscribe();
  }

  changeTab(tab: TabItem): void {
    this.selectedTab = tab;
  }

  loadVideos(): void {
    this.videoLoadSubscription && this.videoLoadSubscription.unsubscribe();
    this.videoLoadSubscription = this.storeService.videos$.subscribe(
      (videos) => {
        this.adminVideos = [];
        this.ownVideos = [];
        this.teamVideos = [];
        const videoIds = [];
        videos.forEach((e) => {
          if (videoIds.indexOf(e._id) !== -1) {
            return;
          }
          if (e.role == 'admin') {
            this.adminVideos.push(e);
          } else if (e.role === 'team' && e.user !== this.user_id) {
            this.teamVideos.push(e);
          } else {
            this.ownVideos.push(e);
          }
          videoIds.push(e._id);
        });
      }
    );
  }

  loadPdfs(): void {
    this.pdfLoadSubscription && this.pdfLoadSubscription.unsubscribe();
    this.pdfLoadSubscription = this.storeService.pdfs$.subscribe((pdfs) => {
      this.pdfs = pdfs;
      this.adminPdfs = [];
      this.teamPdfs = [];
      this.ownPdfs = [];
      const pdfIds = [];
      pdfs.forEach((e) => {
        if (pdfIds.indexOf(e._id) !== -1) {
          return;
        }
        if (e.role == 'admin') {
          this.adminPdfs.push(e);
        } else if (e.role == 'team' && e.user != this.user_id) {
          this.teamPdfs.push(e);
        } else {
          this.ownPdfs.push(e);
        }
        pdfIds.push(e._id);
      });
    });
  }

  loadImages(): void {
    this.imageLoadSubscription && this.imageLoadSubscription.unsubscribe();
    this.imageLoadSubscription = this.storeService.images$.subscribe(
      (images) => {
        this.images = images;
        this.adminImages = [];
        this.ownImages = [];
        this.teamImages = [];
        const imageIds = [];
        images.forEach((e) => {
          if (imageIds.indexOf(e._id) !== -1) {
            return;
          }
          if (e.role == 'admin') {
            this.adminImages.push(e);
          } else if (e.role == 'team' && e.user != this.user_id) {
            this.teamImages.push(e);
          } else {
            this.ownImages.push(e);
          }
          imageIds.push(e._id);
        });
      }
    );
  }

  createVideo(): void {
    this.router.navigate(['./materials/create']);
  }

  doAction(evt: any): void {}

  selectFolder(): void {}

  copyLink(material: any, type: string): void {
    let url;

    if (type == 'video') {
      url =
        environment.website +
        '/video?video=' +
        material._id +
        '&user=' +
        this.user_id;
    } else if (type == 'pdf') {
      url =
        environment.website +
        '/pdf?pdf=' +
        material._id +
        '&user=' +
        this.user_id;
    } else if (type == 'image') {
      url =
        environment.website +
        '/image?image=' +
        material._id +
        '&user=' +
        this.user_id;
    }
    const el = document.createElement('textarea');
    el.value = url;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    this.toast.success('Copied the link to clipboard');
  }

  selectAllPage(type: string): void {
    switch (type) {
      case 'video':
        if (this.isSelectedPage(type)) {
          this.videos.forEach((e) => {
            if (this.selectedVideoLists.isSelected(e._id)) {
              this.selectedVideoLists.deselect(e._id);
            }
          });
        } else {
          this.videos.forEach((e) => {
            if (!this.selectedVideoLists.isSelected(e._id)) {
              this.selectedVideoLists.select(e._id);
            }
          });
        }
        break;
      case 'pdf':
        if (this.isSelectedPage(type)) {
          this.pdfs.forEach((e) => {
            if (this.selectedPdfLists.isSelected(e._id)) {
              this.selectedPdfLists.deselect(e._id);
            }
          });
        } else {
          this.pdfs.forEach((e) => {
            if (!this.selectedPdfLists.isSelected(e._id)) {
              this.selectedPdfLists.select(e._id);
            }
          });
        }
        break;
      case 'image':
        if (this.isSelectedPage(type)) {
          this.images.forEach((e) => {
            if (this.selectedImageLists.isSelected(e._id)) {
              this.selectedImageLists.deselect(e._id);
            }
          });
        } else {
          this.images.forEach((e) => {
            if (!this.selectedImageLists.isSelected(e._id)) {
              this.selectedImageLists.select(e._id);
            }
          });
        }
        break;
    }
  }

  isSelectedPage(type: string): any {
    switch (type) {
      case 'video':
        if (this.videos.length) {
          for (let i = 0; i < this.videos.length; i++) {
            const e = this.videos[i];
            if (!this.selectedVideoLists.isSelected(e._id)) {
              return false;
            }
          }
        }
        return true;
      case 'pdf':
        if (this.pdfs.length) {
          for (let i = 0; i < this.pdfs.length; i++) {
            const e = this.pdfs[i];
            if (!this.selectedPdfLists.isSelected(e._id)) {
              return false;
            }
          }
        }
        return true;
      case 'image':
        if (this.images.length) {
          for (let i = 0; i < this.images.length; i++) {
            const e = this.images[i];
            if (!this.selectedImageLists.isSelected(e._id)) {
              return false;
            }
          }
        }
        return true;
    }
  }

  setCapture(material_id: string, type: string): void {
    switch (type) {
      case 'video':
        if (this.captureVideos.indexOf(material_id) === -1) {
          this.captureVideos.push(material_id);
          this.garbage.capture_videos = this.captureVideos;
          this.userService
            .updateGarbage({ capture_videos: this.captureVideos })
            .subscribe(() => {
              this.userService.updateGarbageImpl(this.garbage);
            });
        } else {
          const pos = this.captureVideos.indexOf(material_id);
          this.captureVideos.splice(pos, 1);
          this.garbage.capture_videos = [];
          this.garbage.capture_videos = this.captureVideos;
          this.userService
            .updateGarbage({ capture_videos: this.captureVideos })
            .subscribe(() => {
              this.userService.updateGarbageImpl(this.garbage);
            });
        }
        break;
      case 'pdf':
        if (this.capturePdfs.indexOf(material_id) === -1) {
          this.capturePdfs.push(material_id);
          this.garbage.capture_pdfs = this.capturePdfs;
          this.userService
            .updateGarbage({ capture_pdfs: this.capturePdfs })
            .subscribe(() => {
              this.userService.updateGarbageImpl(this.garbage);
            });
        } else {
          const pos = this.capturePdfs.indexOf(material_id);
          this.capturePdfs.splice(pos, 1);
          this.garbage.capture_pdfs = [];
          this.garbage.capture_pdfs = this.capturePdfs;
          this.userService
            .updateGarbage({ capture_pdfs: this.capturePdfs })
            .subscribe(() => {
              this.userService.updateGarbageImpl(this.garbage);
            });
        }
        break;
      case 'image':
        if (this.captureImages.indexOf(material_id) === -1) {
          this.captureImages.push(material_id);
          this.garbage.capture_images = this.captureImages;
          this.userService
            .updateGarbage({ capture_images: this.captureImages })
            .subscribe(() => {
              this.userService.updateGarbageImpl(this.garbage);
            });
        } else {
          const pos = this.captureImages.indexOf(material_id);
          this.captureImages.splice(pos, 1);
          this.garbage.capture_images = [];
          this.garbage.capture_images = this.captureImages;
          this.userService
            .updateGarbage({ capture_images: this.captureImages })
            .subscribe(() => {
              this.userService.updateGarbageImpl(this.garbage);
            });
        }
        break;
    }
  }

  editMaterial(material: any): void {
    console.log('##', this.garbage);
  }

  duplicateMaterial(): void {}

  deleteMaterial(material: any, type: string): void {
    switch (type) {
      case 'video':
        const confirmDialog = this.dialog.open(ConfirmComponent, {
          position: { top: '100px' },
          data: {
            title: 'Delete Video',
            message: 'Are you sure to delete this video?',
            confirmLabel: 'Delete',
            cancelLabel: 'Cancel'
          }
        });
        if (material.rol == 'admin') {
          confirmDialog.afterClosed().subscribe((res) => {
            if (res) {
              const pos = this.editedVideos.indexOf(material._id);
              if (pos != -1) {
                return;
              } else {
                this.userService
                  .updateGarbage({
                    edited_video: [...this.editedVideos, material._id]
                  })
                  .subscribe(() => {
                    this.editedVideos.push(material._id);
                    this.userService.updateGarbageImpl(this.garbage);
                    this.adminVideos.some((e, index) => {
                      if (e._id == material._id) {
                        this.adminVideos.splice(index, 1);
                        return true;
                      }
                    });
                  });
              }
            }
          });
        } else {
          confirmDialog.afterClosed().subscribe((res) => {
            if (res) {
              this.videoDeleteSubscription &&
                this.videoDeleteSubscription.unsubscribe();
              this.videoDeleteSubscription = this.materialService
                .deleteVideo(material._id)
                .subscribe((res) => {
                  this.adminVideos.some((e, index) => {
                    if (e._id == material._id) {
                      if (this.selectedVideoLists.isSelected(material)) {
                        this.selectedVideoLists.deselect(material);
                      }
                      this.adminVideos.splice(index, 1);
                      return true;
                    }
                  });
                  this.ownVideos.some((e, index) => {
                    if (e._id == material._id) {
                      if (this.selectedVideoLists.isSelected(material)) {
                        this.selectedVideoLists.deselect(material);
                      }
                      this.ownVideos.splice(index, 1);
                      return true;
                    }
                  });
                });
            }
          });
        }
        break;
    }
  }

  editTemplate(material_id: string): void {
    this.dialog.open(MaterialEditTemplateComponent, {
      position: { top: '10vh' },
      width: '100vw',
      maxWidth: '600px',
      height: '550px',
      disableClose: true,
      data: {
        id: material_id
      }
    });
  }
}
