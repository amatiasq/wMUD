import TerminalInput, { ITerminalInputChangeEvent } from './terminal-input';
import TerminalLine from './terminal-line';
import * as React from 'react';


export default class Terminal extends React.Component<ITerminalProps, ITerminalState> {

  private input: TerminalInput;
  private log: HTMLUListElement;
  private isScrollBottom: boolean;


  constructor(props: ITerminalProps) {
    super(props);

    this.onSubmit = this.onSubmit.bind(this);
    this.afterRender = this.afterRender.bind(this);
    this.onLogScroll = this.onLogScroll.bind(this);
    this.onRootClick = this.onRootClick.bind(this);
  }


  componentWillMount() {
    this.setState({lines: this.props.content});
  }

  componentWillReceiveProps(props: ITerminalProps) {
    this.setState({lines: props.content});
  }


  render() {
    const {lines} = this.state;

    const log = lines.map((line, index) => {
      const isLast = index === lines.length - 1;

      return (
        <TerminalLine
          key={index}
          content={line}
          isLast={isLast} />
      );
    });

    requestAnimationFrame(this.afterRender);

    return (
      <div className='amq-terminal' onClick={this.onRootClick}>
        <ul
          ref={(ref) => this.log = ref}
          className='amq-terminal-log'
          onScroll={this.onLogScroll}>

          <li className='first' />
          {log}
        </ul>

        <TerminalInput
          ref={(ref) => this.input = ref}
          autoFocus={this.props.autoFocus}
          onSubmit={this.onSubmit} />
      </div>
    );
  }

  private afterRender() {
    if (!this.isScrollBottom) {
      this.log.scrollTop = this.log.scrollHeight;
    }
  }


  private onSubmit(event: ITerminalInputChangeEvent) {
    this.props.onCommand(event);
  }

  private onRootClick(event: React.MouseEvent<HTMLDivElement>) {
    this.input.focus();
  }

  private onLogScroll(event: React.UIEvent<HTMLUListElement>) {
    const {scrollTop, scrollHeight, clientHeight} = this.log;
    console.log(scrollTop, scrollHeight - clientHeight, scrollHeight, clientHeight);
    this.isScrollBottom = scrollTop === scrollHeight - clientHeight;
  }
}


interface ITerminalProps {
  content: string[];
  autoFocus: boolean;
  onCommand(event: ITerminalCommandEvent): void;
}


interface ITerminalState {
  lines: string[];
}


export interface ITerminalCommandEvent {
  text: string;
}
