const ESC = '\x1b';

const defaultStyles: IStyleDefinition = {
  fg: 'default',
  bg: 'default',
  underline: false,
  inverse: false,
  italics: false,
  strike: false,
  bold: false,
};

const styleCodes: IStyleCodes = {
  0:  defaultStyles,
  1:  { bold: true },
  2:  { bold: false }, // non standard
  3:  { italics: true },
  4:  { underline: true },
  7:  { inverse: true },
  9:  { strike: true },
  22: { bold: false },
  23: { italics: false },
  24: { underline: false },
  27: { inverse: false },
  29: { strike: false },
  30: { fg: 'black' },
  31: { fg: 'red' },
  32: { fg: 'green' },
  33: { fg: 'yellow' },
  34: { fg: 'blue' },
  35: { fg: 'magenta' },
  36: { fg: 'cyan' },
  37: { fg: 'white' },
  39: { fg: defaultStyles.fg },
  40: { bg: 'black' },
  41: { bg: 'red' },
  42: { bg: 'green' },
  43: { bg: 'yellow' },
  44: { bg: 'blue' },
  45: { bg: 'magenta' },
  46: { bg: 'cyan' },
  47: { bg: 'white' },
  49: { bg: defaultStyles.bg },
};


export default class AnsiParser {

  private styles: Partial<IStyleDefinition> = {};
  private code: string[] = [];
  private escFound = false;
  private lastChar: string = null;


  parse(data: string): StyledAnsi {
    const output = data
      .split('')
      .map(char => this.parseCharacter(char), this)
      .filter(Boolean);

    return flatten(output);
  }


  @window.log({oneLine: true})
  parseCharacter(character: string): DirtStyledEntry {
    const {code} = this;

    if (character === ESC) {
      code.push(ESC);
      return null;
    }

    if (code.length) {
      // XTerm scape codes are ignored
      if (code.length === 2 && code[1] === ']') {
        if (character === '\n')
          code.length = 0;
        return null;
      }

      if (code.length === 1 && character !== '[' && character !== ']')
        return [ code.pop(), character ];

      code.push(character);
      if (character !== 'm')
        return null;

      this.styles = this.parseColor(this.styles, code);
      code.length = 0;
      return { ...this.styles };
    }

    return character;
  }


  parseColor(current: Partial<IStyleDefinition>, chars: string[]): Partial<IStyleDefinition> {
    if (chars.length === 3)
      return {};

    const styles = chars
      .join('')
      .slice(2, -1)
      .split(';')
      .map(value => {
        const code = parseInt(value, 10);

        if (!styleCodes.hasOwnProperty(code))
          return console.error('Unknown code', code, 'at', chars);

        return styleCodes[code];
      })
      .filter(Boolean)
      .reduce<Partial<IStyleDefinition>>((result, style) => Object.assign(result, style), {});

    Object.keys(styles).forEach((key: keyof IStyleDefinition) => {
      if (styles[key] === defaultStyles[key])
        delete styles[key];
    });

    return styles;
  }
}


function flatten(array: DirtStyledEntry[]): StyledAnsi {
  return array.concat.apply([], array);
}


export type StyledAnsi = StyledEntry[];
export type StyledEntry = string | Partial<IStyleDefinition>;
export type DirtStyledEntry = StyledEntry | string[];


interface IStyleCodes {
  [code: number]: Partial<IStyleDefinition>;
}


export interface IStyleDefinition {
  fg: string;
  bg: string;
  underline: boolean;
  inverse: boolean;
  italics: boolean;
  strike: boolean;
  bold: boolean;
}
