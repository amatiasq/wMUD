import { IStyleDefinition, StyledAnsi } from './ansi-parser';


const BACKSPACE = '\x08';


const escapes: IEscapeChars = {
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
  '"': '&quot;',
  ' ': '&nbsp;',
  '\'': '&#039;',
};


export default function renderAnsi(ansi: StyledAnsi) {
  let styles: Partial<IStyleDefinition> = null;
  let html = '';
  let content = '';
  let isSpanOpen = false;

  ansi.forEach(data => {
    if (typeof data === 'string') {
      if (data === BACKSPACE)
        return content = content.slice(0, -1);

      content += data;
      return;
    }

    const classNames = stylesToClasses(data).join(' ');
    html += closeSpan() + `<span class="${classNames}>`;
    isSpanOpen = true;
    styles = data;
  });

  return closeSpan();

  function closeSpan() {
    const result = `${escapeHtml(content)}${isSpanOpen ? '</span>' : ''}`;
    isSpanOpen = false;
    content = '';
    return result;
  }
}


export function stylesToClasses(styles: Partial<IStyleDefinition>) {
  return Object.keys(styles).map((key: keyof IStyleDefinition) => {
    const value = styles[key];
    const appendix = value === true ? '' : '-' + (value as string);
    return `ansi-${key}${appendix}`;
  });
}


export function escapeHtml(character: string) {
  return escapes.hasOwnProperty(character) ?
    escapes[character] :
    character;
}


interface IEscapeChars {
  [char: string]: string;
}
