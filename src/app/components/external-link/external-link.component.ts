import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-external-link',
  templateUrl: './external-link.component.html',
  styleUrls: ['./external-link.component.sass']
})
export class ExternalLinkComponent implements OnInit {

  @Input() public url: string;

  constructor() { }

  ngOnInit(): void {
  }

}
