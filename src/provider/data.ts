// provider/data.ts
import {
  DataProvider,
  GetListParams,
  GetListResponse,
  BaseRecord,
} from "@refinedev/core";

const BASE_URL = "http://localhost:3000/api";

const dataProvider: DataProvider = {
  getList: async <TData extends BaseRecord = BaseRecord>({
    resource,
    pagination,
    filters,
  }: GetListParams): Promise<GetListResponse<TData>> => {
    const params = new URLSearchParams();

    console.log("Page:", pagination.currentPage);
    console.log("Filters:", filters);

    // ✅ Pagination
    const page = pagination?.currentPage ?? 1;
    const limit = pagination?.pageSize ?? 10;
    params.append("page", String(page));
    params.append("limit", String(limit));
    console.log("PAGE VALUE:", page);
    // ✅ Filters
    if (filters) {
      for (const filter of filters) {
        if (
          "field" in filter &&
          filter.value !== undefined &&
          filter.value !== null
        ) {
          if (filter.field === "name") {
            params.append("search", String(filter.value));
          }

          if (filter.field === "department") {
            params.append("department", String(filter.value));
          }
        }
      }
    }

    const response = await fetch(
      `${BASE_URL}/${resource}?${params.toString()}`,
    );
    const json = await response.json();
    console.log("Result", json);

    return {
      data: json.data as TData[],
      total: json.pagination.total,
    };
  },

  getOne: async () => {
    throw new Error("Not implemented");
  },
  create: async () => {
    throw new Error("Not implemented");
  },
  update: async () => {
    throw new Error("Not implemented");
  },
  deleteOne: async () => {
    throw new Error("Not implemented");
  },
};

export { dataProvider };
