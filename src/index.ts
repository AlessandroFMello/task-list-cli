#!/usr/bin/env node

import { CLI } from "./cli.js";

async function main(): Promise<void> {
	try {
		const cli = new CLI();
		const parsedArgs = cli.parseArguments(process.argv);
		const output = await cli.routeCommand(parsedArgs);
		console.log(output);
		process.exit(0);
	} catch (error) {
		if (error instanceof Error) {
			console.error(`Error: ${error.message}`);
		} else {
			console.error(`Unexpected error: ${String(error)}`);
		}
		process.exit(1);
	}
}

main(); 