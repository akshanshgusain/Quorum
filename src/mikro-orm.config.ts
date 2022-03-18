import {Post} from "./entities/Posts";
import {__prod__} from "./constants";
import{MikroORM} from "@mikro-orm/core";
import path from "path";
import {User} from "./entities/User";

export default {
    migrations: {
        path: path.join(__dirname, "./migrations"),
        glob: '!(*.d).{js,ts}',
    },
    entities: [Post, User],
    dbName: 'reddit',
    type: 'postgresql',
    user: 'postgres',
    password: '9654829994',
    debug: !__prod__,
    allowGlobalContext: true
} as Parameters<typeof MikroORM.init>[0];