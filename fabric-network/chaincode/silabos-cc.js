'use strict';

const { Contract } = require('fabric-contract-api');

class SyllabiContract extends Contract {

    // RegisterSyllabus - Registra un nuevo sílabo en el ledger
    async RegisterSyllabus(ctx, docID, courseID, fileName, fileType, fileSize,
                            fileHash, uploaderEmail, institutionName, action, timestamp) {
        const existing = await ctx.stub.getState(docID);
        if (existing && existing.length > 0) {
            throw new Error(`docID '${docID}' ya existe en el ledger`);
        }

        const record = {
            docID,
            courseID,
            fileName,
            fileType,
            fileSize: parseInt(fileSize) || 0,
            fileHash,
            uploaderEmail,
            institutionName,
            action,
            timestamp,
            blockchainTime: new Date().toISOString(),
        };

        await ctx.stub.putState(docID, Buffer.from(JSON.stringify(record)));
        return JSON.stringify(record);
    }

    // GetSyllabus - Lee un registro por docID
    async GetSyllabus(ctx, docID) {
        const data = await ctx.stub.getState(docID);
        if (!data || data.length === 0) {
            throw new Error(`docID '${docID}' no encontrado`);
        }
        return JSON.parse(data.toString());
    }

    // VerifyHash - Verifica si el hash coincide con el registrado
    async VerifyHash(ctx, docID, fileHash) {
        const record = await this.GetSyllabus(ctx, docID);
        return String(record.fileHash === fileHash);
    }

    // GetSyllabiByourse - Consulta todos los sílabos de un curso (rich query CouchDB)
    async GetSyllabiByourse(ctx, courseID) {
        const query = JSON.stringify({ selector: { courseID } });
        const iterator = await ctx.stub.getQueryResult(query);

        const results = [];
        let result = await iterator.next();
        while (!result.done) {
            results.push(JSON.parse(result.value.value.toString()));
            result = await iterator.next();
        }
        await iterator.close();
        return results;
    }

    // GetAllSyllabi - Devuelve todos los sílabos (range query)
    async GetAllSyllabi(ctx) {
        const iterator = await ctx.stub.getStateByRange('', '');
        const results = [];
        let result = await iterator.next();
        while (!result.done) {
            try {
                results.push(JSON.parse(result.value.value.toString()));
            } catch (_) { /* skip non-JSON */ }
            result = await iterator.next();
        }
        await iterator.close();
        return results;
    }
}

module.exports = SyllabiContract;
