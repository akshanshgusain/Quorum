import {Query, Resolver} from "type-graphql";


@Resolver()
export class HelloResolver{
    @Query(()=>String)
    hello(){
        return "Hello World 9000!";
    }
}