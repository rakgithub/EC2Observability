import { DescribeInstancesCommand } from "@aws-sdk/client-ec2";
import { ec2Client } from "../aws";

export interface InstanceData {
  id: string;
  region: string;
  type: string;
  launchTime: string;
}

function resolveRegion(): string {
  const region = ec2Client.config.region ?? process.env.AWS_REGION;
  return typeof region === "string"
    ? region
    : process.env.AWS_REGION ?? "us-east-1";
}

export async function getInstances(): Promise<{ instances: InstanceData[] }> {
  try {
    const command = new DescribeInstancesCommand({});
    const response = await ec2Client.send(command);

    const region = resolveRegion();

    const instances: InstanceData[] =
      response.Reservations?.flatMap(
        (r) =>
          r.Instances?.filter((i) => i.InstanceId).map((i) => ({
            id: i.InstanceId!,
            region,
            type: i.InstanceType ?? "unknown",
            launchTime: i.LaunchTime?.toISOString() ?? "",
          })) ?? []
      ) ?? [];

    return { instances };
  } catch (err) {
    console.error("Error fetching instances:", err);
    throw new Error(
      err instanceof Error ? err.message : "Failed to fetch instances"
    );
  }
}
