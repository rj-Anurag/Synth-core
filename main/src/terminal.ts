
import {IPty, fork} from "node-pty"
import path from "path"

const SHELL = "bash"
export class TerminalManager {
    private session : {[id : string] : {terminal: IPty, replId : string; }} = {};
    constructor () {
        this.session = {};

    }
    createPty(id: string, replId: string, onData: (data: string, id: number) => void) {
        let term = fork(SHELL, [], {
            cols: 100,
            name: 'xterm',
            cwd: `/workspace`
        });
    term.on('data', (data: string) => onData(data, term.pid));
    this.session[id] = {
        terminal: term,
        replId
    }
    term.on('exit', () => {
        delete this.session[term.pid];
    })
    return term;
}
    write(terminalId: string, data:string) {
        this.session[terminalId]?.terminal.write(data);
    }
    clear(terminalId: string) {
        this.session[terminalId].terminal.kill();
        delete this.session[terminalId];
    }

}