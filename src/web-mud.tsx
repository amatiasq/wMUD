import Terminal, { ITerminalCommandEvent } from './terminal';
import * as React from 'react';


export default class WebMud extends React.Component<IWebMudProps, IWebMudState> {

  constructor(props: IWebMudProps) {
    super(props);

    this.onTerminalCommand = this.onTerminalCommand.bind(this);

    this.state = { lines: [] };
  }


  render() {
    return (
      <Terminal
        content={this.state.lines}
        autoFocus
        onCommand={this.onTerminalCommand} />
    );
  }


  onTerminalCommand(event: ITerminalCommandEvent) {
    const lines = this.state.lines.slice();
    lines.push(event.text);
    this.setState({lines});
  }
}


interface IWebMudProps {

}


interface IWebMudState {
  lines: string[];
}
