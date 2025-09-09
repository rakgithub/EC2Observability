import { EC2Instance } from "@/types/ec2";
import InstanceRow from "./InstanceRow";

export const EC2TableColumns = [
  {
    Header: "Instance ID",
    accessor: "id",
  },
  {
    Header: "Region",
    accessor: "region",
    filter: "text",
  },
  {
    Header: "Type",
    accessor: "type",
    filter: "text",
  },
  {
    Header: "CPU %",
    accessor: "cpu",
  },
  {
    Header: "RAM %",
    accessor: "ram",
  },
  {
    Header: "Uptime (h)",
    accessor: "uptimeHours",
  },
  {
    Header: "Cost/hr",
    accessor: "costPerHour",
  },
  {
    Header: "Status",
    accessor: "status",
    Cell: ({ row }: { row: { original: EC2Instance; index: number } }) => (
      <InstanceRow
        instance={row.original}
        index={row.index}
        isWaste={(cpu, uptimeHours) =>
          cpu !== undefined &&
          uptimeHours !== undefined &&
          cpu < 15 &&
          uptimeHours < 24
        }
      />
    ),
  },
];
