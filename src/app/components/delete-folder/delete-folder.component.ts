import { Component, Inject, OnInit } from '@angular/core';
import { Material } from '../../models/material.model';
import { Subscription } from 'rxjs';
import { StoreService } from '../../services/store.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialService } from '../../services/material.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-delete-folder',
  templateUrl: './delete-folder.component.html',
  styleUrls: ['./delete-folder.component.scss']
})
export class DeleteFolderComponent implements OnInit {
  currentOption = 'remove-all';
  selectedFolder: Material = new Material();
  rootFolder: Material = new Material().deserialize({ _id: 'root' });
  folders: Material[] = [];
  folderLoadSubscription: Subscription;
  currentFolder;
  submitted = false;

  constructor(
    private storeService: StoreService,
    private materialService: MaterialService,
    private dialogRef: MatDialogRef<DeleteFolderComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (this.data && this.data.material) {
      this.currentFolder = this.data.material;
    }
  }

  ngOnInit(): void {
    this.folderLoadSubscription = this.storeService.materials$.subscribe(
      (materials) => {
        this.folders = materials.filter((e) => {
          return e.material_type === 'folder';
        });
        if (this.currentFolder) {
          const index = this.folders.findIndex(
            (item) => item._id === this.currentFolder._id
          );
          if (index >= 0) {
            this.folders.splice(index, 1);
          }
        }
      }
    );
  }

  selectOption(type): void {
    this.currentOption = type;
  }

  isSelectedOption(type): any {
    return this.currentOption === type;
  }

  delete(): void {
    this.submitted = true;
    if (this.currentOption === 'move-other') {
      if (!this.selectedFolder._id) {
        return;
      }
    }
    const data = {
      _id: this.currentFolder._id,
      mode: this.currentOption,
      target:
        this.selectedFolder && this.selectedFolder._id
          ? this.selectedFolder._id
          : null
    };
    if (data.target === 'root') {
      data.target = '';
    }
    this.materialService
      .removeFolder(data) // answer
      .subscribe((res) => {
        if (res['status']) {
          if (this.currentOption === 'move-other' && data.target) {
            const _targetVideos = this.selectedFolder.videos;
            const _targetImages = this.selectedFolder.images;
            const _targetPdfs = this.selectedFolder.pdfs;
            const _newVideos = _.union(
              _targetVideos,
              this.currentFolder.videos
            );
            const _newImages = _.union(
              _targetImages,
              this.currentFolder.images
            );
            const _newpdfs = _.union(_targetPdfs, this.currentFolder.pdfs);
            this.materialService.update$(this.selectedFolder._id, {
              videos: _newVideos,
              images: _newImages,
              pdfs: _newpdfs
            });
          }
          if (this.currentOption === 'remove-all') {
            this.materialService.delete$([
              ...this.currentFolder.videos,
              ...this.currentFolder.images,
              ...this.currentFolder.pdfs
            ]);
          }
          this.materialService.delete$([this.currentFolder._id]);
          this.materialService.removeFolder$(this.currentFolder._id);
          this.dialogRef.close();
        }
      });
  }
}
