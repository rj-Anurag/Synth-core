
import { TerminalManager } from "./terminal";
import {Server as HttpServer} from "http";
import {Server, Socket} from "socket.io";
import { fetchDirData, fetchFileData, saveFileData } from "./file";
import { saveToS3 } from "./s3";



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
        initHandlers(socket, replId);
    })
}
function initHandlers(socket: Socket, replId : string) {
    socket.on("disconnect", () => {
        console.log("User Disconnected");
    })
    socket.on("fetchDir", async (dir: string, callback) => {
        const dirPath = `/workspace/${dir}`;
        const contents = await fetchDirData(dirPath, dir);
        callback(contents);
    });

    socket.on("fetchContent", async ({ path: filePath }: { path: string }, callback) => {
        const fullPath = `/workspace/${filePath}`;
        const data = await fetchFileData(fullPath);
        callback(data);
    });
    socket.on("updateContent", async ({ path: filePath, content }: { path: string, content: string }) => {
        const fullPath =  `/workspace/${filePath}`;
        await saveFileData(fullPath, content);
        await saveToS3(`code/${replId}`, filePath, content);
    });

    socket.on("requestTerminal", async () => {
        terminalManager.createPty(socket.id, replId, (data, id) => {
            socket.emit('terminal', {
                data: Buffer.from(data,"utf-8")
            });
        });
    });

    socket.on("terminalData", async ({ data }: { data: string, terminalId: number }) => {
        terminalManager.write(socket.id, data);
    });


}