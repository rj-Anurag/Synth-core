import fs, { writeFile } from "fs"
import path from "path"
import { S3 } from "aws-sdk"

const s3 = new S3 ( {
    accessKeyId :  process.env.S3_ACCESS_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    endpoint: process.env.S3_ENDPOINT
})

export const getS3Folder =  async(key: string, localPath : string): Promise<void> => {
    const params = {
        Bucket: process.env.S3_BUCKET ?? " ",
        Prefix: key
    }

    const response = await s3.listObjectsV2(params).promise();
    if(response.Contents) {
        for(const file of response.Contents){
            const fileKey = file.Key
            if(fileKey){
                const params = {
                    Bucket: process.env.S3_BUCKET ?? " ",
                    Key: fileKey
                }
                const data = await s3.getObject(params).promise();
                if(data.Body){
                    const fileData = data.Body
                    const filePath = `${localPath}/${fileKey.replace(key, "")}`
                    //@ts-ignore
                    await writeFile(filePath, fileData);
                }
            }
        }
    }
}