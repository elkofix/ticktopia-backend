import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const RawHeaders = createParamDecorator(
    (context: ExecutionContext) =>{
        console.log("llegas");
        const req = context.switchToHttp().getRequest();
                console.log("llegasss");

        return req.rawHeaders;
    }
)