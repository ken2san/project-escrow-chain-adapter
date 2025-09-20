// @ts-ignore
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("PointExchangeModule", (m) => {
	const pointExchange = m.contract("PointExchange");
	return { pointExchange };
});