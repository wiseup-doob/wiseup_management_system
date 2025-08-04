export const setCorsHeaders = (response: any): void => {
  response.set("Access-Control-Allow-Origin", "*");
  response.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  response.set("Access-Control-Max-Age", "86400");
};

export const handleOptionsRequest = (response: any): boolean => {
  if (response.req.method === "OPTIONS") {
    response.status(204).send("");
    return true;
  }
  return false;
}; 