import { CreateResponse } from "@/types";
import {
  DataProvider,
  GetListParams,
  GetListResponse,
  CreateParams,
  CreateResponse as RefineCreateResponse,
  BaseRecord,
} from "@refinedev/core";

const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

class HttpError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

const buildHttpErrors = async (response: Response) => {
  let message = "Request failed";
  try {
    const payload = (await response.json()) as { message: string };
    if (payload.message) {
      message = payload.message;
    }
  } catch (err) {
    // JSON parsing failed — keep default message
  }
  return {
    message,
    statusCode: response.status,
  };
};

const dataProvider: DataProvider = {
  getList: async <TData extends BaseRecord = BaseRecord>({
    resource,
    pagination,
    filters,
  }: GetListParams): Promise<GetListResponse<TData>> => {
    const params = new URLSearchParams();

    const page =
      (pagination as any)?.current ?? (pagination as any)?.currentPage ?? 1;
    const limit = pagination?.pageSize ?? 10;
    params.append("page", String(page));
    params.append("limit", String(limit));

    if (filters) {
      for (const filter of filters) {
        if (
          "field" in filter &&
          filter.value !== undefined &&
          filter.value !== null
        ) {
          if (filter.field === "name") {
            params.append("search", String(filter.value));
          } else if (filter.field === "department") {
            params.append("department", String(filter.value));
          } else {
            // ✅ handles role and any other filters
            params.append(filter.field, String(filter.value));
          }
        }
      }
    }

    const response = await fetch(
      `${BASE_URL}/${resource}?${params.toString()}`,
    );

    if (!response.ok) {
      const error = await buildHttpErrors(response);
      throw new HttpError(error.message, error.statusCode);
    }

    const json = await response.json();

    return {
      data: json.data as TData[],
      total: json.pagination.total,
    };
  },

  // ✅ Fixed: create must be an async function, not an object
  create: async <TData extends BaseRecord = BaseRecord, TVariables = {}>({
    resource,
    variables,
  }: CreateParams<TVariables>): Promise<RefineCreateResponse<TData>> => {
    const response = await fetch(`${BASE_URL}/${resource}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(variables),
    });

    if (!response.ok) {
      const error = await buildHttpErrors(response);
      throw new HttpError(error.message, error.statusCode);
    }

    const json = await response.json();

    return {
      data: (json.data ?? json) as TData,
    };
  },

  // ✅ Required stubs — Refine needs these defined
  getOne: async () => {
    throw new Error("Not implemented");
  },
  update: async () => {
    throw new Error("Not implemented");
  },
  deleteOne: async () => {
    throw new Error("Not implemented");
  },
  getApiUrl: () => BASE_URL,
};

export { dataProvider, HttpError };
