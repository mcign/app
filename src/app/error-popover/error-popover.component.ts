import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-error-popover',
  templateUrl: './error-popover.component.html',
  styleUrls: ['./error-popover.component.scss'],
})
export class ErrorPopoverComponent implements OnInit {
  private message: string;
  private title: string;

  constructor() { }

  ngOnInit() {}

}
