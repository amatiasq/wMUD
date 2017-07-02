import { NBSP } from '../constants';
import { duckType } from '../utils';
import { StyledAnsi } from './ansi-parser';
import renderAnsi from './html-renderer';
import * as React from 'react';


export default class TerminalLine extends React.Component<ITerminalLineProps, ITerminalLineState> {

  shouldComponentUpdate() {
    return this.props.isLast;
  }


  render() {
    return duckType<ITerminalLinePropsAnsi>(this.props, 'ansi') ?
      this.renderAnsi(this.props.ansi) :
      this.renderString(this.props.content);
  }

  renderAnsi(ansi: StyledAnsi) {
    const content = renderAnsi(ansi);
    return <li className='amq-terminal-line' dangerouslySetInnerHTML={{ __html: content}} />;
  }

  renderString(value: string) {
    const content = value.replace(/ /g, NBSP);
    return <li className='amq-terminal-line'>{content || NBSP}</li>;
  }
}


type ITerminalLineProps = ITerminalLinePropsString | ITerminalLinePropsAnsi;

interface ITerminalLinePropsString extends ITerminalLinePropsBase {
  content: string;
}

interface ITerminalLinePropsAnsi extends ITerminalLinePropsBase {
  ansi: StyledAnsi;
}

interface ITerminalLinePropsBase {
  isLast?: boolean;
}


interface ITerminalLineState {

}
