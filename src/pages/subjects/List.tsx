import { CreateButton } from "@/components/refine-ui/buttons/create";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { ListView } from "@/components/refine-ui/views/list-view";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEPARTMENT_OPTIONS } from "@/constants";
import { HttpError } from "@/provider/data";
import { Subject } from "@/types";
import { useNotification } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { ColumnDef } from "@tanstack/react-table";
import { Search } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

const SubjectList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  // ✅ Refine notification hook to show errors on UI
  const { open } = useNotification();

  // ✅ Debounce — 500ms after typing, debouncedSearch updates
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ✅ Removed handleTest useEffect — it was bypassing dataProvider
  //    and only logging to console, nothing surfaced to UI

  const subjectTable = useTable<Subject>({
    columns: useMemo<ColumnDef<Subject>[]>(
      () => [
        {
          id: "code",
          accessorKey: "code",
          size: 100,
          header: () => <p className="column-title mt-2">Code</p>,
          cell: ({ getValue }) => <Badge>{getValue<string>()}</Badge>,
        },
        {
          id: "name",
          accessorKey: "name",
          size: 200,
          header: () => <p className="column-title">Name</p>,
          cell: ({ getValue }) => (
            <span className="text-foreground">{getValue<string>()}</span>
          ),
        },
        {
          id: "department",
          accessorKey: "department",
          header: () => <p className="column-title">Department</p>,
          cell: ({ getValue }) => {
            const dept = getValue<{ name: string } | string>();
            return (
              <span className="text-foreground">
                {typeof dept === "object" ? dept?.name : dept}
              </span>
            );
          },
        },
        {
          id: "description",
          accessorKey: "description",
          size: 200,
          header: () => <p className="column-title">Description</p>,
          cell: ({ getValue }) => (
            <span className="truncate line-clamp-2">{getValue<string>()}</span>
          ),
        },
      ],
      [],
    ),
    refineCoreProps: {
      resource: "subjects",
      pagination: {
        pageSize: 10,
        mode: "server",
      },
      sorters: {
        initial: [{ field: "id", order: "desc" }],
      },
      // ✅ Handle errors from dataProvider and show them on UI
      queryOptions: {
        retry: false, // ✅ Don't retry on 429/403 — would just spam more blocked requests
        onError: (error: unknown) => {
          const httpError = error as HttpError;

          if (httpError.statusCode === 429) {
            open?.({
              type: "error",
              message: "Too Many Requests",
              description: httpError.message,
            });
          } else if (httpError.statusCode === 403) {
            open?.({
              type: "error",
              message: "Access Denied",
              description: httpError.message,
            });
          } else {
            open?.({
              type: "error",
              message: "Something went wrong",
              description: httpError.message ?? "Unexpected error occurred",
            });
          }
        },
      },
    },
  });

  const { setFilters } = subjectTable.refineCore;

  // ✅ Only re-runs when debouncedSearch or department changes
  useEffect(() => {
    setFilters([
      {
        field: "name",
        operator: "contains",
        value: debouncedSearch || undefined,
      },
      {
        field: "department",
        operator: "eq",
        value: selectedDepartment === "all" ? undefined : selectedDepartment,
      },
    ]);
  }, [debouncedSearch, selectedDepartment]);

  const handleDepartment = (value: string) => {
    setSelectedDepartment(value);
  };

  return (
    <ListView>
      <Breadcrumb />
      <h1 className="page-title">Subjects</h1>
      <div className="intro-row">
        <p>Quick access to essential metrices and management tools</p>
        <div className="actions-row">
          <div className="search-field">
            <Search className="search-icon" />
            <Input
              type="text"
              placeholder="Search by name..."
              className="pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Select value={selectedDepartment} onValueChange={handleDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {DEPARTMENT_OPTIONS.map((department) => (
                  <SelectItem key={department.value} value={department.value}>
                    {department.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <CreateButton />
          </div>
        </div>
      </div>
      <DataTable table={subjectTable} />
    </ListView>
  );
};

export default SubjectList;