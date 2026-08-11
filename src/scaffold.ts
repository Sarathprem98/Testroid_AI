import fs from "fs-extra";
import path from "path";

export async function scaffoldProject(targetDir: string, answers: Record<string, any>) {
  const templateDir = path.join(__dirname, "..", "templates", "default");

  await fs.copy(templateDir, targetDir, { overwrite: false, errorOnExist: false });

  const envContent = [
  `PROJECT_NAME=${answers.projectName}`,
  `BASE_URL=${answers.baseUrl}`,
  `SUITE_TYPE=${answers.suiteType}`,
  `ENVIRONMENT=${answers.environment}`
].join("\n");

  await fs.writeFile(path.join(targetDir, ".env"), envContent);

  console.log(`✅ Testroid scaffolded into ${targetDir}`);
  console.log(`✅ .env created with your site config`);
}