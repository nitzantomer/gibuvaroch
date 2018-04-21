import * as crypto from "crypto";
import * as fs from "fs";
import * as _ from "lodash";

const privateStorageKey = _.trim(fs.readFileSync(`${__dirname}/../storage-keys/key`).toString());
const privateStorageKeyIv = _.trim(fs.readFileSync(`${__dirname}/../storage-keys/iv`).toString());

const DOCUMENTS_PATH = `${__dirname}/../documents`;
const ENCRYPTED_DOCUMENTS_PATH = `${__dirname}/../encrypted-documents`;

fs.readdirSync(DOCUMENTS_PATH).forEach(documentName => {
    const contents = fs.readFileSync(`${DOCUMENTS_PATH}/${documentName}`);
    const cypher = crypto.createCipheriv("aes192", privateStorageKey, privateStorageKeyIv);
    const encryptedContents = Buffer.concat([cypher.update(contents), cypher.final()]);

    fs.writeFileSync(`${ENCRYPTED_DOCUMENTS_PATH}/${documentName}`, encryptedContents);
});
