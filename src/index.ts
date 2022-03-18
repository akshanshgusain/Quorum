import {MikroORM} from "@mikro-orm/core";
import mikroOrmConfig from "./mikro-orm.config";
import express, {Request, Response} from "express";
import {ApolloServer} from "apollo-server-express";
import {buildSchema} from "type-graphql";
import {HelloResolver} from "./resolvers/hello";
import {PostResolver} from "./resolvers/post";
import {UserResolver} from "./resolvers/user";
// import 'reflect-metadata';
import {createClient} from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import {__prod__} from "./constants";
import {MyContext} from "./types";

const main = async () => {
    // MikroORM setup
    const orm = await MikroORM.init(mikroOrmConfig);
    await orm.getMigrator().up();

    // Express App
    const app = express();
    app.set("trust proxy", true);
    // app.set("Access-Control-Allow-Origin", "*");
    // app.set("Access-Control-Allow-Credentials", true);

    // Redis Client Setup
    const RedisStore = connectRedis(session);
    //const redisURL = "redis://localhost:6379";
    //{socket:{host:"127.0.0.1",port: 6379}}
    //const redisClient = createClient({socket:{host:'localhost',port: 6379}});
    const redisClient = createClient();
    redisClient.on('error', (err) => console.log('Redis Client Error', err));
    await redisClient.connect();
    // await redisClient.set('key', 'value');
    // const value = await redisClient.get('key');
    // console.log(value);


    app.use(session({
        name: 'qid',
        store: new RedisStore({
            // @ts-ignore
            client: redisClient,
            disableTouch: true
        }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 365 * 10, /// 10 years
            // httpOnly: true,
            sameSite: "none", // csrf protection
            secure: true //only works in https
        },
        saveUninitialized: false,
        secret: "o3i4ntk#^fwergRM*55n3",
        resave: false
    }));


    // Apollo Server Setup
    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false,
        }),
        context: ({req, res}): MyContext => {
            res.header(
                "Access-Control-Allow-Origin",
                "https://studio.apollographql.com");
            res.header("Access-Control-Allow-Credentials", "true");
            res.header("x-forwarded-proto", "https");
            return ({em: orm.em, req, res})
        }

    });

    await apolloServer.start();
    apolloServer.applyMiddleware({
        app,
        cors: {origin: true, credentials: true, allowedHeaders: ['Content-Type', 'Authorization']}
    });

    console.log("asd");
    app.get("/", (_: Request, res: Response) => {
        res.send("Home");
    });
    app.listen(4000, () => {
        console.log("listening on port 4000!");
    });
};

main();
