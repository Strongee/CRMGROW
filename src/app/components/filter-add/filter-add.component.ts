import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-filter-add',
  templateUrl: './filter-add.component.html',
  styleUrls: ['./filter-add.component.scss']
})
export class FilterAddComponent implements OnInit {
  submitted = false;
  saving = false;
  filterName = '';

  constructor() {}

  ngOnInit(): void {}

  saveFilter(): void {}
}
