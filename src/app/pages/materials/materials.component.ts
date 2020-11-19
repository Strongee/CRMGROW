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
  videos = [];
  pdfs = [];
  images = [];
  selectedVideoLists = new SelectionModel<any>(true, []);
  selectedPdfLists = new SelectionModel<any>(true, []);
  selectedImageLists = new SelectionModel<any>(true, []);
  captureVideos = [];
  capturePdfs = [];
  captureImages = [];

  constructor(
    private dialog: MatDialog,
    public storeService: StoreService,
    public materialService: MaterialService,
    private userService: UserService,
    private toast: ToastrService,
    private router: Router
  ) {
    this.userService.profile$.subscribe((profile) => {
      this.user = profile;
      this.user_id = this.user._id;
    });
    this.storeService.videos$.subscribe((videos) => {
      this.videos = videos;
    });
    this.storeService.pdfs$.subscribe((pdfs) => {
      this.pdfs = pdfs;
    });
    this.storeService.images$.subscribe((images) => {
      this.images = images;
    });
    this.userService.garbage$.subscribe((res) => {
      this.garbage = new Garbage().deserialize(res);
      this.captureVideos = this.garbage['capture_videos'] || [];
      this.capturePdfs = this.garbage['capture_pdfs'] || [];
      this.captureImages = this.garbage['capture_images'] || [];
    });
  }

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
          this.userService.updateGarbage(this.garbage).subscribe(() => {
            this.userService.updateGarbageImpl(this.garbage);
          });
        } else {
          const pos = this.captureVideos.indexOf(material_id);
          this.captureVideos.splice(pos, 1);
          this.garbage.capture_videos = [];
          this.garbage.capture_videos = this.captureVideos;
          this.userService.updateGarbage(this.garbage).subscribe(() => {
            this.userService.updateGarbageImpl(this.garbage);
          });
        }
        break;
      case 'pdf':
        if (this.capturePdfs.indexOf(material_id) === -1) {
          this.capturePdfs.push(material_id);
          this.garbage.capture_pdfs = this.capturePdfs;
          this.userService.updateGarbage(this.garbage).subscribe(() => {
            this.userService.updateGarbageImpl(this.garbage);
          });
        } else {
          const pos = this.capturePdfs.indexOf(material_id);
          this.capturePdfs.splice(pos, 1);
          this.garbage.capture_pdfs = [];
          this.garbage.capture_pdfs = this.capturePdfs;
          this.userService.updateGarbage(this.garbage).subscribe(() => {
            this.userService.updateGarbageImpl(this.garbage);
          });
        }
        break;
      case 'image':
        if (this.captureImages.indexOf(material_id) === -1) {
          this.captureImages.push(material_id);
          this.garbage.capture_images = this.captureImages;
          this.userService.updateGarbage(this.garbage).subscribe(() => {
            this.userService.updateGarbageImpl(this.garbage);
          });
        } else {
          const pos = this.captureImages.indexOf(material_id);
          this.captureImages.splice(pos, 1);
          this.garbage.capture_images = [];
          this.garbage.capture_images = this.captureImages;
          this.userService.updateGarbage(this.garbage).subscribe(() => {
            this.userService.updateGarbageImpl(this.garbage);
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
      height: '650px',
      disableClose: true,
      data: {
        id: material_id
      }
    });
  }
}
