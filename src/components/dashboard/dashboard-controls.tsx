"use client";

import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  quickFilter: string;
  onQuickFilterChange: (value: string) => void;
};

const quickFilters = [
  { id: "all", label: "All" },
  { id: "expiring", label: "Expiring soon" },
  { id: "submitted", label: "Submitted" },
  { id: "protected", label: "Password protected" },
];

export function DashboardControls({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortChange,
  quickFilter,
  onQuickFilterChange,
}: Props) {
  return (
    <div className="space-y-3.5 rounded-[26px] border border-white/10 bg-black/20 p-4 sm:space-y-4 sm:rounded-[30px] sm:p-6 backdrop-blur-xl">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by project, client, or code"
            className="pl-10"
          />
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2 xl:w-[420px]">
          <Select value={statusFilter} onChange={(event) => onStatusFilterChange(event.target.value)}>
            <option value="all">All statuses</option>
            <option value="awaiting_client">Awaiting client</option>
            <option value="in_progress">In progress</option>
            <option value="submitted">Submitted</option>
            <option value="expired">Expired</option>
          </Select>
          <Select value={sortBy} onChange={(event) => onSortChange(event.target.value)}>
            <option value="priority">Sort: Priority</option>
            <option value="expiry">Sort: Expiry</option>
            <option value="recent">Sort: Recent activity</option>
            <option value="name">Sort: Name</option>
          </Select>
        </div>
      </div>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 sm:pb-0">
        {quickFilters.map((filter) => {
          const active = quickFilter === filter.id;
          return (
            <Button
              key={filter.id}
              type="button"
              size="sm"
              variant={active ? "secondary" : "ghost"}
              className={active ? "min-w-max border border-amber-200/22 bg-amber-200/10 text-amber-100" : "min-w-max"}
              onClick={() => onQuickFilterChange(filter.id)}
            >
              {filter.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
