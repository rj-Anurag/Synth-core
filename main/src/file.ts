import fs from "fs"

interface File {
    type: "file" | "dir"
    name: string
}

export const fetchDirData = (dir: string, baseDir: string): Promise<File[]> => {
    return new Promise((resolve, reject) => {
        fs.readdir(dir, {withFileTypes : true} , (err, files) => {
            if(err) {
                reject(err)
            } else{
                resolve(files.map(file => ({type: file.isDirectory() ? "dir" : "file", name: file.name, path: `${baseDir}/${file.name}` })));
            }

        });
    });

}

export const fetchFileData = (file: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        fs.readFile(file, "utf8" , (err, data) => {
            if(err) {
                reject(err)
            } else{
                resolve(data);
            }

        });
    });

}

export const saveFileData = (file: string, content: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        fs.writeFile(file, content, "utf8",  (err) => {
            if(err) {
                reject(err)
            } else{
                resolve();
            }

        });
    });

}

