import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserService } from '../../services/user.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';
import { Garbage } from 'src/app/models/garbage.model';

@Component({
  selector: 'app-material-edit-template',
  templateUrl: './material-edit-template.component.html',
  styleUrls: ['./material-edit-template.component.scss']
})
export class MaterialEditTemplateComponent implements OnInit {
  garbage: Garbage = new Garbage();
  theme_setting = {};
  materials = [];
  selectedTheme = {
    name: '',
    thumbnail: '',
    id: ''
  };
  saving = false;
  themes = [
    {
      name: 'Theme 1',
      thumbnail: environment.server + '/assets/images/theme/theme2.jpg',
      id: 'theme2'
    },
    {
      name: 'Simple Theme',
      thumbnail: environment.server + '/assets/images/theme/theme4.jpg',
      id: 'theme3'
    },
    {
      name: 'Lead Theme',
      thumbnail: environment.server + '/assets/images/theme/theme4.png',
      id: 'theme4'
    }
  ];
  garbageSubscription: Subscription;
  updateSubscription: Subscription;

  constructor(
    private dialogRef: MatDialogRef<MaterialEditTemplateComponent>,
    private userService: UserService,
    private toast: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (this.data.id) {
      this.materials = [this.data.id];
    }
    if (this.data.materials) {
      this.materials = this.data.materials.map((e) => e._id);
    }
    console.log('this.materials', this.materials);
    this.garbageSubscription = this.userService.garbage$.subscribe(
      (garbage) => {
        let theme;
        this.garbage = new Garbage().deserialize(garbage);
        if (this.materials.length > 1) {
          theme = garbage.material_theme;
          this.selectedTheme = this.themes.filter((e) => e.id == theme)[0];
        } else {
          const material = this.materials[0];
          this.theme_setting = garbage.material_themes || {};
          if (garbage.material_themes && garbage.material_themes[material]) {
            theme = garbage.material_themes[material];
          } else {
            theme = garbage.material_theme;
          }
          this.selectedTheme = this.themes.filter((e) => e.id == theme)[0];
        }
        this.theme_setting = garbage.material_themes || {};
      }
    );
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.garbageSubscription && this.garbageSubscription.unsubscribe();
    this.updateSubscription && this.updateSubscription.unsubscribe();
  }

  setMaterialTheme(theme: any): void {
    this.selectedTheme = theme;
  }

  save(): void {
    this.saving = true;
    for (let i = 0; i < this.materials.length; i++) {
      this.theme_setting[this.materials[i]] = this.selectedTheme.id;
    }
    this.updateSubscription = this.userService
      .updateGarbage({ material_themes: this.theme_setting })
      .subscribe((status) => {
        this.saving = false;
        if (status) {
          this.userService.updateGarbageImpl({
            material_themes: this.theme_setting
          });
          this.dialogRef.close(this.selectedTheme.name);
          this.toast.success(
            'Material template has been changed successfully.'
          );
        }
      });
  }
}
