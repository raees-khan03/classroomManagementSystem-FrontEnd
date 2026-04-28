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
import { Class } from "@/types";
import { useTable } from "@refinedev/react-table";
import { ColumnDef } from "@tanstack/react-table";
import { Search } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { CreateButton } from "@/components/refine-ui/buttons/create";

const STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

const ClassList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const classTable = useTable<Class>({
    columns: useMemo<ColumnDef<Class>[]>(
      () => [
        {
          id: "bannerUrl",
          accessorKey: "bannerUrl",
          size: 80,
          header: () => <p className="column-title">Banner</p>,
          cell: ({ getValue }) => {
            const url = getValue<string | null>();
            return url ? (
              <img
                src={url}
                alt="Banner"
                className="h-18 w-18 object-contain rounded"
              />
            ) : (
              <div className="h-10 w-16 rounded bg-muted flex items-center justify-center text-muted-foreground text-xs">
                No img
              </div>
            );
          },
        },
        {
          id: "inviteCode",
          accessorKey: "inviteCode",
          size: 120,
          header: () => <p className="column-title mt-2">Invite Code</p>,
          cell: ({ getValue }) => <Badge>{getValue<string>()}</Badge>,
        },
        {
          id: "name",
          accessorKey: "name",
          size: 200,
          header: () => <p className="column-title">Name</p>,
          cell: ({ getValue }) => (
            <span className="text-foreground font-medium">
              {getValue<string>()}
            </span>
          ),
        },
        {
          id: "description",
          accessorKey: "description",
          size: 220,
          header: () => <p className="column-title">Description</p>,
          cell: ({ getValue }) => (
            <span className="truncate line-clamp-2">{getValue<string>()}</span>
          ),
        },
        {
          id: "capacity",
          accessorKey: "capacity",
          size: 90,
          header: () => <p className="column-title">Capacity</p>,
          cell: ({ getValue }) => (
            <span className="text-foreground">{getValue<number>()}</span>
          ),
        },
        {
          id: "status",
          accessorKey: "status",
          size: 100,
          header: () => <p className="column-title">Status</p>,
          cell: ({ getValue }) => {
            const value = getValue<string>();
            return (
              <Badge variant={value === "active" ? "default" : "secondary"}>
                {value}
              </Badge>
            );
          },
        },
      ],
      [],
    ),
    refineCoreProps: {
      resource: "classes",
      pagination: {
        pageSize: 10,
        mode: "server",
      },
      sorters: {
        initial: [{ field: "id", order: "desc" }],
      },
      queryOptions: {
        retry: false,
      },
    },
  });

  const { setFilters } = classTable.refineCore;

  useEffect(() => {
    setFilters([
      {
        field: "name",
        operator: "contains",
        value: debouncedSearch || undefined,
      },
      {
        field: "status",
        operator: "eq",
        value: selectedStatus === "all" ? undefined : selectedStatus,
      },
    ]);
  }, [debouncedSearch, selectedStatus]);

  return (
    <ListView>
      <Breadcrumb />
      <h1 className="page-title">Classes</h1>
      <div className="intro-row">
        <p>Manage and monitor all class sections</p>
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
            <Select
              value={selectedStatus}
              onValueChange={(value) => setSelectedStatus(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <CreateButton />
          </div>
        </div>
      </div>
      <DataTable table={classTable} />
    </ListView>
  );
};

export default ClassList;
