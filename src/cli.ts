#!/usr/bin/env node
import { Command } from "commander";
import { initCommand } from "./commands/init";

const program = new Command();

program
  .name("testroid")
  .description("Scaffold the Testroid AI test automation framework")
  .version("0.1.0");

program
  .command("init")
  .description("Initialize Testroid in the current folder")
  .action(initCommand);

program.parse();
