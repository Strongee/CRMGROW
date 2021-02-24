import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { Material } from 'src/app/models/material.model';
import { MaterialService } from 'src/app/services/material.service';
import { StoreService } from 'src/app/services/store.service';
import { UserService } from 'src/app/services/user.service';
import * as _ from 'lodash';
@Component({
  selector: 'app-move-folder',
  templateUrl: './move-folder.component.html',
  styleUrls: ['./move-folder.component.scss']
})
export class MoveFolderComponent implements OnInit, OnDestroy {
  folders: Material[] = [];
  isRoot: boolean = true;
  rootFolder: Material = new Material().deserialize({ _id: 'root' });
  materials: Material[] = [];
  userId = '';
  selectedFolder: Material = new Material();
  currentFolder: Material = new Material();
  moving = false;

  profileSubscription: Subscription;
  folderLoadSubscription: Subscription;
  moveSubscription: Subscription;
  constructor(
    private storeService: StoreService,
    private materialService: MaterialService,
    private userService: UserService,
    private dialogRef: MatDialogRef<MoveFolderComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.folderLoadSubscription = this.storeService.materials$.subscribe(
      (materials) => {
        this.folders = materials.filter((e) => {
          return e.material_type === 'folder';
        });
      }
    );
    this.profileSubscription = this.userService.profile$.subscribe(
      (profile) => {
        this.userId = profile._id;
      }
    );
    if (this.data && this.data.materials) {
      this.materials = this.data.materials;
    }
    if (this.data && this.data.currentFolder) {
      this.isRoot = false;
      this.currentFolder = this.data.currentFolder;
      return;
    }
  }

  ngOnDestroy(): void {
    this.profileSubscription && this.profileSubscription.unsubscribe();
    this.folderLoadSubscription && this.folderLoadSubscription.unsubscribe();
  }

  move(): void {
    const shared_materials = [];
    const videos = [];
    const images = [];
    const pdfs = [];
    this.materials.forEach((e) => {
      if (e.role === 'admin') {
        shared_materials.push(e._id);
      } else {
        if (e.user && e.user._id && e.user._id === this.userId) {
          switch (e.material_type) {
            case 'video':
              videos.push(e._id);
              break;
            case 'pdf':
              pdfs.push(e._id);
              break;
            case 'image':
              images.push(e._id);
              break;
          }
        } else if (e.user === this.userId) {
          switch (e.material_type) {
            case 'video':
              videos.push(e._id);
              break;
            case 'pdf':
              pdfs.push(e._id);
              break;
            case 'image':
              images.push(e._id);
              break;
          }
        } else {
          shared_materials.push(e._id);
        }
      }
    });

    let source = '';
    if (this.currentFolder && this.currentFolder._id) {
      source = this.currentFolder._id;
    }

    if (this.selectedFolder._id !== 'root') {
      this.moving = true;
      this.moveSubscription = this.materialService
        .moveFiles(
          { videos, images, pdfs, shared_materials },
          this.selectedFolder._id,
          source
        )
        .subscribe((status) => {
          if (status) {
            if (shared_materials.length) {
              if (source) {
                // remove shared materials
                const _currentSharedMaterials = this.currentFolder
                  .shared_materials;
                _.pullAll(_currentSharedMaterials, shared_materials);
                this.materialService.update$(source, {
                  shared_materials: _currentSharedMaterials
                });
              }
              // add shared materials
              const _sharedMaterials = this.selectedFolder.shared_materials;
              const _newSharedMaterials = _.union(
                _sharedMaterials,
                shared_materials
              );
              this.materialService.update$(this.selectedFolder._id, {
                shared_materials: _newSharedMaterials
              });
            }
            this.materialService.bulkUpdate$(
              [...videos, ...images, ...pdfs, ...shared_materials],
              { folder: this.selectedFolder._id }
            );
            this.dialogRef.close(true);
          }
        });
    } else {
      this.moving = true;
      this.moveSubscription = this.materialService
        .moveFiles({ videos, images, pdfs, shared_materials }, '', source)
        .subscribe((status) => {
          if (status) {
            if (shared_materials.length) {
              if (source) {
                // remove shared material
                const _currentSharedMaterials = this.currentFolder
                  .shared_materials;
                _.pullAll(_currentSharedMaterials, shared_materials);
                this.materialService.update$(source, {
                  shared_materials: _currentSharedMaterials
                });
              }
            }
            this.materialService.bulkUpdate$(
              [...videos, ...images, ...pdfs, ...shared_materials],
              { folder: '' }
            );
            this.dialogRef.close(true);
          }
        });
    }
  }
}
