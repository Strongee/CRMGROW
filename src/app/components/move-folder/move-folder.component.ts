import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { Material } from 'src/app/models/material.model';
import { MaterialService } from 'src/app/services/material.service';
import { StoreService } from 'src/app/services/store.service';
import { UserService } from 'src/app/services/user.service';

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
        if (this.data && this.data.currentFolder) {
          this.isRoot = false;
          return;
        }
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

    this.moving = true;
    this.moveSubscription = this.materialService
      .moveFiles(
        { videos, images, pdfs, shared_materials },
        this.selectedFolder._id
      )
      .subscribe((status) => {
        if (status) {
          this.materialService.bulkUpdate$(
            [...videos, ...images, ...pdfs, ...shared_materials],
            { folder: this.selectedFolder._id }
          );
          this.dialogRef.close(true);
        }
      });
  }
}
