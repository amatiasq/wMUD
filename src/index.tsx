// tslint:disable-next-line:no-import-side-effect
import './index.scss';

import WebMud from './web-mud';
import * as ReactDOM from 'react-dom';
import * as React from 'react';


ReactDOM.render(
  <WebMud />,
  document.querySelector('#main-container'),
  () => {/* */},
);


// tslint:disable
declare global {
    interface Window {
      log: Function;
    }
}
// tslint:enable
