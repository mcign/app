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


import { AppComponent } from './app.component';

enum Level {
  INFO,
  WARN,
  ERROR,
  FATAL }

export class Error {
  constructor(
    private level: Level,
    private title: string,
    private message: string,
  ) {
  }

  display(app: AppComponent) {
    console.log('[' + this.level + '] ' + this.title + ': ' + this.message);
    switch (this.level) {
      case Level.FATAL:
        app.showError(this.title, this.message); // ,true)
        break;
      default:
      case Level.ERROR:
        app.showError(this.title, this.message); // ,false)
        break;
      case Level.WARN:
        app.showToast(this.title, this.message);
        break;
      case Level.INFO:
        break;
    }
  }
}

