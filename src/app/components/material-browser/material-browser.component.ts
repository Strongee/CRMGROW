import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { STATUS } from 'src/app/constants/variable.constants';
import { Material } from 'src/app/models/material.model';
import { MaterialService } from 'src/app/services/material.service';
import { StoreService } from 'src/app/services/store.service';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';
import * as _ from 'lodash';
import { searchReg } from 'src/app/helper';

@Component({
  selector: 'app-material-browser',
  templateUrl: './material-browser.component.html',
  styleUrls: ['./material-browser.component.scss']
})
export class MaterialBrowserComponent implements OnInit, OnDestroy {
  DISPLAY_COLUMNS = ['select', 'material_name', 'creator', 'share', 'type'];
  STATUS = STATUS;
  siteUrl = environment.website;
  user_id = '';

  material_type = '';
  materials: any[] = [];
  filteredMaterials: any[] = [];
  selection: any[] = [];

  loadSubscription: Subscription;
  profileSubscription: Subscription;

  folders: Material[] = [];
  foldersKeyValue = {};

  selectedFolder: Material;
  searchStr = '';
  matType = '';

  multiple = true;
  onlyMine = false;
  resultMatType = 'material';

  hideMaterials = [];
  constructor(
    public materialService: MaterialService,
    public storeService: StoreService,
    private dialogRef: MatDialogRef<MaterialBrowserComponent>,
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (this.data) {
      this.multiple = this.data.multiple;
      this.onlyMine = this.data.onlyMine;

      if (this.data.resultMatType) {
        this.resultMatType = this.data.resultMatType;
      }

      if (this.data.material_type) {
        this.material_type = this.data.material_type;
      }

      if (!this.multiple) {
        this.DISPLAY_COLUMNS.splice(0, 1);
      }

      if (this.data.hideMaterials) {
        this.data.hideMaterials.forEach((e) => {
          this.hideMaterials.push(e._id);
        });
      }

      if (this.data.materials) {
        this.data.materials.forEach((e) => {
          this.selection.push(e._id);
        });
      }
    }

    const profile = this.userService.profile.getValue();
    this.user_id = profile._id;

    this.loadSubscription = this.storeService.materials$.subscribe(
      (materials) => {
        materials.sort((a, b) => (a.folder ? -1 : 1));
        this.materials = materials.filter((e) => {
          if (this.hideMaterials.indexOf(e._id) !== -1) {
            return false;
          }
          const userId = e.user && e.user._id ? e.user._id : e.user;
          if (this.onlyMine) {
            if (e.role === 'admin') {
              return false;
            }
            if (userId !== this.user_id) {
              return false;
            }
          }
          if (this.material_type) {
            if (
              e.material_type !== 'folder' &&
              e.material_type !== this.material_type
            ) {
              return false;
            }
          }
          return true;
        });
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
          folder.videos.forEach((e) => {
            materialFolderMatch[e] = folder._id;
          });
          folder.pdfs.forEach((e) => {
            materialFolderMatch[e] = folder._id;
          });
          folder.images.forEach((e) => {
            materialFolderMatch[e] = folder._id;
          });
        });

        materials.forEach((e) => {
          if (materialFolderMatch[e._id]) {
            e.folder = materialFolderMatch[e._id];
          }
        });
        this.filter();
      }
    );
  }

  ngOnInit(): void {
    this.materialService.loadMaterial(false);
  }

  ngOnDestroy(): void {
    this.loadSubscription && this.loadSubscription.unsubscribe();
    this.profileSubscription && this.profileSubscription.unsubscribe();
  }

  clearSearchStr(): void {
    this.searchStr = '';
    this.filter();
  }

  filter(): void {
    // this.selection = [];
    this.filteredMaterials = this.materials.filter((material) => {
      if (this.selectedFolder) {
        if (this.selectedFolder._id !== material.folder) {
          return false;
        }
      } else if (!this.searchStr && material.folder) {
        return false;
      }
      if (this.matType && material.material_type != this.matType) {
        return false;
      }
      if (!searchReg(material.title || '', this.searchStr)) {
        return false;
      }
      return true;
    });
  }

  isAllSelected(): boolean {
    const filteredMaterialIds = [];
    this.filteredMaterials.forEach((e) => {
      filteredMaterialIds.push(e._id);
    });
    const selectedMaterials = _.intersection(
      this.selection,
      filteredMaterialIds
    );
    return (
      this.filteredMaterials.length &&
      selectedMaterials.length === this.filteredMaterials.length
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
    if (this.isAllSelected()) {
      this.filteredMaterials.forEach((e) => {
        const pos = this.selection.indexOf(e._id);
        if (pos !== -1) {
          this.selection.splice(pos, 1);
        }
      });
    } else {
      this.filteredMaterials.forEach((e) => {
        const pos = this.selection.indexOf(e._id);
        if (pos === -1) {
          this.selection.push(e._id);
        }
      });
    }
  }

  clearSelection(): void {
    this.selection = [];
  }

  toggleElement(element: Material): void {
    const pos = this.selection.indexOf(element._id);
    if (pos !== -1) {
      this.selection.splice(pos, 1);
    } else {
      this.selection.push(element._id);
    }
  }

  getMaterialById(id): any {
    const index = this.materials.findIndex((item) => item._id === id);
    if (index >= 0) {
      return this.materials[index];
    }
    return null;
  }

  capitalizeFirstLetter(type: string): any {
    return type.charAt(0).toUpperCase() + type.slice(1);
  }

  openFolder(element: Material): void {
    this.selectedFolder = element;
    this.filter();
  }

  toRoot(): void {
    this.selectedFolder = null;
    this.filter();
  }

  changeFileType(type: string): void {
    this.matType = type;
    this.filter();
  }

  select(): void {
    const selectedMaterials = [];
    for (const selectedMaterial of this.selection) {
      if (this.getMaterialById(selectedMaterial)) {
        selectedMaterials.push(this.getMaterialById(selectedMaterial));
      }
    }

    const filteredFolders = this.folders.filter((e) => {
      if (this.selection.indexOf(e._id) !== -1) {
        return true;
      }
    });
    const filteredFolderIds = filteredFolders.map((e) => e._id);
    const folderMaterials = this.materials.filter((e) => {
      if (filteredFolderIds.indexOf(e.folder) !== -1) {
        return true;
      }
    });

    if (this.resultMatType === 'material') {
      this.dialogRef.close({
        materials: [...folderMaterials, ...selectedMaterials]
      });
    } else {
      this.dialogRef.close({
        materials: [...filteredFolders, ...selectedMaterials]
      });
    }
  }

  selectMaterial(element: Material): void {
    if (this.multiple) {
      return;
    }
    if (element.material_type === 'folder') {
      return;
    }
    this.selection = [element._id];
  }
}
