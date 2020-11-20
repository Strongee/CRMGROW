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
import { VideoEditComponent } from 'src/app/components/video-edit/video-edit.component';
import { PdfEditComponent } from 'src/app/components/pdf-edit/pdf-edit.component';
import { ImageEditComponent } from 'src/app/components/image-edit/image-edit.component';

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
          this.selectedVideoLists.clear();
        } else {
          this.ownVideos.forEach((e) => this.selectedVideoLists.select(e._id));
          this.adminVideos.forEach((e) =>
            this.selectedVideoLists.select(e._id)
          );
          this.teamVideos.forEach((e) => this.selectedVideoLists.select(e._id));
        }
        break;
      case 'pdf':
        if (this.isSelectedPage(type)) {
          this.selectedPdfLists.clear();
        } else {
          this.ownPdfs.forEach((e) => this.selectedPdfLists.select(e._id));
          this.adminPdfs.forEach((e) => this.selectedPdfLists.select(e._id));
          this.teamPdfs.forEach((e) => this.selectedPdfLists.select(e._id));
        }
        break;
      case 'image':
        if (this.isSelectedPage(type)) {
          this.selectedImageLists.clear();
        } else {
          this.ownImages.forEach((e) => this.selectedImageLists.select(e._id));
          this.adminImages.forEach((e) =>
            this.selectedImageLists.select(e._id)
          );
          this.teamImages.forEach((e) => this.selectedImageLists.select(e._id));
        }
        break;
    }
  }

  isSelectedPage(type: string): any {
    switch (type) {
      case 'video':
        const videoCounts =
          this.adminVideos.length +
          this.ownVideos.length +
          this.teamVideos.length;
        const selectedVideoCounts = this.selectedVideoLists.selected.length;
        return videoCounts == selectedVideoCounts;
      case 'pdf':
        const pdfCounts =
          this.adminPdfs.length + this.ownPdfs.length + this.teamPdfs.length;
        const selectedPdfCounts = this.selectedPdfLists.selected.length;
        return pdfCounts == selectedPdfCounts;
      case 'image':
        const imageCounts =
          this.adminImages.length +
          this.ownImages.length +
          this.teamImages.length;
        const selectedImageCounts = this.selectedImageLists.selected.length;
        return imageCounts == selectedImageCounts;
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

  editVideo(video: any): void {
    this.dialog
      .open(VideoEditComponent, {
        position: { top: '5vh' },
        width: '100vw',
        maxWidth: '500px',
        disableClose: true,
        data: {
          _id: video._id,
          title: video.title,
          description: video.description,
          thumbnail: video.thumbnail,
          role: video.role
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res && res['status']) {
          if (video.role === 'admin') {
            this.adminVideos.some((e, index) => {
              if (e._id == video._id) {
                this.adminVideos.splice(index, 1);
                return true;
              }
            });
            this.editedVideos.push(video._id);
            this.userService
              .updateGarbage({
                edited_video: this.editedVideos
              })
              .subscribe(() => {
                this.userService.updateGarbageImpl(this.garbage);
              });
            const newVideo = {
              ...video,
              _id: res['data']['_id'],
              title: res['data']['title'],
              description: res['data']['description'],
              thumbnail: res['data']['thumbnail']
            };
            this.ownVideos.push(newVideo);
          } else {
            video.title = res['data']['title'];
            video.description = res['data']['description'];
            video.thumbnail = res['data']['thumbnail'];
          }
        }
      });
  }

  editPdf(pdf: any): void {
    this.dialog
      .open(PdfEditComponent, {
        position: { top: '5vh' },
        width: '100vw',
        maxWidth: '500px',
        disableClose: true,
        data: {
          _id: pdf._id,
          title: pdf.title,
          description: pdf.description,
          preview: pdf.preview,
          role: pdf.role
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res && res['status']) {
          if (pdf.role === 'admin') {
            this.adminPdfs.some((e, index) => {
              if (e._id === pdf._id) {
                this.adminPdfs.splice(index, 1);
                return true;
              }
            });
            this.editedPdfs.push(pdf._id);
            this.userService
              .updateGarbage({
                edited_pdf: this.editedPdfs
              })
              .subscribe(() => {
                this.userService.updateGarbageImpl(this.garbage);
              });
            const newPdf = {
              ...pdf,
              _id: res['data']['_id'],
              title: res['data']['title'],
              description: res['data']['description'],
              thumbnail: res['data']['preview']
            };
            this.ownPdfs.push(newPdf);
          } else {
            pdf.title = res['data']['title'];
            pdf.description = res['data']['description'];
            pdf.preview = res['data']['preview'];
          }
        }
      });
  }

  editImage(image: any): void {
    this.dialog
      .open(ImageEditComponent, {
        position: { top: '5vh' },
        width: '100vw',
        maxWidth: '500px',
        disableClose: true,
        data: {
          _id: image._id,
          title: image.title,
          description: image.description,
          preview: image.preview
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res && res['status']) {
          if (image.role === 'admin') {
            this.adminImages.some((e, index) => {
              if (e._id == image._id) {
                this.adminImages.splice(index, 1);
                return true;
              }
            });
            this.editedImages.push(image._id);
            this.userService
              .updateGarbage({
                edited_image: this.editedImages
              })
              .subscribe(() => {
                this.userService.updateGarbageImpl(this.garbage);
              });
            const newImage = {
              ...image,
              _id: res['data']['_id'],
              title: res['data']['title'],
              description: res['data']['description'],
              thumbnail: res['data']['preview']
            };
            this.ownImages.push(newImage);
          } else {
            image.title = res['data']['title'];
            image.description = res['data']['description'];
            image.preview = res['data']['preview'];
          }
        }
      });
  }

  duplicateMaterial(material: any, type: string): void {
    switch (type) {
      case 'video':
        const video = {
          url: material.url,
          title: material.title,
          duration: material.duration,
          thumbnail: material.thumbnail,
          description: material.description
        };
        this.materialService.createVideo(video).subscribe((res) => {
          if (res['data']) {
            const newVideo = {
              ...material,
              _id: res['data']['_id'],
              title: res['data']['title'],
              description: res['data']['description'],
              thumbnail: res['data']['thumbnail'],
              role: 'user'
            };
            this.ownVideos.push(newVideo);
          }
        });
        break;
      case 'pdf':
        const pdf = {
          url: material.url,
          title: material.title,
          description: material.description,
          preview: material.preview
        };
        this.materialService.createPdf(pdf).subscribe((res) => {});
        break;
      case 'image':
        const image = {
          title: material.title,
          description: material.description,
          preview: material.preview
        };
        this.materialService.createImage(image).subscribe((res) => {});
        break;
    }
  }

  deleteMaterial(material: any, type: string): void {
    switch (type) {
      case 'video':
        const videoConfirmDialog = this.dialog.open(ConfirmComponent, {
          position: { top: '100px' },
          data: {
            title: 'Delete Video',
            message: 'Are you sure to delete this video?',
            confirmLabel: 'Delete',
            cancelLabel: 'Cancel'
          }
        });
        if (material.role == 'admin') {
          videoConfirmDialog.afterClosed().subscribe((res) => {
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
          videoConfirmDialog.afterClosed().subscribe((res) => {
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
      case 'pdf':
        const pdfConfirmDialog = this.dialog.open(ConfirmComponent, {
          position: { top: '100px' },
          data: {
            title: 'Delete Pdf',
            message: 'Are you sure to delete this pdf?',
            confirmLabel: 'Delete',
            cancelLabel: 'Cancel'
          }
        });
        if (material.role == 'admin') {
          pdfConfirmDialog.afterClosed().subscribe((res) => {
            if (res) {
              const pos = this.editedPdfs.indexOf(material._id);
              if (pos != -1) {
                return;
              } else {
                this.userService
                  .updateGarbage({
                    edited_pdf: [...this.editedPdfs, material._id]
                  })
                  .subscribe(() => {
                    this.editedPdfs.push(material._id);
                    this.userService.updateGarbageImpl(this.garbage);
                    this.adminPdfs.some((e, index) => {
                      if (e._id == material._id) {
                        this.adminPdfs.splice(index, 1);
                        return true;
                      }
                    });
                  });
              }
            }
          });
        } else {
          pdfConfirmDialog.afterClosed().subscribe((res) => {
            if (res) {
              this.pdfDeleteSubscription &&
                this.pdfDeleteSubscription.unsubscribe();
              this.pdfDeleteSubscription = this.materialService
                .deletePdf(material._id)
                .subscribe((res) => {
                  this.adminPdfs.some((e, index) => {
                    if (e._id == material._id) {
                      if (this.selectedPdfLists.isSelected(material)) {
                        this.selectedPdfLists.deselect(material);
                      }
                      this.adminPdfs.splice(index, 1);
                      return true;
                    }
                  });
                  this.ownPdfs.some((e, index) => {
                    if (e._id == material._id) {
                      if (this.selectedPdfLists.isSelected(material)) {
                        this.selectedPdfLists.deselect(material);
                      }
                      this.ownPdfs.splice(index, 1);
                      return true;
                    }
                  });
                });
            }
          });
        }
        break;
      case 'pdf':
        const imageConfirmDialog = this.dialog.open(ConfirmComponent, {
          position: { top: '100px' },
          data: {
            title: 'Delete Image',
            message: 'Are you sure to delete this Image?',
            confirmLabel: 'Delete',
            cancelLabel: 'Cancel'
          }
        });
        if (material.role == 'admin') {
          imageConfirmDialog.afterClosed().subscribe((res) => {
            if (res) {
              const pos = this.editedImages.indexOf(material._id);
              if (pos != -1) {
                return;
              } else {
                this.userService
                  .updateGarbage({
                    edited_image: [...this.editedImages, material._id]
                  })
                  .subscribe(() => {
                    this.editedImages.push(material._id);
                    this.userService.updateGarbageImpl(this.garbage);
                    this.adminImages.some((e, index) => {
                      if (e._id == material._id) {
                        this.adminImages.splice(index, 1);
                        return true;
                      }
                    });
                  });
              }
            }
          });
        } else {
          imageConfirmDialog.afterClosed().subscribe((res) => {
            if (res) {
              this.imageDeleteSubscription &&
                this.imageDeleteSubscription.unsubscribe();
              this.imageDeleteSubscription = this.materialService
                .deleteImage(material._id)
                .subscribe((res) => {
                  this.adminImages.some((e, index) => {
                    if (e._id == material._id) {
                      if (this.selectedImageLists.isSelected(material)) {
                        this.selectedImageLists.deselect(material);
                      }
                      this.adminImages.splice(index, 1);
                      return true;
                    }
                  });
                  this.ownImages.some((e, index) => {
                    if (e._id == material._id) {
                      if (this.selectedImageLists.isSelected(material)) {
                        this.selectedImageLists.deselect(material);
                      }
                      this.ownImages.splice(index, 1);
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
