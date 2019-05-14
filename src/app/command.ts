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


export class Command {

  private args: string[] = [];

  constructor(private cmd: string) {
  }

  addArgument(newarg: string) {
    this.args = this.args.concat([newarg]);
    return this;
  }

  toString() {
    return [this.cmd].concat(this.args).join(':');
  }

  getCmd() {
    return this.cmd;
  }
}
export const AUTH = 'a';
export const REG = 'r';
export const UNREG = 'u';
export const ON = 'n';
export const OFF = 'f';
export const GET = 'g';
export const UPDATE = 'p';
