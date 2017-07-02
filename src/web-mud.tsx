import Readable from './stream/readable';
import Terminal, { ITerminalCommandEvent } from './terminal';
import AnsiParser from './terminal/ansi-parser';
import * as React from 'react';
import * as socketIo from 'socket.io-client';


export default class WebMud extends React.Component<IWebMudProps, IWebMudState> {

  private stdin: SocketIOClient.Socket;
  private stdout: Readable<string>;
  private stderr: Readable<string>;


  constructor(props: IWebMudProps) {
    super(props);

    this.onTerminalCommand = this.onTerminalCommand.bind(this);
    this.state = { content: '' };

    const socket = this.stdin = socketIo.connect('http://localhost:3001');
    const close = Readable.fromEvent<number>(socket, 'close', 1).subscribe(code => console.log(`[EXIT] ${code}`));
    this.stdout = Readable.fromEvent<string>(socket, 'stdout').takeUntil(close);
    this.stderr = Readable.fromEvent<string>(socket, 'stderr').takeUntil(close);
  }


  render() {
    return (
      <Terminal
        stdout={this.stdout}
        stderr={this.stderr}
        autoFocus
        onCommand={this.onTerminalCommand} />
    );
  }


  onTerminalCommand(event: ITerminalCommandEvent) {
    this.stdin.emit('stdin', event.text + '\n');
  }
}


interface IWebMudProps {

}


interface IWebMudState {
  content: string;
}
