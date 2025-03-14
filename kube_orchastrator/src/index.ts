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

app.post("/start"), async (req : any, res : any) => {
    const { userId, replId } = req.body;
    const namespace = "default";
    try {
        const kubeManifests = readAndParseKubeYaml(path.join(__dirname, "../service.yaml"), replId);
        for (const manifest of kubeManifests) {
            switch (manifest.kind) {
                case "Deployment":
                    await appsV1Api.createNamespacedDeployment({ namespace, body: manifest });
                    break;
                case "Service":
                    await coreV1Api.createNamespacedService({ namespace, body: manifest} );
                    break;
                case "Ingress":
                    await networkingV1Api.createNamespacedIngress({ namespace, body: manifest});
                    break;
                default:
                    console.log(`Unsupported kind: ${manifest.kind}`);
            }
        }
        res.status(200).send({ message: "Resources created successfully" });
    } catch (error) {
        console.error("Failed to create resources", error);
        res.status(500).send({ message: "Failed to create resources" });
    }


}

const port = process.env.PORT || 3002;
app.listen(port, () => {
    console.log(`Listening on port: ${port}`);
});