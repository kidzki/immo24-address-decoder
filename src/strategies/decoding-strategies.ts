// Strategy Pattern for Address Decoding
// Different strategies for decoding encoded address data

export interface DecodingStrategy {
  decode(encoded: string): any | null;
}

// Base64 + JSON Strategy
export class Base64JsonStrategy implements DecodingStrategy {
  decode(encoded: string): any | null {
    try {
      const normalized = this.normalizeBase64(encoded);
      const bytes = this.base64ToBytes(normalized);
      const jsonString = this.bytesToString(bytes);
      const fixed = this.fixDoubleUtf8(jsonString);
      
      try {
        return JSON.parse(fixed);
      } catch {
        return JSON.parse(decodeURIComponent(fixed));
      }
    } catch {
      return null;
    }
  }

  private normalizeBase64(b64: string): string {
    return (b64 || '').replace(/-/g, '+').replace(/_/g, '/').replace(/\s+/g, '');
  }

  private base64ToBytes(b64: string): Uint8Array {
    const norm = this.normalizeBase64(b64);
    const pad = norm.length % 4 === 0 ? '' : '='.repeat(4 - (norm.length % 4));
    const bin = atob(norm + pad);
    return Uint8Array.from(bin, c => c.charCodeAt(0));
  }

  private bytesToString(bytes: Uint8Array): string {
    // Try UTF-8 first
    try {
      return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    } catch {}
    
    // Try Windows-1252
    try {
      return new TextDecoder('windows-1252', { fatal: true }).decode(bytes);
    } catch {}
    
    // Try ISO-8859-1
    try {
      return new TextDecoder('iso-8859-1', { fatal: true }).decode(bytes);
    } catch {}
    
    // Fallback: manual conversion
    let s = '';
    for (let i = 0; i < bytes.length; i++) {
      s += String.fromCharCode(bytes[i] & 0xff);
    }
    
    try {
      return decodeURIComponent(escape(s));
    } catch {
      return s;
    }
  }

  private fixDoubleUtf8(s: string): string {
    if (!s) return s;
    if (!/[Ã][\x80-\xBF]/.test(s)) return s;
    
    const bytes = Uint8Array.from([...s].map(ch => ch.charCodeAt(0) & 0xff));
    try {
      return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    } catch {
      return s;
    }
  }
}

// Direct JSON Strategy
export class DirectJsonStrategy implements DecodingStrategy {
  decode(encoded: string): any | null {
    try {
      return JSON.parse(encoded);
    } catch {
      try {
        return JSON.parse(decodeURIComponent(encoded));
      } catch {
        return null;
      }
    }
  }
}

// Chain of Responsibility Pattern for multiple strategies
export class DecodingStrategyChain {
  private strategies: DecodingStrategy[] = [];

  addStrategy(strategy: DecodingStrategy): this {
    this.strategies.push(strategy);
    return this;
  }

  decode(encoded: string | null): any | null {
    if (!encoded) return null;

    // URL decode first
    let urlDecoded: string;
    try {
      urlDecoded = decodeURIComponent(String(encoded).replace(/\+/g, '%20'));
    } catch {
      urlDecoded = encoded;
    }

    // Try each strategy in order
    for (const strategy of this.strategies) {
      const result = strategy.decode(urlDecoded);
      if (result !== null) {
        return result;
      }
    }

    return null;
  }
}

// Factory function to create the default decoding chain
export function createDefaultDecodingChain(): DecodingStrategyChain {
  return new DecodingStrategyChain()
    .addStrategy(new Base64JsonStrategy())
    .addStrategy(new DirectJsonStrategy());
}
