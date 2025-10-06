// Command Pattern for User Actions

export interface Command {
  execute(): void | Promise<void>;
}

export class CopyToClipboardCommand implements Command {
  constructor(
    private text: string,
    private onSuccess?: () => void,
    private onError?: () => void
  ) {}

  async execute(): Promise<void> {
    const success = await this.copyToClipboard(this.text);
    
    if (success && this.onSuccess) {
      this.onSuccess();
    } else if (!success && this.onError) {
      this.onError();
    }
  }

  private async copyToClipboard(text: string): Promise<boolean> {
    // Try modern Clipboard API first
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        // Fall through to legacy method
      }
    }

    // Fallback to legacy execCommand method
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.readOnly = true;
      ta.style.position = 'fixed';
      ta.style.top = '-1000px';
      ta.style.opacity = '0';

      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);

      return ok;
    } catch {
      return false;
    }
  }
}

export class ToggleOverlayCommand implements Command {
  constructor(
    private overlay: { show: () => void; hide: () => void; isVisible: () => boolean }
  ) {}

  execute(): void {
    if (this.overlay.isVisible()) {
      this.overlay.hide();
    } else {
      this.overlay.show();
    }
  }
}

export class DismissOverlayCommand implements Command {
  constructor(
    private overlay: { hide: () => void; dismiss: () => void }
  ) {}

  execute(): void {
    this.overlay.dismiss();
    this.overlay.hide();
  }
}
