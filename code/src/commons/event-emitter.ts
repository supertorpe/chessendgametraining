export class EventEmitter<T> {
  private _listeners: ((event: T) => void)[] = [];

  constructor() { }

  public addEventListener(listener: (event: T) => void) {
    if (!this._listeners.includes(listener)) {
      this._listeners.push(listener);
    }
  }

  public removeEventListener(listener: (event: T) => void) {
    const idx = this._listeners.indexOf(listener);
    if (idx !== -1) {
      this._listeners.splice(idx, 1);
    }
  }

  public removeListeners() {
    this._listeners = [];
  }

  public notify(event: T) {
    this._listeners.forEach((_listeners) => {
      _listeners(event);
    });
  }
}
