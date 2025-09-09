import { DescribeInstancesCommand } from "@aws-sdk/client-ec2";
import { ec2Client } from "../aws";

export async function getInstances() {
  try {
    const command = new DescribeInstancesCommand({});
    const response = await ec2Client.send(command);
    const instances =
      response.Reservations?.flatMap(
        (r) =>
          r.Instances?.map((i) => ({
            id: i.InstanceId || "",
            region: process.env.AWS_REGION || "us-east-1",
            type: i.InstanceType || "",
            launchTime: i.LaunchTime?.toISOString() || "",
          })) || []
      ) || [];
    debugger;
    return { instances };
  } catch (err) {
    console.error("Error fetching instances:", err);
    throw new Error("Failed to fetch instances");
  }
}
