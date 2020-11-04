import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tag-manager',
  templateUrl: './tag-manager.component.html',
  styleUrls: ['./tag-manager.component.scss']
})
export class TagManagerComponent implements OnInit {
  tags = [
    {
      label: 'hot',
      times: 10,
      names: [
        { short: 'PN', full: 'Przemyslaw Nowakowski' },
        { short: 'TA', full: 'Thomas Anderson' },
        { short: 'RB', full: 'Rafal Baran' },
        { short: 'NC', full: 'Nick Carter' },
        { short: 'JW', full: 'Jiang Wang' },
        { short: 'DJ', full: 'Da Jin' },
        { short: 'ML', full: 'Mori Lucas' },
        { short: 'DJ', full: 'David Johnson' },
        { short: 'HK', full: 'Harry Kane' },
        { short: 'JJ', full: 'John Jakaive' }
      ]
    },
    {
      label: 'interested',
      times: 4,
      names: [
        { short: 'PN', full: 'Przemyslaw Nowakowski' },
        { short: 'TA', full: 'Thomas Anderson' },
        { short: 'RB', full: 'Rafal Baran' },
        { short: 'NC', full: 'Nick Carter' }
      ]
    },
    {
      label: '2019Q4',
      times: 5,
      names: [
        { short: 'PN', full: 'Przemyslaw Nowakowski' },
        { short: 'TA', full: 'Thomas Anderson' },
        { short: 'RB', full: 'Rafal Baran' },
        { short: 'NC', full: 'Nick Carter' },
        { short: 'DJ', full: 'David Johnson' }
      ]
    }
  ];

  constructor() {}

  ngOnInit(): void {}
}
