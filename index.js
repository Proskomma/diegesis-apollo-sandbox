const path = require('path');
const fse = require('fs-extra');
const { ApolloServer } = require('apollo-server-express');
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core');
const express = require('express');
const http = require('http');
const { Proskomma, typeDefs, resolvers } = require('proskomma-core');
// const {thaw} = require('proskomma-freeze');
// const { nt_ebible_27book } = require('proskomma-frozen-archives');

async function startApolloServer(typeDefs, resolvers) {
    const PORT = 2468;
    const app = express();
    const httpServer = http.createServer(app);
    const pk = new Proskomma([
        {
            name: "source",
            type: "string",
            regex: "^[^\\s]+$"
        },
        {
            name: "project",
            type: "string",
            regex: "^[^\\s]+$"
        },
        {
            name: "revision",
            type: "string",
            regex: "^[^\\s]+$"
        },
    ]);
    if (process.argv.length !== 3) {
        console.error("That's an error");
        process.exit(1);
    } else {
        for (const file of fse.readdirSync(path.resolve(process.argv[2]))) {
            console.log(`Loading ${file}`);
            pk.loadSuccinctDocSet(
                fse.readJsonSync(
                    path.join(
                        path.resolve(process.argv[2],
                            file
                        )
                    )
                )
            );
        }
    }
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        rootValue: pk,
        plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    });
    await server.start();
    server.applyMiddleware({ app });
    await new Promise(resolve => httpServer.listen({ port: 2468 }, resolve));
    console.log(`🚀 Server ready at http://localhost:2468${server.graphqlPath}`);
}

const pk =
startApolloServer(typeDefs, resolvers);
