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

