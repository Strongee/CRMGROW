import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MaterialService } from 'src/app/services/material.service';
import { StoreService } from 'src/app/services/store.service';
import { ToastrService } from 'ngx-toastr';
import { UserService } from 'src/app/services/user.service';
import { TeamService } from '../../services/team.service';
import { Garbage } from 'src/app/models/garbage.model';
import { environment } from 'src/environments/environment';
import { BulkActions } from 'src/app/constants/variable.constants';
import { MaterialEditTemplateComponent } from 'src/app/components/material-edit-template/material-edit-template.component';
import { RecordSettingDialogComponent } from '../../components/record-setting-dialog/record-setting-dialog.component';
import { Subscription } from 'rxjs';
import { ConfirmComponent } from 'src/app/components/confirm/confirm.component';
import { VideoEditComponent } from 'src/app/components/video-edit/video-edit.component';
import { PdfEditComponent } from 'src/app/components/pdf-edit/pdf-edit.component';
import { ImageEditComponent } from 'src/app/components/image-edit/image-edit.component';
import { STATUS } from 'src/app/constants/variable.constants';
import { MaterialSendComponent } from 'src/app/components/material-send/material-send.component';
import { Material } from 'src/app/models/material.model';
import { Clipboard } from '@angular/cdk/clipboard';
import * as _ from 'lodash';
import { FolderComponent } from 'src/app/components/folder/folder.component';
import { MoveFolderComponent } from 'src/app/components/move-folder/move-folder.component';
import { NotifyComponent } from 'src/app/components/notify/notify.component';
import { DeleteFolderComponent } from '../../components/delete-folder/delete-folder.component';
import { HandlerService } from 'src/app/services/handler.service';
import { sortDateArray, sortStringArray } from '../../utils/functions';
import { SocialShareComponent } from 'src/app/components/social-share/social-share.component';
import { isObject } from 'ngx-pipes/src/ng-pipes/pipes/helpers/helpers';
import { TeamMaterialShareComponent } from 'src/app/components/team-material-share/team-material-share.component';
@Component({
  selector: 'app-materials',
  templateUrl: './materials.component.html',
  styleUrls: ['./materials.component.scss']
})
export class MaterialsComponent implements OnInit {
  DISPLAY_COLUMNS = [
    'select',
    'material_name',
    'creator',
    'share',
    'type',
    'created_at',
    'analytics',
    'sub_actions',
    'lead_capture',
    'actions'
  ];
  SORT_TYPES = [
    { id: '', label: 'All types' },
    { id: 'folder', label: 'Folder' },
    { id: 'video', label: 'Video' },
    { id: 'pdf', label: 'Pdf' },
    { id: 'image', label: 'Image' }
  ];
  PAGE_COUNTS = [
    { id: 8, label: '8' },
    { id: 10, label: '10' },
    { id: 25, label: '25' },
    { id: 50, label: '50' }
  ];
  sortType = this.SORT_TYPES[0];
  ACTIONS = BulkActions.Materials;
  STATUS = STATUS;
  siteUrl = environment.website;
  user_id = '';

  pageSize = this.PAGE_COUNTS[2];
  page = 1;

  materials: any[] = [];
  filteredMaterials: any[] = [];
  selection: any[] = [];
  selecting = false;

  convertLoaderTimer;
  convertingVideos = [];
  videoConvertingLoadSubscription: Subscription;

  captureVideos = [];
  editedVideos;
  capturePdfs = [];
  editedPdfs;
  captureImages = [];
  editedImages;

  profileSubscription: Subscription;
  garbageSubscription: Subscription;
  loadSubscription: Subscription;
  materialDeleteSubscription: Subscription;
  routeChangeSubscription: Subscription;

  // Folders
  folders: Material[] = [];
  foldersKeyValue = {};

  // Search Option
  selectedFolder: Material;
  searchStr = '';
  matType = '';
  teamOptions = [];
  userOptions = [];
  folderOptions = [];
  isAdmin = false;
  selectedSort = 'owner';

  searchCondition = {
    title: false,
    owner: false,
    material_type: false,
    created_at: false,
    views: false
  };

  constructor(
    private dialog: MatDialog,
    public storeService: StoreService,
    private handlerService: HandlerService,
    public materialService: MaterialService,
    private userService: UserService,
    public teamService: TeamService,
    private toast: ToastrService,
    private router: Router,
    private clipboard: Clipboard,
    private route: ActivatedRoute
  ) {
    this.profileSubscription = this.userService.profile$.subscribe(
      (profile) => {
        this.user_id = profile._id;
      }
    );
    this.garbageSubscription = this.userService.garbage$.subscribe((res) => {
      const garbage = new Garbage().deserialize(res);
      this.captureVideos = garbage['capture_videos'] || [];
      this.editedVideos = garbage['edited_video'] || [];
      this.capturePdfs = garbage['capture_pdfs'] || [];
      this.editedPdfs = garbage['edited_pdf'] || [];
      this.captureImages = garbage['capture_images'] || [];
      this.editedImages = garbage['edited_image'] || [];
    });

    this.routeChangeSubscription = this.route.params.subscribe((params) => {
      const folder_id = params['folder'];

      this.loadSubscription && this.loadSubscription.unsubscribe();
      this.loadSubscription = this.storeService.materials$.subscribe(
        (materials) => {
          materials.sort((a, b) => (a.folder ? -1 : 1));
          this.materials = materials;
          this.materials = _.uniqBy(this.materials, '_id');
          const folders = materials.filter((e) => {
            return e.material_type === 'folder';
          });
          this.folders = folders;
          this.folders.forEach((folder) => {
            this.foldersKeyValue[folder._id] = { ...folder };
          });
          const materialFolderMatch = {};
          folders.forEach((folder) => {
            folder.shared_materials.forEach((e) => {
              materialFolderMatch[e] = folder._id;
            });
          });
          materials.forEach((e) => {
            if (materialFolderMatch[e._id]) {
              e.folder = materialFolderMatch[e._id];
            }
          });
          if (folder_id && folder_id !== 'root') {
            this.openFolder(this.foldersKeyValue[folder_id]);
          } else {
            this.selectedFolder = null;
            this.filter();
          }
          if (this.filteredMaterials.length) {
            for (const material of this.filteredMaterials) {
              if (material.user) {
                if (material.user._id) {
                  if (material.user._id === this.user_id) {
                    material.owner = 'Me';
                  } else {
                    material.owner = material.user.user_name;
                  }
                } else {
                  if (material.user === this.user_id) {
                    material.owner = 'Me';
                  } else {
                    material.owner = 'Unknown';
                  }
                }
              } else {
                material.owner = 'Admin';
              }
            }
            this.sort('owner', true);
          }
        }
      );
    });
  }

  ngOnInit(): void {
    if (
      !this.handlerService.previousUrl ||
      this.handlerService.previousUrl.indexOf('/materials') === -1 ||
      this.handlerService.previousUrl.indexOf('/materials/create') !== -1 ||
      this.handlerService.previousUrl.indexOf('/materials/analytics') !== -1
    ) {
      this.materialService.loadMaterial(true);
      this.teamService.loadAll(true);
    }
    this.convertLoaderTimer = setInterval(() => {
      if (this.convertingVideos.length) {
        this.loadConvertingStatus();
      }
    }, 5000);
  }

  ngOnDestroy(): void {
    this.profileSubscription && this.profileSubscription.unsubscribe();
    this.garbageSubscription && this.garbageSubscription.unsubscribe();
    this.loadSubscription && this.loadSubscription.unsubscribe();
    clearInterval(this.convertLoaderTimer);
  }

  isAllSelected(): boolean {
    return (
      this.filteredMaterials.length &&
      this.selection.length === this.filteredMaterials.length
    );
  }

  isSelected(element: Material): boolean {
    const pos = this.selection.indexOf(element._id);
    if (pos !== -1) {
      return true;
    } else {
      return false;
    }
  }

  masterToggle(): void {
    this.selecting = true;
    if (this.isAllSelected()) {
      this.selection = [];
    } else {
      this.selection = [];
      this.filteredMaterials.forEach((e) => {
        this.selection.push(e._id);
      });
    }
    this.selecting = false;
    this.changeCaptureAction();
  }

  toggleElement(element: Material): void {
    const pos = this.selection.indexOf(element._id);
    if (pos !== -1) {
      this.selection.splice(pos, 1);
    } else {
      this.selection.push(element._id);
    }
    this.changeCaptureAction();
  }

  changeCaptureAction(): void {
    // Check the lead capture Status
    const selectedMaterials = this.filteredMaterials
      .filter((e) => {
        if (
          e.material_type !== 'folder' &&
          this.selection.indexOf(e._id) !== -1
        ) {
          return true;
        }
        return false;
      })
      .map((e) => e._id);
    // Check the lead Capture Status
    const _intersection = _.intersection(selectedMaterials, [
      ...this.captureVideos,
      ...this.capturePdfs,
      ...this.captureImages
    ]);
    const bulkSetCapture = this.ACTIONS.filter(
      (action) => action.label == 'Capture'
    );
    if (_intersection.length === selectedMaterials.length) {
      // Enable the Lead Capture Status
      bulkSetCapture[0].status = true;
    } else {
      // Disable the Lead Capture Status
      bulkSetCapture[0].status = false;
    }
  }

  clearSearchStr(): void {
    this.searchStr = '';
    this.filter();
    // if (!this.selectedFolder) {
    //   this.filteredMaterials = this.materials.filter((e) => {
    //     return !e.folder || e.type === 'folder';
    //   });
    // } else {
    //   this.filteredMaterials = this.materials.filter((e) => {
    //     return e.folder === this.selectedFolder._id;
    //   });
    // }
  }

  createMaterial(type): void {
    if (this.selectedFolder) {
      this.router.navigate([
        `./materials/create/${type}/${this.selectedFolder._id}`
      ]);
    } else {
      this.router.navigate([`./materials/create/${type}`]);
    }
  }

  sendMaterial(material: Material, type: string = 'email'): void {
    this.dialog.open(MaterialSendComponent, {
      position: { top: '5vh' },
      width: '100vw',
      maxWidth: '600px',
      disableClose: true,
      data: {
        material: [material],
        type: type
      }
    });
  }

  copyLink(material: Material): void {
    let url;
    if (material.material_type == 'video') {
      url =
        environment.website +
        '/video?video=' +
        material._id +
        '&user=' +
        this.user_id;
    } else if (material.material_type == 'pdf') {
      url =
        environment.website +
        '/pdf?pdf=' +
        material._id +
        '&user=' +
        this.user_id;
    } else if (material.material_type == 'image') {
      url =
        environment.website +
        '/image?image=' +
        material._id +
        '&user=' +
        this.user_id;
    }
    this.clipboard.copy(url);
    this.toast.success('Copied the link to clipboard');
  }

  editMaterial(material: Material): void {
    if (material.material_type === 'video') {
      this.editVideo(material);
    } else if (material.material_type === 'pdf') {
      this.editPdf(material);
    } else if (material.material_type === 'image') {
      this.editImage(material);
    }
  }

  setCapture(material: Material): void {
    const updateData = {};
    let pos;
    switch (material.material_type) {
      case 'video':
        pos = this.captureVideos.indexOf(material._id);
        const capturedVideos = [...this.captureVideos];
        if (pos !== -1) {
          capturedVideos.splice(pos, 1);
        } else {
          capturedVideos.push(material._id);
        }
        updateData['capture_videos'] = capturedVideos;
        break;
      case 'pdf':
        pos = this.capturePdfs.indexOf(material._id);
        const capturedPdfs = [...this.capturePdfs];
        if (pos !== -1) {
          capturedPdfs.splice(pos, 1);
        } else {
          capturedPdfs.push(material._id);
        }
        updateData['capture_pdfs'] = capturedPdfs;
        break;
      case 'image':
        pos = this.captureImages.indexOf(material._id);
        const capturedImages = [...this.captureImages];
        if (pos !== -1) {
          capturedImages.splice(pos, 1);
        } else {
          capturedImages.push(material._id);
        }
        updateData['capture_images'] = capturedImages;
        break;
    }
    this.userService.updateGarbage(updateData).subscribe((status) => {
      if (status) {
        this.userService.updateGarbageImpl(updateData);
        this.changeCaptureAction();
      }
    });
  }

  isCaptured(material: Material): boolean {
    if (material.material_type === 'video') {
      if (this.captureVideos.indexOf(material._id) !== -1) {
        return true;
      }
      return false;
    } else if (material.material_type === 'pdf') {
      if (this.capturePdfs.indexOf(material._id) !== -1) {
        return true;
      }
      return false;
    } else if (material.material_type === 'image') {
      if (this.captureImages.indexOf(material._id) !== -1) {
        return true;
      }
      return false;
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
          material: {
            _id: video._id,
            title: video.title,
            description: video.description,
            thumbnail: video.thumbnail,
            role: video.role
          },
          type: 'edit'
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res && res['status']) {
          if (video.role === 'admin') {
            // this.materials.some((e, index) => {
            //   if (e._id === video._id) {
            //     this.materials.splice(index, 1);
            //     return true;
            //   }
            // });
            this.materialService.delete$([video._id]);
            this.editedVideos.push(video._id);
            this.userService
              .updateGarbage({
                edited_video: this.editedVideos
              })
              .subscribe(() => {
                this.userService.updateGarbageImpl({
                  edited_video: this.editedVideos
                });
              });
            const newVideo = {
              ...video,
              _id: res['data']['_id'],
              title: res['data']['title'],
              description: res['data']['description'],
              thumbnail: res['data']['thumbnail'],
              default_edited: true
            };
            this.materialService.create$(newVideo);
          } else {
            video.title = res['data']['title'];
            video.description = res['data']['description'];
            video.thumbnail = res['data']['thumbnail'];
            this.materialService.update$(video._id, res['data']);
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
          material: {
            _id: pdf._id,
            title: pdf.title,
            description: pdf.description,
            preview: pdf.preview,
            role: pdf.role
          },
          type: 'edit'
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res && res['status']) {
          if (pdf.role === 'admin') {
            // this.materials.some((e, index) => {
            //   if (e._id === pdf._id) {
            //     this.materials.splice(index, 1);
            //     return true;
            //   }
            // });
            this.materialService.delete$([pdf._id]);
            this.editedPdfs.push(pdf._id);
            this.userService
              .updateGarbage({
                edited_pdf: this.editedPdfs
              })
              .subscribe(() => {
                this.userService.updateGarbageImpl({
                  edited_pdf: this.editedPdfs
                });
              });
            const newPdf = {
              ...pdf,
              _id: res['data']['_id'],
              title: res['data']['title'],
              description: res['data']['description'],
              thumbnail: res['data']['preview'],
              default_edited: true
            };
            // this.materials.push(newPdf);
            this.materialService.create$(newPdf);
          } else {
            pdf.title = res['data']['title'];
            pdf.description = res['data']['description'];
            pdf.preview = res['data']['preview'];
            this.materialService.update$(pdf._id, res['data']);
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
          material: {
            _id: image._id,
            title: image.title,
            description: image.description,
            preview: image.preview
          },
          type: 'edit'
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res && res['status']) {
          if (image.role === 'admin') {
            // this.materials.some((e, index) => {
            //   if (e._id === image._id) {
            //     this.materials.splice(index, 1);
            //     return true;
            //   }
            // });
            this.materialService.delete$([image._id]);
            this.editedImages.push(image._id);
            this.userService
              .updateGarbage({
                edited_image: this.editedImages
              })
              .subscribe(() => {
                this.userService.updateGarbageImpl({
                  edited_image: this.editedImages
                });
              });
            const newImage = {
              ...image,
              _id: res['data']['_id'],
              title: res['data']['title'],
              description: res['data']['description'],
              thumbnail: res['data']['preview'],
              default_edited: true
            };
            // this.materials.push(newImage);
            this.materialService.create$(newImage);
          } else {
            image.title = res['data']['title'];
            image.description = res['data']['description'];
            image.preview = res['data']['preview'];
            this.materialService.update$(image._id, res['data']);
          }
        }
      });
  }

  duplicateMaterial(material: any): void {
    switch (material.material_type) {
      case 'video':
        this.dialog
          .open(VideoEditComponent, {
            position: { top: '5vh' },
            width: '100vw',
            maxWidth: '500px',
            disableClose: true,
            data: {
              material: {
                _id: material._id,
                url: material.url,
                title: material.title,
                duration: material.duration,
                description: material.description,
                thumbnail: material.thumbnail,
                role: material.role
              },
              type: 'duplicate'
            }
          })
          .afterClosed()
          .subscribe((res) => {
            if (res) {
              const newVideo = {
                ...material,
                _id: res._id,
                title: res.title,
                description: res.description,
                thumbnail: res.thumbnail,
                role: 'user',
                default_edited: true
              };
              // this.materials.push(newVideo);
              this.materialService.create$(newVideo);
            }
          });
        break;
      case 'pdf':
        this.dialog
          .open(PdfEditComponent, {
            position: { top: '5vh' },
            width: '100vw',
            maxWidth: '500px',
            disableClose: true,
            data: {
              material: {
                _id: material._id,
                url: material.url,
                title: material.title,
                description: material.description,
                preview: material.preview,
                role: material.role
              },
              type: 'duplicate'
            }
          })
          .afterClosed()
          .subscribe((res) => {
            if (res) {
              const newPdf = {
                ...material,
                _id: res._id,
                title: res.title,
                description: res.description,
                preview: res.preview,
                role: 'user',
                default_edited: true
              };
              // this.materials.push(newPdf);
              this.materialService.create$(newPdf);
            }
          });
        break;
      case 'image':
        this.dialog
          .open(ImageEditComponent, {
            position: { top: '5vh' },
            width: '100vw',
            maxWidth: '500px',
            disableClose: true,
            data: {
              material: {
                _id: material._id,
                title: material.title,
                description: material.description,
                preview: material.preview,
                role: material.role,
                url: material.url
              },
              type: 'duplicate'
            }
          })
          .afterClosed()
          .subscribe((res) => {
            if (res) {
              const newImage = {
                ...material,
                _id: res._id,
                title: res.title,
                description: res.description,
                preview: res.preview,
                role: 'user',
                default_edited: true
              };
              // this.materials.push(newImage);
              this.materialService.create$(newImage);
            }
          });
        break;
    }
  }

  shareMaterial(material: any): void {
    const url = `${this.siteUrl}/${material.material_type}?${material.material_type}=${material._id}&user=${this.user_id}`;
    this.dialog.open(SocialShareComponent, {
      position: { top: '100px' },
      width: '100vw',
      maxWidth: '600px',
      data: {
        url: url
      }
    });
  }

  shareTeam(material: any): void {
    this.dialog.open(TeamMaterialShareComponent, {
      width: '98vw',
      maxWidth: '450px',
      data: {
        material: material
      }
    });
  }

  deleteMaterial(material: any): void {
    switch (material.material_type) {
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
                    this.userService.updateGarbageImpl({
                      edited_video: this.editedVideos
                    });
                    if (this.isSelected(material)) {
                      this.toggleElement(material);
                    }
                    this.materialService.delete$([material._id]);
                    this.toast.success('Video has been deleted successfully.');
                  });
              }
            }
          });
        } else {
          videoConfirmDialog.afterClosed().subscribe((res) => {
            if (res) {
              this.materialDeleteSubscription &&
                this.materialDeleteSubscription.unsubscribe();
              this.materialDeleteSubscription = this.materialService
                .deleteVideo(material._id)
                .subscribe((res) => {
                  if (this.isSelected(material)) {
                    this.toggleElement(material);
                  }
                  this.materialService.delete$([material._id]);
                  this.toast.success('Video has been deleted successfully.');
                });
            }
          });
        }
        break;
      case 'image':
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
                    this.userService.updateGarbageImpl({
                      edited_image: this.editedImages
                    });
                    if (this.isSelected(material)) {
                      this.toggleElement(material);
                    }
                    this.materialService.delete$([material._id]);
                    this.toast.success('Image has been deleted successfully.');
                  });
              }
            }
          });
        } else {
          imageConfirmDialog.afterClosed().subscribe((res) => {
            if (res) {
              this.materialDeleteSubscription &&
                this.materialDeleteSubscription.unsubscribe();
              this.materialDeleteSubscription = this.materialService
                .deleteImage(material._id)
                .subscribe((res) => {
                  if (this.isSelected(material)) {
                    this.toggleElement(material);
                  }
                  this.materialService.delete$([material._id]);
                  this.toast.success('Image has been deleted successfully.');
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
                    this.userService.updateGarbageImpl({
                      edited_pdf: this.editedPdfs
                    });
                    if (this.isSelected(material)) {
                      this.toggleElement(material);
                    }
                    this.materialService.delete$([material._id]);
                    this.toast.success('Pdf has been deleted successfully.');
                  });
              }
            }
          });
        } else {
          pdfConfirmDialog.afterClosed().subscribe((res) => {
            if (res) {
              this.materialDeleteSubscription &&
                this.materialDeleteSubscription.unsubscribe();
              this.materialDeleteSubscription = this.materialService
                .deletePdf(material._id)
                .subscribe((res) => {
                  if (this.isSelected(material)) {
                    this.toggleElement(material);
                  }
                  this.materialService.delete$([material._id]);
                  this.toast.success('Pdf has been deleted successfully.');
                });
            }
          });
        }
        break;
    }
  }

  editTemplate(material: Material): void {
    this.dialog.open(MaterialEditTemplateComponent, {
      position: { top: '10vh' },
      width: '100vw',
      maxWidth: '600px',
      height: '550px',
      disableClose: true,
      data: {
        id: material._id,
        type: material.material_type
      }
    });
  }

  recordSetting(): void {
    if (this.dialog.openDialogs.length > 0) {
      return;
    }
    this.dialog
      .open(RecordSettingDialogComponent, {
        position: { top: '0px' },
        width: '100%',
        height: '100%',
        panelClass: 'trans-modal',
        backdropClass: 'trans'
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.materials.push(res.data);
        }
      });
  }

  doAction(evt: any): void {
    const selectedMaterials = this.filteredMaterials.filter((e) => {
      if (
        e.material_type !== 'folder' &&
        this.selection.indexOf(e._id) !== -1
      ) {
        return true;
      }
      return false;
    });
    switch (evt.command) {
      case 'email':
        this.dialog.open(MaterialSendComponent, {
          position: { top: '5vh' },
          width: '96vw',
          maxWidth: '600px',
          disableClose: true,
          data: {
            material: selectedMaterials,
            type: 'email'
          }
        });
        break;
      case 'text':
        this.dialog.open(MaterialSendComponent, {
          position: { top: '5vh' },
          width: '96vw',
          maxWidth: '600px',
          disableClose: true,
          data: {
            material: selectedMaterials,
            type: 'text'
          }
        });
        break;
      case 'deselect':
        this.selection = [];
        break;
      case 'lead_capture':
        const bulkSetCapture = this.ACTIONS.filter(
          (action) => action.label == 'Lead Capture'
        );
        if (bulkSetCapture[0].status) {
          _.pullAll(this.captureVideos, this.selection);
          _.pullAll(this.capturePdfs, this.selection);
          _.pullAll(this.captureImages, this.selection);
        } else {
          const selectedVideos = [];
          const selectedPdfs = [];
          const selectedImages = [];
          selectedMaterials.forEach((e) => {
            if (e.material_type === 'video') {
              selectedVideos.push(e._id);
            } else if (e.material_type === 'pdf') {
              selectedPdfs.push(e._id);
            } else if (e.material_type === 'image') {
              selectedImages.push(e._id);
            }
          });
          this.captureVideos = _.union(this.captureVideos, selectedVideos);
          this.captureImages = _.union(this.captureImages, selectedImages);
          this.capturePdfs = _.union(this.capturePdfs, selectedPdfs);
        }
        this.userService
          .updateGarbage({
            capture_videos: this.captureVideos,
            capture_images: this.captureImages,
            capture_pdfs: this.capturePdfs
          })
          .subscribe((status) => {
            if (status) {
              this.userService.updateGarbageImpl({
                capture_videos: this.captureVideos,
                capture_images: this.captureImages,
                capture_pdfs: this.capturePdfs
              });
            }
          });
        this.changeCaptureAction();
        break;
      case 'folder':
        this.moveToFolder();
        break;
      case 'delete':
        if (!this.selection.length) {
          return;
        } else {
          const confirmDialog = this.dialog.open(ConfirmComponent, {
            position: { top: '100px' },
            data: {
              title: 'Delete Materials',
              message: 'Are you sure to delete these materials?',
              confirmLabel: 'Delete',
              cancelLabel: 'Cancel'
            }
          });
          confirmDialog.afterClosed().subscribe((res) => {
            if (res) {
              const selectedAdminVideos = [];
              const selectedAdminPdfs = [];
              const selectedAdminImages = [];
              const selectedVideos = [];
              const selectedPdfs = [];
              const selectedImages = [];
              selectedMaterials.forEach((e) => {
                if (e.material_type === 'video') {
                  if (e.role === 'admin') {
                    selectedAdminVideos.push(e._id);
                  } else {
                    selectedVideos.push(e._id);
                  }
                } else if (e.material_type === 'pdf') {
                  if (e.role === 'admin') {
                    selectedAdminPdfs.push(e._id);
                  } else {
                    selectedPdfs.push(e._id);
                  }
                } else if (e.material_type === 'image') {
                  if (e.role === 'admin') {
                    selectedAdminImages.push(e._id);
                  } else {
                    selectedImages.push(e._id);
                  }
                }
              });
              if (
                selectedAdminVideos.length ||
                selectedAdminPdfs.length ||
                selectedAdminImages.length
              ) {
                const updateData = {};
                if (selectedAdminVideos.length) {
                  const editedVideos = _.union(
                    this.editedVideos,
                    selectedAdminVideos
                  );
                  updateData['edited_video'] = editedVideos;
                }
                if (selectedAdminPdfs.length) {
                  const editedPdfs = _.union(
                    this.editedPdfs,
                    selectedAdminPdfs
                  );
                  updateData['edited_pdf'] = editedPdfs;
                }
                if (selectedAdminImages.length) {
                  const editedImages = _.union(
                    this.editedImages,
                    selectedAdminImages
                  );
                  updateData['edited_image'] = editedImages;
                }

                // Call the Garbage Update
                this.userService
                  .updateGarbage(updateData)
                  .subscribe((status) => {
                    if (status) {
                      this.userService.updateGarbageImpl(updateData);
                    }
                  });
              }

              if (
                selectedVideos.length ||
                selectedImages.length ||
                selectedPdfs.length
              ) {
                const removeData = {
                  videos: selectedVideos,
                  pdfs: selectedPdfs,
                  images: selectedImages
                };
                this.materialService
                  .bulkRemove(removeData)
                  .subscribe((status) => {
                    if (status) {
                      this.toast.success(
                        'Selected materials have been deleted successfully.'
                      );
                    }
                  });
              }
            }
          });
        }
        break;
    }
  }

  loadConvertingStatus(): void {
    this.videoConvertingLoadSubscription &&
      this.videoConvertingLoadSubscription.unsubscribe();
    this.videoConvertingLoadSubscription = this.materialService
      .loadConvertingStatus(this.convertingVideos)
      .subscribe((res) => {
        this.materials.forEach((e) => {
          if (e.material_type !== 'video') {
            return;
          }
          if (e.converted !== 'completed' && e.converted !== 'disabled') {
            const convertingStatus = res[e._id];
            if (!convertingStatus) {
              return;
            }
            if (convertingStatus.status && convertingStatus.progress == 100) {
              e['converted'] = 'completed';
              const pos = this.convertingVideos.indexOf(e._id);
              if (pos !== -1) {
                this.convertingVideos.splice(pos, 1);
              }
            }
            if (convertingStatus.status && convertingStatus.progress < 100) {
              e['progress'] = convertingStatus.progress;
            }
            if (!convertingStatus.status) {
              e['convertingStatus'] = 'error';
              const pos = this.convertingVideos.indexOf(e._id);
              if (pos !== -1) {
                this.convertingVideos.splice(pos, 1);
              }
            }
          }
        });
      });
  }

  showAnalytics(material): void {}

  showAllCommonVideos(): void {
    this.userService.updateGarbage({ edited_video: [] }).subscribe(() => {
      this.editedVideos = [];
      this.userService.updateGarbageImpl({ edited_video: [] });
      this.materialService.loadVideos(true);
    });
  }

  showAllCommonPdfs(): void {
    this.userService.updateGarbage({ edited_pdf: [] }).subscribe(() => {
      this.editedPdfs = [];
      this.userService.updateGarbageImpl({ edited_pdf: [] });
      this.materialService.loadPdfs(true);
    });
  }

  showAllCommonImages(): void {
    this.userService.updateGarbage({ edited_image: [] }).subscribe(() => {
      this.editedImages = [];
      this.userService.updateGarbageImpl({ edited_image: [] });
      this.materialService.loadImages(true);
    });
  }

  openFolder(element: Material): void {
    this.selectedFolder = element;
    this.searchStr = '';
    this.matType = '';
    this.isAdmin = false;
    this.userOptions = [];
    this.teamOptions = [];
    this.folderOptions = [];
    this.filter();
    // this.filteredMaterials = this.materials.filter((e) => {
    //   if (e.folder === this.selectedFolder._id) {
    //     console.log(e.folder, e.title, e._id);
    //     return true;
    //   }
    // });
  }
  toRoot(): void {
    this.selectedFolder = null;
    this.searchStr = '';
    this.matType = '';
    this.isAdmin = false;
    this.userOptions = [];
    this.teamOptions = [];
    this.folderOptions = [];
    this.filter();
    // this.filteredMaterials = this.materials.filter((e) => {
    //   return !e.folder || e.type === 'folder';
    // });
  }

  createFolder(): void {
    this.dialog.open(FolderComponent, {
      width: '96vw',
      maxWidth: '400px'
    });
  }

  removeFolder(material: Material): void {
    this.dialog.open(DeleteFolderComponent, {
      width: '96vw',
      maxWidth: '500px',
      data: {
        material
      }
    });
    // this.dialog
    //   .open(ConfirmComponent, {
    //     width: '96vw',
    //     maxWidth: '400px',
    //     data: {
    //       title: 'Delete folder',
    //       message:
    //         'This folder will be removed and sub materials will be moved to root directory. Are you sure to delete this folder?',
    //       confirmLabel: 'Delete'
    //       // case: true,
    //       // answers: [
    //       //   {
    //       //     label: 'Remove with sub-materials',
    //       //     value: 'with-materials'
    //       //   },
    //       //   {
    //       //     label: 'Remove only folder',
    //       //     value: 'only-folder'
    //       //   }
    //       // ]
    //     }
    //   })
    //   .afterClosed()
    //   .subscribe((answer) => {
    //     if (answer) {
    //       this.materialService
    //         .removeFolder(material._id, 'only-folder') // answer
    //         .subscribe((res) => {
    //           if (res['status']) {
    //             this.materialService.delete$([material._id]);
    //             this.materialService.removeFolder$(material._id);
    //           }
    //         });
    //     }
    //   });
  }

  editFolder(material: Material): void {
    this.dialog.open(FolderComponent, {
      width: '96vw',
      maxWidth: '400px',
      data: {
        folder: { ...material }
      }
    });
  }

  moveToFolder(material: any = null): void {
    let selectedMaterials = [];
    if (material) {
      selectedMaterials = [material];
    } else {
      selectedMaterials = this.filteredMaterials.filter((e) => {
        if (
          e.material_type !== 'folder' &&
          this.selection.indexOf(e._id) !== -1
        ) {
          return true;
        }
        return false;
      });
    }
    if (!selectedMaterials.length) {
      this.dialog.open(NotifyComponent, {
        width: '96vw',
        maxWidth: '360px',
        data: {
          message: 'You have to select material(s) to move those to the folder.'
        }
      });
      return;
    }
    if (selectedMaterials.length > 0) {
      this.dialog
        .open(MoveFolderComponent, {
          width: '96vw',
          maxWidth: '400px',
          data: {
            materials: selectedMaterials,
            currentFolder: this.selectedFolder
          }
        })
        .afterClosed()
        .subscribe((status) => {
          if (status) {
            this.selection = [];
          }
        });
    }
  }

  toggleAdminOption(): void {
    this.isAdmin = !this.isAdmin;
    this.filter();
  }
  toggleTeamOption(id: string): void {
    this.teamOptions = _.xor(this.teamOptions, [id]);
    this.filter();
  }
  toggleFolderOption(id: string): void {
    this.folderOptions = _.xor(this.folderOptions, [id]);
    this.filter();
  }
  toggleUserOption(id: string): void {
    this.userOptions = _.xor(this.userOptions, [id]);
    this.filter();
  }
  clearAllFilters(): void {
    this.searchStr = '';
    this.matType = '';
    this.isAdmin = false;
    this.userOptions = [];
    this.teamOptions = [];
    this.folderOptions = [];
    this.filter();
  }
  isEnableSearchOptions(): boolean {
    return !!(
      this.searchStr ||
      this.matType ||
      this.isAdmin ||
      this.userOptions.length ||
      this.teamOptions.length ||
      this.folderOptions.length
    );
  }

  changeSort(type: any): void {
    this.matType = type.id;
    this.sortType = type;
    this.filter();
  }

  filter(): void {
    this.selection = [];
    const words = _.uniqBy(
      this.searchStr.split(' ').sort((a, b) => (a.length > b.length ? -1 : 1)),
      (e) => e.toLowerCase()
    );
    const reg = new RegExp(words.join('|'), 'gi');
    this.filteredMaterials = this.materials.filter((material) => {
      if (this.selectedFolder) {
        if (this.selectedFolder._id !== material.folder) {
          return false;
        }
      } else if (!this.isEnableSearchOptions() && material.folder) {
        return false;
      }
      if (this.matType && material.material_type != this.matType) {
        return false;
      }
      if (
        this.searchStr &&
        words.length &&
        _.uniqBy(material.title.match(reg), (e) => e.toLowerCase()).length !==
          words.length
      ) {
        return false;
      }
      if (
        this.folderOptions.length &&
        (!material.folder || this.folderOptions.indexOf(material.folder) === -1)
      ) {
        return false;
      }
      if (
        this.teamOptions.length &&
        (!material.team || this.userOptions.indexOf(material.team._id) === -1)
      ) {
        return false;
      }
      if (this.isAdmin && this.userOptions.length) {
        if (material.role === 'admin') {
          return true;
        }
        const userId =
          material.user && material.user._id
            ? material.user._id
            : material.user;
        if (this.userOptions.indexOf(userId) !== -1) {
          return true;
        }
        return false;
      }
      if (this.isAdmin && material.role != 'admin') {
        return false;
      }
      if (this.userOptions.length) {
        const userId =
          material.user && material.user._id
            ? material.user._id
            : material.user;
        if (this.userOptions.indexOf(userId) === -1) {
          return false;
        }
      }
      return true;
    });
    this.page = 1;
  }

  changePageSize(type: any): void {
    this.pageSize = type;
    this.page = 1;
  }

  download(video): void {
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = video.url;
    a.click();
  }

  sort(field: string, keep: boolean = false): void {
    const folders = this.filteredMaterials.filter((e) => {
      return e.material_type === 'folder';
    });
    const normals = this.filteredMaterials.filter((e) => {
      return e.material_type !== 'folder';
    });
    if (this.selectedSort != field) {
      this.selectedSort = field;
      return;
    } else {
      if (field === 'created_at') {
        const sortBeforeFolders = sortStringArray(
          folders,
          'title',
          this.searchCondition[field]
        );
        const sortBeforeNormals = sortStringArray(
          normals,
          'title',
          this.searchCondition[field]
        );
        const sortedFolders = sortDateArray(
          sortBeforeFolders,
          field,
          this.searchCondition[field]
        );
        const sortedNormals = sortDateArray(
          sortBeforeNormals,
          field,
          this.searchCondition[field]
        );
        this.filteredMaterials = [];
        if (sortedFolders?.length) {
          this.filteredMaterials = [
            ...this.filteredMaterials,
            ...sortedFolders
          ];
        }
        if (sortedNormals?.length) {
          this.filteredMaterials = [
            ...this.filteredMaterials,
            ...sortedNormals
          ];
        }
      } else if (field === 'owner') {
        const admins = normals.filter((item) => item.owner === 'Admin');
        const owns = normals.filter((item) => item.owner === 'Me');
        const users = normals.filter(
          (item) =>
            item.owner !== 'Admin' &&
            item.owner !== 'Me' &&
            item.owner !== 'Unknown'
        );
        const unknowns = normals.filter((item) => item.owner === 'Unknown');
        let sortedFolders,
          sortedAdmins,
          sortedOwns,
          sortedUsers,
          sortedUnknowns;
        if (keep) {
          sortedFolders = sortStringArray(folders, 'title', true);
          sortedAdmins = sortStringArray(admins, 'priority', true);
          sortedOwns = sortStringArray(owns, 'title', true);
          sortedUsers = sortStringArray(users, 'title', true);
          sortedUnknowns = sortStringArray(unknowns, 'title', true);
        } else {
          sortedFolders = sortStringArray(
            folders,
            'title',
            this.searchCondition[field]
          );
          sortedAdmins = sortStringArray(
            admins,
            'priority',
            this.searchCondition[field]
          );
          sortedOwns = sortStringArray(
            owns,
            'title',
            this.searchCondition[field]
          );
          sortedUsers = sortStringArray(
            users,
            'title',
            this.searchCondition[field]
          );
          sortedUnknowns = sortStringArray(
            unknowns,
            'title',
            this.searchCondition[field]
          );
        }
        this.filteredMaterials = [];
        if (keep) {
          this.filteredMaterials = [
            ...sortedFolders,
            ...sortedAdmins,
            ...sortedOwns,
            ...sortedUsers,
            ...sortedUnknowns
          ];
        } else {
          if (this.searchCondition[field]) {
            this.filteredMaterials = [
              ...sortedFolders,
              ...sortedAdmins,
              ...sortedOwns,
              ...sortedUsers,
              ...sortedUnknowns
            ];
          } else {
            this.filteredMaterials = [
              ...sortedFolders,
              ...sortedOwns,
              ...sortedAdmins,
              ...sortedUsers,
              ...sortedUnknowns
            ];
          }
        }
      } else if (field === 'material_type') {
        const videos = this.filteredMaterials.filter(
          (item) => item.material_type === 'video'
        );
        const pdfs = this.filteredMaterials.filter(
          (item) => item.material_type === 'pdf'
        );
        const images = this.filteredMaterials.filter(
          (item) => item.material_type === 'image'
        );
        const sortedFolders = sortStringArray(
          folders,
          'title',
          this.searchCondition[field]
        );
        const sortedVideos = sortStringArray(
          videos,
          'title',
          this.searchCondition[field]
        );
        const sortedPdfs = sortStringArray(
          pdfs,
          'title',
          this.searchCondition[field]
        );
        const sortedImages = sortStringArray(
          images,
          'title',
          this.searchCondition[field]
        );
        this.filteredMaterials = [];
        if (this.searchCondition[field]) {
          this.filteredMaterials = [
            ...sortedFolders,
            ...sortedVideos,
            ...sortedPdfs,
            ...sortedImages
          ];
        } else {
          this.filteredMaterials = [
            ...sortedImages,
            ...sortedPdfs,
            ...sortedVideos,
            ...sortedFolders
          ];
        }
      } else {
        const sortBeforeFolders = sortStringArray(
          folders,
          'title',
          this.searchCondition[field]
        );
        const sortBeforeNormals = sortStringArray(
          normals,
          'title',
          this.searchCondition[field]
        );
        const sortedFolders = sortStringArray(
          sortBeforeFolders,
          field,
          this.searchCondition[field]
        );
        const sortedNormals = sortStringArray(
          sortBeforeNormals,
          field,
          this.searchCondition[field]
        );
        this.filteredMaterials = [];
        if (sortedFolders?.length) {
          this.filteredMaterials = [
            ...this.filteredMaterials,
            ...sortedFolders
          ];
        }
        if (sortedNormals?.length) {
          this.filteredMaterials = [
            ...this.filteredMaterials,
            ...sortedNormals
          ];
        }
      }
      this.page = 1;
      if (!keep) {
        this.searchCondition[field] = !this.searchCondition[field];
      }
    }
  }

  checkType(url: string): boolean {
    if (url.indexOf('youtube.com') == -1 && url.indexOf('vimeo.com') == -1) {
      return true;
    } else {
      return false;
    }
  }
}
