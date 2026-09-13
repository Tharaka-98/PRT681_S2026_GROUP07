const BASE_URL = "http://localhost:5044/api"; // update to match your MultiApi's actual port

async function handleResponse(response) {
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Request failed: ${response.status}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

export function createApiClient(resource) {
  const url = `${BASE_URL}/${resource}`;

  return {
    getAll: () => fetch(url).then(handleResponse),
    getById: (id) => fetch(`${url}/${id}`).then(handleResponse),
    create: (item) =>
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      }).then(handleResponse),
    update: (id, item) =>
      fetch(`${url}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      }).then(handleResponse),
    remove: (id) =>
      fetch(`${url}/${id}`, { method: "DELETE" }).then(handleResponse),
  };
}

export const productsApi = createApiClient("products");
export const employeesApi = createApiClient("employees");
export const booksApi = createApiClient("books");
