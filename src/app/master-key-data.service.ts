import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MasterKeyDataService {

  constructor() { }

  private data: string;

  setData(newdata: string): void {
    this.data = newdata;
  }

  getData(): string {
    return this.data;
  }
}
