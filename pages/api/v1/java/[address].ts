import { NextApiRequest, NextApiResponse } from "next";
import getStatus from "minecraft-server-util";

const CACHE_CONTROL = "public, max-age=0, s-maxage=120, stale-while-revalidate";

async function Status(request: NextApiRequest, response: NextApiResponse) {
	const address = request.query.address;

	if (Array.isArray(address)) {
		response.status(401);
		return response.json({
			error: "invalid address type",
			message: "We currently does not support multi-params",
		});
	}

	const [ipAddress, port = 25565] = address.split(":");

	response.setHeader("Cache-Control", CACHE_CONTROL);

	try {
		const serverStatus = await getStatus.status(ipAddress, {
			port: Number(port),
		});

		return response.json(serverStatus);
	} catch (error) {
		response.status(404);
		return response.json({
			error: "server not found",
			message: "We couldn't find that server.",
		});
	}
}

export default Status;
