const { ApolloServer } = require('apollo-server-express');
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core');
const express = require('express');
const http = require('http');
const {UWProskomma, typeDefs, resolvers} = require('uw-proskomma');
const {thaw} = require('proskomma-freeze');
const { nt_ebible_27book } = require('proskomma-frozen-archives');

async function startApolloServer(typeDefs, resolvers) {
    const PORT = 2468;
    const app = express();
    const httpServer = http.createServer(app);
    const pk = new UWProskomma();
    thaw(pk, nt_ebible_27book);
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
