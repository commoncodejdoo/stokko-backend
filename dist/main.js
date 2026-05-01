"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const global_exception_filter_1 = require("./presentation/common/filters/global-exception.filter");
const transform_decimal_interceptor_1 = require("./presentation/common/interceptors/transform-decimal.interceptor");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: false },
    }));
    app.useGlobalFilters(new global_exception_filter_1.GlobalExceptionFilter());
    app.useGlobalInterceptors(new transform_decimal_interceptor_1.TransformDecimalInterceptor());
    const port = Number(process.env.PORT ?? 3000);
    await app.listen(port);
    common_1.Logger.log(`Stokko API listening on http://localhost:${port}/api/v1`, 'Bootstrap');
}
void bootstrap();
//# sourceMappingURL=main.js.map