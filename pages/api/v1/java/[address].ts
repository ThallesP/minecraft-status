import { status } from "minecraft-server-util";
import { NextApiRequest, NextApiResponse } from "next";

interface StatusErrorResponse {
  message: String;
  error: String;
  code: number;
}

function isValidAddress(domain: string): Boolean {
  const domainRegex = new RegExp(
    `^(?!-)[A-Za-z0-9-]+([\\-\\.]{1}[a-z0-9]+)*\\.[A-Za-z]{2,6}$`
  );

  const addressRegex = new RegExp(
    `^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$`
  );

  if (addressRegex || domainRegex) return true;

  return false;
}

function isValidPort(port: number): Boolean {
  if (isNaN(port)) return false;

  if (port > 65535) return false;

  return true;
}

function getMessageError(error?: any): StatusErrorResponse {
  let errorResponse: StatusErrorResponse = { code: 0, error: "", message: "" };

  if (!error) {
    errorResponse.code = 500;
    errorResponse.error = "unknown error";
    errorResponse.message =
      "I don't know that happened and I don't care for who knows.";
    return errorResponse;
  }

  if (error.code) {
    switch (error.code) {
      case "ENOTFOUND":
        errorResponse.code = 404;
        errorResponse.error = "server not found";
        errorResponse.message =
          "The domain or address for that server was not found.";
        break;
      case "ECONNREFUSED":
        errorResponse.code = 400;
        errorResponse.error = "server rejected";
        errorResponse.message = "The server rejected the connection.";
        break;
      default:
        errorResponse.code = 500;
        errorResponse.error = String(error);
        errorResponse.message = String(error);
        break;
    }
  }

  return errorResponse;
}

export async function Java(req: NextApiRequest, res: NextApiResponse) {
  let { address } = req.query;

  if (Array.isArray(address)) return;

  let [domain, port = 25565] = address.split(":");

  if (!isValidAddress(domain))
    return res.status(400).json({
      error: "invalid address",
      message: "The address informed is not valid.",
    });

  port = Number(port);

  if (!isValidPort(port))
    return res.status(400).json({
      error: "invalid port",
      message: "The port informed is not valid.",
    });

  try {
    const statusData = await status(`${domain}`, { port });
    statusData;
    return res.json(statusData);
  } catch (error) {
    const responseError = getMessageError(error);
    return res.json(responseError);
  }
}

export default Java;
