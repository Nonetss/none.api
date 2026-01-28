import { jsonSchemaToTypeScript } from "@/services/openapi/schema-utils.js";

export function getHumanName(op: any, method: string, path: string): string {
  if (op.operationId) return op.operationId.replace(/[^a-zA-Z0-9]/g, "_");

  const parts = path.split("/").filter((p) => p && !p.startsWith("{"));
  const resource = parts.length > 0 ? parts[parts.length - 1] : "resource";
  const action = method.toLowerCase();

  const name = `${action}_${resource}`.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
  return name;
}

export function getFrameworkSnippet(
  path: string,
  method: string,
  framework: "axios" | "tanstack-query",
  op: any
): string {
  const humanName = getHumanName(op, method, path);
  const operationName = humanName.charAt(0).toUpperCase() + humanName.slice(1);
  const hasBody = ["POST", "PUT", "PATCH"].includes(method.toUpperCase());

  let types = "";
  const reqSchema = op.requestBody?.content?.["application/json"]?.schema;
  const resSchema =
    op.responses?.["200"]?.content?.["application/json"]?.schema ||
    op.responses?.["201"]?.content?.["application/json"]?.schema;

  if (reqSchema) types += jsonSchemaToTypeScript(reqSchema, `${operationName}Request`) + "\n";
  if (resSchema) types += jsonSchemaToTypeScript(resSchema, `${operationName}Response`) + "\n";

  const reqType = reqSchema ? `${operationName}Request` : "any";
  const resType = resSchema ? `${operationName}Response` : "any";

  const errorHandling = `catch (error) {
    console.error('Error in ${humanName}:', error);
    throw error;
  }`;

  if (framework === "axios") {
    return (
      `${types}` +
      `import axios from 'axios';

export const ${humanName} = async (data: ${reqType}): Promise<${resType}> => {
  try {
    const response = await axios({
      method: '${method.toLowerCase()}',
      url: 
` +
      `
      ${hasBody ? "data," : "params: data,"}
    });
    return response.data;
  } 
${errorHandling}
};`
    );
  }

  if (framework === "tanstack-query") {
    const isMutation = hasBody || method.toUpperCase() === "DELETE";
    if (isMutation) {
      return (
        `${types}` +
        `import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export const use${operationName} = () => {
  const queryClient = useQueryClient();
  return useMutation<${resType}, Error, ${reqType}>({
    mutationFn: async (data) => {
      const response = await axios.${method.toLowerCase()}(
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries();
    },
    onError: (error) => {
      console.error('Mutation failed:', error);
    }
  });
};
`
      );
    } else {
      return (
        `${types}` +
        `import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export const use${operationName} = (params: ${reqType}) => {
  return useQuery<${resType}, Error>({
    queryKey: ['${humanName}', params],
    queryFn: async () => {
      const response = await axios.get(
      return response.data;
    },
    retry: 1,
  });
};
`
      );
    }
  }
  return "";
}
