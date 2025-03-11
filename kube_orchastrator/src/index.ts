import express from "express";
import yaml from "yaml"
import fs from "fs"
import cors from "cors"
import path from "path"
import { KubeConfig, AppsV1Api, CoreV1Api, NetworkingV1Api } from "@kubernetes/client-node";

const app = express();
app.use(express.json());
app.use(cors());

const kubeconfig = new KubeConfig();
kubeconfig.loadFromDefault();
const coreV1Api = kubeconfig.makeApiClient(CoreV1Api);
const appsV1Api = kubeconfig.makeApiClient(AppsV1Api);
const networkingV1Api = kubeconfig.makeApiClient(NetworkingV1Api);

const readAndParseKubeYaml = (filePath: string, replId: string):Array<any> => {
    const fileContent = fs.readFileSync(filePath, "utf8")
    const docs = yaml.parseAllDocuments(fileContent).map((doc) => {
        let docString = doc.toString();
        const regex = new RegExp(`service_name`, 'g');
        docString = docString.replace(regex, replId);
        return yaml.parse(docString);
    })
    return docs;

}