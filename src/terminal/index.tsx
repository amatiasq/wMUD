import Readable from '../stream/readable';
import StreamSubscription from '../stream/subscription';
import { duckType } from '../utils';
import AnsiParser, { StyledAnsi } from './ansi-parser';
import TerminalInput, { ITerminalInputChangeEvent } from './terminal-input';
import TerminalLine from './terminal-line';
import * as React from 'react';


export default class Terminal extends React.Component<ITerminalProps, ITerminalState> {

  private input: TerminalInput;
  private log: HTMLUListElement;
  private isScrollBottom: boolean;
  private subscription: StreamSubscription;
  private source: Readable<StyledAnsi>;
  private isMouseMoving: boolean;


  constructor(props: ITerminalProps) {
    super(props);

    this.onSubmit = this.onSubmit.bind(this);
    this.afterRender = this.afterRender.bind(this);
    this.onLogScroll = this.onLogScroll.bind(this);
    this.onRootMouseUp = this.onRootMouseUp.bind(this);
    this.onRootMouseDown = this.onRootMouseDown.bind(this);
    this.onRootMouseMove = this.onRootMouseMove.bind(this);

    this.state = {lines: []};
  }


  componentWillMount() {
    this.setContent(this.props);
  }

  componentWillReceiveProps(props: ITerminalProps) {
    this.setContent(props);
  }

  setContent(props: ITerminalProps) {
    const {stdout, stderr} = props;

    if (stdout === this.state.stdout && stderr === this.state.stderr) {
      return;
    }

    this.setState({stdout, stderr});
    this.readSource(stdout, stderr);
  }

  private readSource(stdout: Readable<string>, stderr: Readable<string>) {
    const parser = new AnsiParser();
    const lines = [[]] as StyledAnsi[];

    this.subscription = Readable
      .merge(stdout, stderr)
      .flatMap(value => parser.parse(value))
      .debounce(100)
      .subscribe(values => {
        values.forEach(value => {
          if (value === '\n') {
            lines.push([]);
          } else {
            lines[lines.length - 1].push(value);
          }

          this.setState({lines});
        });
      });
  }


  render() {
    const {lines} = this.state;

    const log = lines.map((line, index) => {
      const isLast = index === lines.length - 1;

      return (
        <TerminalLine
          key={index}
          ansi={line}
          isLast={isLast} />
      );
    });

    requestAnimationFrame(this.afterRender);

    return (
      <div
        className='amq-terminal'
        onMouseDown={this.onRootMouseDown}
        onMouseMove={this.onRootMouseMove}
        onMouseUp={this.onRootMouseUp}>
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

  private onRootMouseDown(event: React.MouseEvent<HTMLDivElement>) {
    this.isMouseMoving = false;
  }

  private onRootMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    this.isMouseMoving = true;
  }

  private onRootMouseUp(event: React.MouseEvent<HTMLDivElement>) {
    if (!this.isMouseMoving)
      this.input.focus();
  }

  private onLogScroll(event: React.UIEvent<HTMLUListElement>) {
    const {scrollTop, scrollHeight, clientHeight} = this.log;
    console.log(scrollTop, scrollHeight - clientHeight, scrollHeight, clientHeight);
    this.isScrollBottom = scrollTop === scrollHeight - clientHeight;
  }
}


interface ITerminalProps {
  stdout: Readable<string>;
  stderr: Readable<string>;
  autoFocus: boolean;
  onCommand(event: ITerminalCommandEvent): void;
}


interface ITerminalState {
  stdout?: Readable<string>;
  stderr?: Readable<string>;
  lines: StyledAnsi[];
}


export interface ITerminalCommandEvent {
  text: string;
}
