import { Table } from "@tanstack/react-table";
import InstanceRow from "./InstanceRow";
import { EC2Instance } from "@/types/ec2";

interface EC2TableBodyProps {
  table: Table<EC2Instance>;
}

export const EC2TableBody: React.FC<EC2TableBodyProps> = ({
  table,
}) => {
  const preprocessedInstances = table
    .getRowModel()
    .rows.map((row) => row.original);

  if (preprocessedInstances.length === 0) {
    return (
      <tbody>
        <tr>
          <td
            colSpan={table.getAllColumns().length}
            className="text-center py-6 text-gray-400 text-lg font-medium bg-gray-800"
          >
            No data available
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody>
      {table.getRowModel().rows.map((row) => (
        <InstanceRow
          key={row.original.id}
          instance={row.original}
          index={row.index}
        />
      ))}
    </tbody>
  );
};
