import { NBSP } from '../constants';
import * as React from 'react';


export default class TerminalInput extends React.Component<ITerminalInputProps, ITerminalInputState> {

  static defaultState() {
    return {
      before: '',
      selected: '',
      after: '',
    };
  }


  private element: HTMLInputElement;


  constructor(props: ITerminalInputProps) {
    super(props);

    this.onKeyPress = this.onKeyPress.bind(this);
    this.onKeyAction = this.onKeyAction.bind(this);
    this.setReference = this.setReference.bind(this);

    this.state = TerminalInput.defaultState();
  }


  render() {
    return (
      <div className='amq-terminal-input amq-terminal-box'>
        <span className='amq-terminal-before-cursor'>{this.state.before}</span>
        <span className='amq-terminal-cursor'>{this.state.selected || NBSP}</span>
        <span className='amq-terminal-before-cursor'>{this.state.after}</span>

        <input
          ref={this.setReference}
          className='amq-terminal-real-input'
          autoFocus={this.props.autoFocus}
          onInput={this.onKeyAction}
          onKeyDown={this.onKeyAction}
          onKeyUp={this.onKeyAction}
          onKeyPress={this.onKeyPress} />
      </div>
    );
  }


  focus() {
    this.element.focus();
  }


  private onKeyPress(event: React.KeyboardEvent<HTMLInputElement>) {
    const text = this.element.value;

    this.updateCaret();

    if (event.key === 'Enter') {
      this.setState(TerminalInput.defaultState());
      this.props.onSubmit({text});
      this.element.value = '';
    }
  }

  private onKeyAction(event: React.KeyboardEvent<HTMLInputElement>) {
    this.updateCaret();
  }

  private updateCaret() {
    const text = this.element.value.replace(/ /g, NBSP);
    const start = this.element.selectionStart;
    let end = this.element.selectionEnd;

    if (end !== text.length && end === start) {
      end++;
    }

    const after = text.substring(end);
    const selected = text.substring(start, end);
    const before = text.substring(0, start);

    if (
      this.state.before === before &&
      this.state.selected === selected &&
      this.state.after === after
    ) {
      return;
    }

    this.setState({before, selected, after});

    if (this.props.onChange) {
      this.props.onChange({text});
    }
  }


  private setReference(reference: HTMLInputElement) {
    this.element = reference;
  }
}


interface ITerminalInputProps {
  autoFocus: boolean;

  onChange?(event: ITerminalInputChangeEvent): void;
  onSubmit(event: ITerminalInputChangeEvent): void;
}


interface ITerminalInputState {
  before: string;
  selected: string;
  after: string;
}


export interface ITerminalInputChangeEvent {
  text: string;
}
