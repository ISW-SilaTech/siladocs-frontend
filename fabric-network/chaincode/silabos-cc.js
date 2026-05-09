'use strict';

const { Contract } = require('fabric-contract-api');
const shim = require('fabric-shim');

class SyllabiContract extends Contract {

    async RegisterSyllabus(ctx, docID, courseID, fileName, fileType, fileSize,
                            fileHash, uploaderEmail, institutionName, action, timestamp) {
        const existing = await ctx.stub.getState(docID);
        if (existing && existing.length > 0) {
            throw new Error(`docID '${docID}' ya existe en el ledger`);
        }

        const record = {
            docID, courseID, fileName, fileType,
            fileSize: parseInt(fileSize) || 0,
            fileHash, uploaderEmail, institutionName,
            action, timestamp,
            blockchainTime: new Date().toISOString(),
        };

        await ctx.stub.putState(docID, Buffer.from(JSON.stringify(record)));
        return JSON.stringify(record);
    }

    async GetSyllabus(ctx, docID) {
        const data = await ctx.stub.getState(docID);
        if (!data || data.length === 0) {
            throw new Error(`docID '${docID}' no encontrado`);
        }
        return data.toString();
    }

    async VerifyHash(ctx, docID, fileHash) {
        const data = await ctx.stub.getState(docID);
        if (!data || data.length === 0) return 'false';
        const record = JSON.parse(data.toString());
        return String(record.fileHash === fileHash);
    }

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
        return JSON.stringify(results);
    }

    async GetAllSyllabi(ctx) {
        const iterator = await ctx.stub.getStateByRange('', '');
        const results = [];
        let result = await iterator.next();
        while (!result.done) {
            try {
                results.push(JSON.parse(result.value.value.toString()));
            } catch (_) {}
            result = await iterator.next();
        }
        await iterator.close();
        return JSON.stringify(results);
    }
}

// CCaaS mode (External Chaincode) - runs as standalone Docker service
async function main() {
    const ccid = process.env.CHAINCODE_ID;
    const addr = process.env.CHAINCODE_SERVER_ADDRESS;

    if (!ccid || !addr) {
        console.error('CHAINCODE_ID and CHAINCODE_SERVER_ADDRESS must be set');
        process.exit(1);
    }

    const server = shim.server(new SyllabiContract(), {
        ccid,
        address: addr,
    });

    await server.start();
    console.log(`✅ Chaincode server started`);
    console.log(`   CCID:    ${ccid}`);
    console.log(`   Address: ${addr}`);
}

if (require.main === module) {
    main().catch((err) => {
        console.error('Fatal error:', err);
        process.exit(1);
    });
}

module.exports = SyllabiContract;
