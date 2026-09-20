const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface Book {
  id: number;
  title: string;
  authorId: number;
  genre: string;
  price: number;
  stock: number;
  coverColor?: string;
}

export interface Author {
  id: number;
  name: string;
  bio?: string;
  country: string;
}

export interface Review {
  id: number;
  bookId: number;
  reviewerName: string;
  rating: number;
  comment?: string;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null as T;
  return res.json();
}

function createClient<T extends { id: number }>(resource: string) {
  const url = `${BASE_URL}/${resource}`;
  return {
    getAll: (): Promise<T[]> => fetch(url, { cache: "no-store" }).then((r) => handleResponse<T[]>(r)),
    getById: (id: number): Promise<T> => fetch(`${url}/${id}`, { cache: "no-store" }).then((r) => handleResponse<T>(r)),
    create: (item: Omit<T, "id">): Promise<T> =>
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      }).then((r) => handleResponse<T>(r)),
    update: (id: number, item: Partial<T>): Promise<void> =>
      fetch(`${url}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      }).then((r) => handleResponse<void>(r)),
    remove: (id: number): Promise<void> =>
      fetch(`${url}/${id}`, { method: "DELETE" }).then((r) => handleResponse<void>(r)),
  };
}

export const booksApi = createClient<Book>("books");
export const authorsApi = createClient<Author>("authors");
export const reviewsApi = createClient<Review>("reviews");