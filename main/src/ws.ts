
import { TerminalManager } from "./terminal";
import {Server as HttpServer} from "http";
import {Server, Socket} from "socket.io";
import { fetchDirData, fetchFileContent, saveFile } from "./file";


const terminalManager = new TerminalManager();

export function initWs(httpServer: HttpServer) {
    const io = new Server(httpServer, {
        cors : {
            origin:"",
            methods:["GET", "POST"]
        }
    })
    io.on("connection", async (socket) => {
        const host = socket.handshake.headers.host;
        console.log(`host is: ${host}`);

        const replId = host?.split('.')[0];
        if(!replId) {
            socket.disconnect();
            terminalManager.clear(socket.id);
            return;
        }
        socket.emit("loaded", {
            rootContent: await fetchDirData("/workspace", "")
        });

    })
}