import {Arg, Ctx, Resolver, Mutation, InputType, Field, ObjectType} from "type-graphql";
import {MyContext} from "../types";
import {User} from "../entities/User";
import argon2 from 'argon2';


@InputType()
class UsernamePasswordInput {
    @Field()
    username: string
    @Field()
    password: string
}

@ObjectType()
class FieldError {
    @Field()
    field: string

    @Field()
    message: string
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], {nullable: true})
    errors?: FieldError[]

    @Field(() => User, {nullable: true})
    user?: User
}

@Resolver()
export class UserResolver {
    @Mutation(() => UserResponse)
    async register(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() {em}: MyContext): Promise<UserResponse> {
        if(options.password.length < 3 || options.password.length > 12){
            return {
                errors: [{field:"password", message:"Password length must be between 4 to 12 chars"}]
            }
        }
        const hashedPassword = await argon2.hash(options.password)
        try{
            // @ts-ignore
            const user = em.create(User, {username: options.username, password: hashedPassword})
            await em.persistAndFlush(user);
            return {user}
        }catch (e) {
            return {
                errors: [{field: "username", message: "username taken"}]
            }
        }



    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() {em, req}: MyContext): Promise<UserResponse> {
        const user = await em.findOne(User, {username: options.username.toLowerCase()})
        if (!user) {
            return {
                errors: [
                    {
                        field: 'username',
                        message: "this user does not exist"
                    },
                ],
            }
        }

        const valid = await argon2.verify(user.password, options.password)

        if (!valid) {
            return {
                errors: [
                    {
                        field: 'password',
                        message: "incorrect password"
                    },
                ],
            }
        }
        // Get request from context and create session
        //req.session!.userId = user.id;

        console.log(req.session)
        return {
            user,
        }
    }
}


