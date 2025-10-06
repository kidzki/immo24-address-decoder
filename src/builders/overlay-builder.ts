// Builder Pattern for Overlay Construction

import type { Address, Settings } from '../types.js';
import { OverlayStyleFactory, AddressFormatter } from '../factories/overlay-factory.js';

export class OverlayBuilder {
  private element: HTMLDivElement;
  private settings: Settings;
  private address: Address;
  private translator: (key: string) => string;
  private onCopy?: (text: string) => Promise<boolean>;
  private onClose?: () => void;

  constructor(
    settings: Settings,
    address: Address,
    translator: (key: string) => string
  ) {
    this.settings = settings;
    this.address = address;
    this.translator = translator;
    this.element = document.createElement('div');
  }

  withCopyHandler(handler: (text: string) => Promise<boolean>): this {
    this.onCopy = handler;
    return this;
  }

  withCloseHandler(handler: () => void): this {
    this.onClose = handler;
    return this;
  }

  build(): HTMLDivElement {
    this.setupContainer();
    this.addTitle();
    this.addAddressDisplay();
    this.addActionButtons();
    
    return this.element;
  }

  private setupContainer(): void {
    this.element.id = 'is24-address-decoder-overlay';
    const style = OverlayStyleFactory.createBaseStyle(
      this.settings.theme,
      this.settings.position
    );
    this.element.setAttribute('style', style);
  }

  private addTitle(): void {
    const title = document.createElement('div');
    title.style.fontWeight = '700';
    title.style.marginBottom = '6px';
    title.textContent = this.translator('uiTitle');
    this.element.appendChild(title);
  }

  private addAddressDisplay(): void {
    const line = document.createElement('div');
    line.style.margin = '6px 0 10px';
    line.style.whiteSpace = 'pre-wrap';

    const sanitizedAddress: Address = {
      strasse: AddressFormatter.sanitize(this.address.strasse),
      hausnummer: AddressFormatter.sanitize(this.address.hausnummer),
      plz: AddressFormatter.sanitize(this.address.plz),
      ort: AddressFormatter.sanitize(this.address.ort),
      ortsteil: AddressFormatter.sanitize(this.address.ortsteil)
    };

    const formatted = AddressFormatter.format(sanitizedAddress);
    line.textContent = formatted || this.translator('uiNoAddress');
    this.element.appendChild(line);
  }

  private addActionButtons(): void {
    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.gap = '8px';
    actions.style.flexWrap = 'wrap';

    if (this.onCopy) {
      actions.appendChild(this.createCopyButton());
    }
    
    actions.appendChild(this.createMapButton());
    
    if (this.onClose) {
      actions.appendChild(this.createCloseButton());
    }

    this.element.appendChild(actions);
  }

  private createCopyButton(): HTMLButtonElement {
    const btn = document.createElement('button');
    const style = OverlayStyleFactory.createButtonStyle();
    btn.setAttribute('style', style);
    btn.textContent = this.translator('uiCopy');

    if (this.onCopy) {
      const sanitizedAddress: Address = {
        strasse: AddressFormatter.sanitize(this.address.strasse),
        hausnummer: AddressFormatter.sanitize(this.address.hausnummer),
        plz: AddressFormatter.sanitize(this.address.plz),
        ort: AddressFormatter.sanitize(this.address.ort),
        ortsteil: AddressFormatter.sanitize(this.address.ortsteil)
      };
      
      const addrLine = AddressFormatter.format(sanitizedAddress);
      const copyHandler = this.onCopy;

      btn.addEventListener('click', async () => {
        const ok = await copyHandler(addrLine);
        btn.textContent = ok ? this.translator('uiCopied') : this.translator('uiCopyFail');
        setTimeout(() => {
          btn.textContent = this.translator('uiCopy');
        }, 1500);
      });
    }

    return btn;
  }

  private createMapButton(): HTMLAnchorElement {
    const btn = document.createElement('a');
    const style = OverlayStyleFactory.createGhostButtonStyle(this.settings.theme);
    btn.setAttribute('style', style + ' text-decoration:none; display:inline-flex; align-items:center; justify-content:center;');
    
    btn.href = this.buildMapHref();
    btn.target = '_blank';
    btn.rel = 'noopener';
    btn.textContent = this.translator('uiOpenMap');

    return btn;
  }

  private createCloseButton(): HTMLButtonElement {
    const btn = document.createElement('button');
    const style = OverlayStyleFactory.createGhostButtonStyle(this.settings.theme);
    btn.setAttribute('style', style);
    btn.textContent = this.translator('uiClose');

    if (this.onClose) {
      btn.addEventListener('click', this.onClose);
    }

    return btn;
  }

  private buildMapHref(): string {
    const parts = [
      this.address.strasse,
      this.address.hausnummer,
      this.address.plz,
      this.address.ort
    ].filter(Boolean);

    const q = encodeURIComponent(parts.join(' '));

    switch (this.settings.mapProvider) {
      case 'osm':
        return `https://www.openstreetmap.org/search?query=${q}`;
      case 'apple':
        return `https://maps.apple.com/?q=${q}`;
      default:
        return `https://www.google.com/maps/search/?api=1&query=${q}`;
    }
  }
}
