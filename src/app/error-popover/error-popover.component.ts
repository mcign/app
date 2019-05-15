/*
    Copyright 2018,2019 Austin Haigh

    This file is part of MCIGN.

    MCIGN is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    MCIGN is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with MCIGN.  If not, see <https://www.gnu.org/licenses/>.

*/


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
