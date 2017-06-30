import { NBSP } from '../constants';
import * as React from 'react';


export default class TerminalLine extends React.Component<ITerminalLineProps, ITerminalLineState> {

  shouldComponentUpdate() {
    return this.props.isLast;
  }


  render() {
    const content = this.props.content.replace(/ /g, NBSP);
    return <li className='amq-terminal-line'>{content || NBSP}</li>;
  }
}


interface ITerminalLineProps {
  content: string;
  isLast?: boolean;
}


interface ITerminalLineState {

}
