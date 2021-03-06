import {Arg, Ctx, Int, Query, Resolver, Mutation} from "type-graphql";
import {Post} from "../entities/Posts";
import {MyContext} from "../types";


@Resolver()
export class PostResolver{
    @Query(()=>[Post])
    posts(@Ctx() {em}: MyContext): Promise<Post[]>{
        return em.find(Post, {});
    }

    @Query(()=>Post)
    post(
        @Arg('input_id', ()=> Int) id: number,
        @Ctx() {em}: MyContext): Promise<Post | null>{
        return em.findOne(Post, {id});
    }

    @Mutation(()=>Post)
    async createPost(
        @Arg('input_title') title: string,
        @Ctx() {em}: MyContext): Promise<Post>{
        const post = em.create(Post, {title: title, createdAt: new Date(), updatedAt: new Date()})
        await em.persistAndFlush(post);
        return post;
    }

    @Mutation(()=>Post)
    async updatePost(
        @Arg('input_id') id: number,
        @Arg('input_title') title: string,
        @Ctx() {em}: MyContext): Promise<Post | null>{
        const post = await em.findOne(Post, {id});
        if(!post){
            return null;
        }
        if(typeof title !== 'undefined'){
            post.title = title;
            await em.persistAndFlush(post);
        }
        return post;
    }

    @Mutation(()=>Boolean)
    async deletePost(
        @Arg('input_id') id: number,
        @Ctx() {em}: MyContext): Promise<boolean>{
        try{
            await em.nativeDelete(Post, {id});
            return true
        }catch(err){
            return false;
        }

    }

}