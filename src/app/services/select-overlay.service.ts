import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SelectOverlayService {

  public isOverlayVisible = false;
  public activeKey: string | undefined;
  public options: Option[] = [];

  public topPx: string;
  public leftPx: string;

  private callback?: (option: Option) => void;

  constructor() { }

  trigger(event: MouseEvent, options: Option[], callback: (option: Option) => void, activeKey?: string) {
    event.stopPropagation();

    // @ts-ignore
    const rect = event.target.getBoundingClientRect();

    // @ts-ignore
    const osL = rect.left;
    // @ts-ignore
    const osT = rect.top;

    this.topPx = osT + 'px';
    this.leftPx = osL + 'px';

    this.isOverlayVisible = true;

    this.options = options;
    this.callback = callback;
    this.activeKey = activeKey;
  }

  hideAll() {
    this.options = [];
    this.callback = undefined;
    this.activeKey = '';
    this.isOverlayVisible = false;
  }

  optionSelected(option: Option) {
    if (this.callback) {
      this.callback(option);
      this.callback = undefined;
    }
  }
}

export interface Option {
  key: string;
  value: string;
}
