import React from "react";
import { cn } from "@/lib/utils"; // Hỗ trợ merge className nếu có thư viện tiện ích

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

export const Table = ({ children, className, ...props }: TableProps) => {
  return (
    <div className="overflow-x-auto bg-white shadow-md rounded-lg">
      <table className={cn("w-full border-collapse", className)} {...props}>
        {children}
      </table>
    </div>
  );
};

export const TableHead = ({ children, className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => {
  return (
    <thead
      className={cn(
        "bg-gray-900 text-white uppercase text-sm font-semibold",
        className
      )}
      {...props}
    >
      {children}
    </thead>
  );
};

export const TableBody = ({ children, className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => {
  return (
    <tbody className={cn("divide-y divide-gray-200", className)} {...props}>
      {children}
    </tbody>
  );
};

export const TableRow = ({ children, className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => {
  return (
    <tr className={cn("hover:bg-gray-100 transition", className)} {...props}>
      {children}
    </tr>
  );
};

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  header?: boolean;
}

export const TableCell = ({ children, header, className, ...props }: TableCellProps) => {
  return header ? (
    <th
      className={cn(
        "px-6 py-3 text-left border-b border-gray-300",
        className
      )}
      {...props}
    >
      {children}
    </th>
  ) : (
    <td
      className={cn(
        "px-6 py-3 border-b border-gray-300",
        className
      )}
      {...props}
    >
      {children}
    </td>
  );
};
