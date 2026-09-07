import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const CurrentUser = createParamDecorator((data: string | undefined, ctx: ExecutionContext) => {
  // Check if context is GraphQL
  if ((ctx.getType() as string) === 'graphql') {
    const gqlCtx = GqlExecutionContext.create(ctx);
    const user = gqlCtx.getContext().req?.user;
    return data ? user?.[data] : user;
  }

  // REST context
  const request = ctx.switchToHttp().getRequest();
  return data ? request.user?.[data] : request.user;
});
