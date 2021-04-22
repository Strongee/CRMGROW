import { Component, Input, OnChanges, OnInit } from '@angular/core';
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
import { DeleteFolderComponent } from '../../components/delete-folder/delete-folder.component';
import { HandlerService } from 'src/app/services/handler.service';
import { Team } from '../../models/team.model';
import { MaterialBrowserComponent } from '../../components/material-browser/material-browser.component';
import { sortDateArray, sortStringArray } from '../../utils/functions';
import { searchReg } from 'src/app/helper';
@Component({
  selector: 'app-team-share-material',
  templateUrl: './team-share-material.component.html',
  styleUrls: ['./team-share-material.component.scss']
})
export class TeamShareMaterialComponent implements OnInit, OnChanges {
  @Input('team') team: Team;
  @Input('role') role: string;
  materials: Material[] = [];
  DISPLAY_COLUMNS = [
    'select',
    'material_name',
    'type',
    'created_at',
    'analytics',
    'sub_actions',
    'lead_capture',
    'actions'
  ];
  ACTIONS = BulkActions.TeamMaterials;
  STATUS = STATUS;
  siteUrl = environment.website;
  user_id = '';

  filteredMaterials: any[] = [];
  selection: any[] = [];

  convertLoaderTimer;

  captureVideos = [];
  editedVideos;
  capturePdfs = [];
  editedPdfs;
  captureImages = [];
  editedImages;

  profileSubscription: Subscription;
  garbageSubscription: Subscription;
  loadSubscription: Subscription;

  // Folders
  foldersKeyValue = {};

  // Search Option
  selectedFolder: Material;
  searchStr = '';
  teamOptions = [];
  userOptions = [];
  folderOptions = [];
  isAdmin = false;
  page = 1;
  perPageCount = 8;
  pageMaterials: any = [];
  loading = false;

  selectedSort = 'title';

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
    this.garbageSubscription = this.userService.garbage$.subscribe((res) => {
      const garbage = new Garbage().deserialize(res);
      this.captureVideos = garbage['capture_videos'] || [];
      this.editedVideos = garbage['edited_video'] || [];
      this.capturePdfs = garbage['capture_pdfs'] || [];
      this.editedPdfs = garbage['edited_pdf'] || [];
      this.captureImages = garbage['capture_images'] || [];
      this.editedImages = garbage['edited_image'] || [];
    });
  }

  ngOnInit(): void {
    const profile = this.userService.profile.getValue();
    this.user_id = profile._id;
    this.selectedFolder = null;
    this.loading = true;
    this.loadSubscription && this.loadSubscription.unsubscribe();
    this.teamService.loadSharedMaterials(this.team._id);
    this.storeService.sharedMaterials$.subscribe(
      (res) => {
        this.loading = false;
        this.materials = res;
        this.filteredMaterials = this.materials;
      },
      (error) => {
        this.loading = false;
      }
    );

    this.filter();
  }

  ngOnChanges(changes): void {
    if (changes.materials) {
      this.filter();
    }
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

  isPageSelected(page): boolean {
    if (this.filteredMaterials.length <= 0) {
      return false;
    } else {
      let count = 0;
      count = this.filteredMaterials.length - page * this.perPageCount;
      if (count > this.perPageCount) {
        count = this.perPageCount;
      }
      const start = page * this.perPageCount;
      this.pageMaterials = this.filteredMaterials.slice(start, start + count);
      if (this.pageMaterials.length <= 0 || this.selection.length <= 0) {
        return false;
      }
      for (const material of this.pageMaterials) {
        if (this.selection.indexOf(material._id) >= 0) {
          continue;
        } else {
          return false;
        }
      }
      return true;
    }
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
    if (this.isAllSelected()) {
      this.selection = [];
      this.updateSelectActionStatus(true);
    } else {
      this.filteredMaterials.forEach((e) => {
        if (this.selection.indexOf(e._id) < 0) {
          this.selection.push(e._id);
        }
      });
      this.updateActionsStatus('select', false);
      this.updateSelectActionStatus(false);
    }
    this.changeCaptureAction();
  }

  masterPageToggle(page): void {
    let count = 0;
    count = this.filteredMaterials.length - page * this.perPageCount;
    if (count > this.perPageCount) {
      count = this.perPageCount;
    }
    const start = page * this.perPageCount;
    this.pageMaterials = this.filteredMaterials.slice(start, start + count);
    if (this.isPageSelected(page)) {
      this.pageMaterials.forEach((e) => {
        const index = this.selection.indexOf(e._id);
        if (index >= 0) {
          this.selection.splice(index, 1);
        }
      });
    } else {
      this.pageMaterials.forEach((e) => {
        if (this.selection.indexOf(e._id) < 0) {
          this.selection.push(e._id);
        }
      });
    }
    this.changeCaptureAction();
    if (!this.isAllSelected()) {
      this.updateSelectActionStatus(true);
    } else {
      this.updateSelectActionStatus(false);
    }
  }

  toggleElement(element: Material): void {
    const pos = this.selection.indexOf(element._id);
    if (pos !== -1) {
      this.selection.splice(pos, 1);
    } else {
      this.selection.push(element._id);
    }
    this.changeCaptureAction();
    if (!this.isAllSelected()) {
      this.updateSelectActionStatus(true);
    } else {
      this.updateSelectActionStatus(false);
    }
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
      (action) => action.label === 'Capture'
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
  }

  sendMaterial(material: Material): void {
    this.dialog.open(MaterialSendComponent, {
      position: { top: '5vh' },
      width: '100vw',
      maxWidth: '600px',
      disableClose: true,
      data: {
        material: [material],
        type: 'email'
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

  editTemplate(material: Material): void {
    this.dialog.open(MaterialEditTemplateComponent, {
      position: { top: '10vh' },
      width: '100vw',
      maxWidth: '600px',
      disableClose: true,
      data: {
        id: material._id,
        type: material.material_type
      }
    });
  }

  updateSelectActionStatus(status: boolean): void {
    this.ACTIONS.some((e) => {
      if (e.command === 'select') {
        e.spliter = status;
      }
    });
  }

  updateActionsStatus(command: string, loading: boolean): void {
    this.ACTIONS.some((e) => {
      if (e.command === command) {
        e.loading = loading;
        return true;
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
      case 'select':
        this.masterToggle();
        break;
      case 'deselect':
        this.selection = [];
        this.updateSelectActionStatus(true);
        break;
      case 'lead_capture':
        const bulkSetCapture = this.ACTIONS.filter(
          (action) => action.label === 'Capture'
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
                    }
                  });
              }
            }
          });
        }
        break;
    }
  }

  openFolder(element: Material): void {
    this.selectedFolder = element;
    this.searchStr = '';
    this.isAdmin = false;
    this.userOptions = [];
    this.teamOptions = [];
    this.folderOptions = [];
    this.filter();
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

  isEnableSearchOptions(): boolean {
    return !!(
      this.searchStr ||
      this.isAdmin ||
      this.userOptions.length ||
      this.teamOptions.length ||
      this.folderOptions.length
    );
  }

  filter(): void {
    // this.selection = [];
    this.filteredMaterials = this.materials.filter((material) => {
      if (!searchReg(material.title, this.searchStr)) {
        return false;
      }
      return true;
    });
    this.page = 1;
  }

  isStopSharable(material): any {
    if (material && material.user) {
      if (
        material.user === this.user_id ||
        material.user._id === this.user_id
      ) {
        return true;
      }
    }
    return false;
    // if (this.role === 'owner') {
    //   return true;
    // } else if (this.role === 'editor') {
    //   if (material.user) {
    //     if (material.user._id) {
    //       if (material.user._id === this.user_id) {
    //         return true;
    //       }
    //     } else {
    //       if (material.user === this.user_id) {
    //         return true;
    //       }
    //     }
    //   }
    //   return false;
    // }
    // return false;
  }

  getMaterialType(material: any): string {
    if (material.type) {
      if (material.type === 'application/pdf') {
        return 'pdf';
      } else if (material.type.includes('image')) {
        return 'image';
      }
    }
    return 'video';
  }

  stopShareMaterial(material): any {
    if (material.material_type === 'video') {
      this.removeTeamVideo(material);
    } else if (material.material_type === 'pdf') {
      this.removeTeamPdf(material);
    } else if (material.material_type === 'image') {
      this.removeTeamImage(material);
    }
  }

  removeTeamVideo(material): void {
    this.dialog
      .open(ConfirmComponent, {
        data: {
          title: 'Stop Sharing',
          message: 'Are you sure to remove this video?',
          cancelLabel: 'No',
          confirmLabel: 'Remove'
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.teamService.removeVideo(material._id).subscribe(
            (res) => {
              const index = this.materials.findIndex(
                (item) => item._id === material._id
              );
              if (index >= 0) {
                this.materials.splice(index, 1);
              }
              const filterIndex = this.filteredMaterials.findIndex(
                (item) => item._id === material._id
              );
              if (filterIndex >= 0) {
                this.filteredMaterials.splice(filterIndex, 1);
              }
              this.toast.success('You removed the video successfully.');
            },
            (err) => {}
          );
        }
      });
  }
  removeTeamPdf(material): void {
    this.dialog
      .open(ConfirmComponent, {
        data: {
          title: 'Stop Sharing',
          message: 'Are you sure to remove this pdf?',
          cancelLabel: 'No',
          confirmLabel: 'Remove'
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.teamService.removePdf(material._id).subscribe(
            (res) => {
              const index = this.materials.findIndex(
                (item) => item._id === material._id
              );
              if (index >= 0) {
                this.materials.splice(index, 1);
              }
              const filterIndex = this.filteredMaterials.findIndex(
                (item) => item._id === material._id
              );
              if (filterIndex >= 0) {
                this.filteredMaterials.splice(filterIndex, 1);
              }
              this.toast.success('You removed the pdf successfully.');
            },
            (err) => {}
          );
        }
      });
  }
  removeTeamImage(material): void {
    this.dialog
      .open(ConfirmComponent, {
        data: {
          title: 'Stop Sharing',
          message: 'Are you sure to remove this image?',
          cancelLabel: 'No',
          confirmLabel: 'Remove'
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.teamService.removeImage(material._id).subscribe(
            (res) => {
              const index = this.materials.findIndex(
                (item) => item._id === material._id
              );
              if (index >= 0) {
                this.materials.splice(index, 1);
              }
              const filterIndex = this.filteredMaterials.findIndex(
                (item) => item._id === material._id
              );
              if (filterIndex >= 0) {
                this.filteredMaterials.splice(filterIndex, 1);
              }
              this.toast.success('You removed the image successfully.');
            },
            (err) => {}
          );
        }
      });
  }

  shareMaterial(): void {
    this.dialog
      .open(MaterialBrowserComponent, {
        width: '96vw',
        maxWidth: '940px',
        disableClose: true,
        data: {
          title: 'Share material',
          buttonLabel: 'Share',
          multiple: true,
          onlyMine: true,
          hideMaterials: this.materials,
          resultMatType: 'with-folder'
        }
      })
      .afterClosed()
      .subscribe((res) => {
        if (res && res.materials && res.materials.length) {
          const videoIds = [];
          const pdfIds = [];
          const imageIds = [];
          const folderIds = [];
          for (const material of res.materials) {
            if (material.material_type === 'video') {
              videoIds.push(material._id);
            } else if (material.material_type === 'pdf') {
              pdfIds.push(material._id);
            } else if (material.material_type === 'image') {
              imageIds.push(material._id);
            } else {
              folderIds.push(material._id);
            }
          }

          this.teamService
            .shareMaterials(this.team._id, {
              videos: videoIds,
              images: imageIds,
              pdfs: pdfIds,
              folders: folderIds
            })
            .subscribe((_materials) => {
              // Insert show
            });

          return;

          if (videoIds.length > 0) {
            this.teamService
              .shareVideos(this.team._id, videoIds)
              .subscribe((materials) => {
                if (materials && materials.length > 0) {
                  for (const material of materials) {
                    material.material_type = 'video';
                  }
                  this.materials = [...this.materials, ...materials];
                  this.filter();
                }
              });
          }

          if (pdfIds.length > 0) {
            this.teamService
              .sharePdfs(this.team._id, pdfIds)
              .subscribe((materials) => {
                if (materials && materials.length > 0) {
                  this.materials = [...this.materials, ...materials];
                  this.filter();
                }
              });
          }

          if (imageIds.length > 0) {
            this.teamService
              .shareImages(this.team._id, imageIds)
              .subscribe((material) => {
                if (material && material.length > 0) {
                  this.materials = [...this.materials, ...material];
                  this.filter();
                }
              });
          }
          this.toast.success('Selected materials has been shared successfully');
        }
      });
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
}
