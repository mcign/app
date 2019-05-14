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
