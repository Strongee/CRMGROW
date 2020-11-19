import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserService } from '../../services/user.service';
import { environment } from 'src/environments/environment';
import { Garbage } from 'src/app/models/garbage.model';

@Component({
  selector: 'app-material-edit-template',
  templateUrl: './material-edit-template.component.html',
  styleUrls: ['./material-edit-template.component.scss']
})
export class MaterialEditTemplateComponent implements OnInit {
  garbage: Garbage = new Garbage();
  material_id = '';
  selectedTheme = {
    name: '',
    thumbnail: '',
    id: ''
  };
  saving = false;
  themes = [
    {
      name: 'Default Theme',
      thumbnail: environment.server + '/assets/images/theme/default.jpg',
      id: 'default'
    },
    {
      name: 'Theme 1',
      thumbnail: environment.server + '/assets/images/theme/theme1.jpg',
      id: 'theme1'
    },
    {
      name: 'Theme 2',
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

  constructor(
    private dialogRef: MatDialogRef<MaterialEditTemplateComponent>,
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.material_id = this.data.id;
    this.userService.garbage$.subscribe((res) => {
      this.garbage = new Garbage().deserialize(res);
      this.selectedTheme = this.themes.filter(
        (theme) => theme.id == this.garbage.material_theme
      )[0];
    });
  }

  ngOnInit(): void {}

  setMaterialTheme(theme: any): void {
    this.selectedTheme = theme;
  }

  save(): void {
    this.saving = true;
    const data = {
      material_id: this.material_id,
      theme_id: this.selectedTheme.id
    };
    this.dialogRef.close(data);
    this.saving = false;
  }
}
