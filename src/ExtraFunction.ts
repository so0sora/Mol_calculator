import atomData from './atom.json';

const subscriptMap: { [key: string]: string } = {
  '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4',
  '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9'
};

// 아래첨자만 카운트로 인식 (일반 숫자는 무시)
function subscriptToNumber(sub: string): number {
  if (!sub) return 1;
  let normal = '';
  for (const ch of sub) {
    normal += subscriptMap[ch] ?? '';
  }
  return normal ? parseInt(normal, 10) : 1;
}

export class SubscriptConverter {
    /* 0~9의 정수 문자를 ₀~₉까지 아래 첨자로 변환하는 함수*/
    private static subscriptDigits: { [key: string]: string } = {
        '0': '₀',
        '1': '₁',
        '2': '₂',
        '3': '₃',
        '4': '₄',
        '5': '₅',
        '6': '₆',
        '7': '₇',
        '8': '₈',
        '9': '₉'
    };

    // 모든 숫자를 아래첨자로 변환
    public static toSubscriptAll(input: string): string {
        return input.replace(/[0-9]/g, (digit) => SubscriptConverter.subscriptDigits[digit]);
    }

    // 기존: 마지막 문자만 변환
    public static toSubscriptLastChar(input: string): string {
        if (input.length === 0) return input;
        const last = input[input.length - 1];
        const sub = SubscriptConverter.subscriptDigits[last] || last;
        return input.slice(0, -1) + sub;
    }
}

export class SuperscriptConverter {
    /* 0~9의 정수 문자를 ⁰~⁹까지 위 첨자로 변환하는 함수 */
    private static superscriptDigits: { [key: string]: string } = {
        '0': '⁰',
        '1': '¹',
        '2': '²',
        '3': '³',
        '4': '⁴',
        '5': '⁵',
        '6': '⁶',
        '7': '⁷',
        '8': '⁸',
        '9': '⁹'
    };

    public static toSuperscript(input: string): string {
        return input.replace(/[0-9]/g, (digit) => SuperscriptConverter.superscriptDigits[digit]);
    }
}

export class Calculate {
  public static parseMolecule(formula: string): { symbol: string, count: number }[] {
    const result: { symbol: string, count: number }[] = [];
    // ([A-Z][a-z]?)(₀~₉*)만 매칭, 일반 숫자는 무시
    const regex = /([A-Z][a-z]?)([₀₁₂₃₄₅₆₇₈₉]*)/g;
    let match;

    while ((match = regex.exec(formula)) !== null) {
      const symbol = match[1];
      const subscript = match[2];
      const count = subscriptToNumber(subscript);
      if (Object.prototype.hasOwnProperty.call(atomData, symbol)) {
        result.push({ symbol, count });
      }
    }

    return result;
  }
}