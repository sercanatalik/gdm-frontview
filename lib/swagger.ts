import { createSwaggerSpec } from "next-swagger-doc";
import { cookies } from 'next/headers';

export const getApiDocs = async () => {
  const cookieStore = cookies();
  const apiKey = cookieStore.get('api_key')?.value;

  const spec = createSwaggerSpec({
    apiFolder: "app/api", // define api folder under app folder
    definition: {
      openapi: "3.0.0",
      info: {
        title: "GDM API Specs",
        version: "1.0",
      },
      components: {
        securitySchemes: {
          apiKey: {
            type: 'apiKey',
            in: 'header',
            name: 'X-API-Key',
          },
        },
      },
      security: apiKey ? [{ apiKey: [] }] : [],
    },
  });
  return spec;
};