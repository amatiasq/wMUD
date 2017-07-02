import {server} from './server';
import {spawn} from 'child_process';
import {platform} from 'os';
import * as socketIO from 'socket.io';


export const io = socketIO.listen(server);
const isMac = platform() === 'darwin';


const special: ISpecialChars = {
  ENTER: '\n',
  TAB: '\t',
  BACKSPACE: '\b',
  ESCAPE: String.fromCharCode(27),
  FILE_END: String.fromCharCode(3),
};


io.sockets.on('connection', socket => {
  const shell = createShell();


  shell.on('close', code => socket.emit('closed', code));
  socket.on('disconnect', () => shell.stdin.write('\nexit\n'));
  shell.stdout.on('data', data => {
    console.log('[STDOUT]');
    console.dir(data);
    socket.emit('stdout', data);
  });


  socket.on('stdin', (data: string) => {
    if (special.hasOwnProperty(data))
      data = special[data];

    console.log('[STDIN]', data.charCodeAt(0), data);
    shell.stdin.write(data);

    if (isMac)
      socket.emit('stdout', data);
  });


  shell.stderr.on('data', data => {
    console.log('[STDERR]');
    console.dir(data);

    if (data.slice(0, 8) === '\x1b[?1034h')
      data = data.slice(8);

    // console.log('[STDERR]', data);
    socket.emit('stderr', data);
  });
});


function createShell() {
  const shell = spawn('bash', [ '-i' ]);
  shell.stdout.setEncoding('utf8');
  shell.stderr.setEncoding('utf8');
  // var intro = 'alias ssh="ssh -t -t"\n';
  // shell.stdin.write(intro);
  return shell;
}


interface ISpecialChars {
  [id: string]: string;
}
