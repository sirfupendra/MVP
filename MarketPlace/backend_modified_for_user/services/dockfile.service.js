import fs from "fs";
import path from "path";

// ✅ List of common built-in Python modules to ignore
const builtInModules = new Set([
  "sys", "os", "math", "time", "json", "re", "random", "datetime",
  "subprocess", "collections", "itertools", "functools", "argparse",
  "threading", "asyncio", "logging", "unittest", "enum", "typing",
  "shutil", "heapq", "string", "statistics", "pathlib", "glob",
  "copy", "traceback", "tempfile", "zipfile", "pickle", "sqlite3"
]);

function generateRequirementsFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");

    // ✅ Regex to catch different Python import styles
    const importRegex = /^\s*import\s+([a-zA-Z0-9_.,\s]+)/gm;
    const fromImportRegex = /^\s*from\s+([a-zA-Z0-9_.]+)\s+import\s+.+/gm;

    const dependencies = new Set();
    let match;

    // 🟢 Handle "import package1, package2"
    while ((match = importRegex.exec(content)) !== null) {
      const modules = match[1].split(",").map(m => m.trim().split(".")[0]);
      for (const mod of modules) {
        if (mod && !builtInModules.has(mod)) {
          dependencies.add(mod);
        }
      }
    }

    // 🟢 Handle "from package.subpackage import something"
    while ((match = fromImportRegex.exec(content)) !== null) {
      const mod = match[1].split(".")[0];
      if (mod && !builtInModules.has(mod)) {
        dependencies.add(mod);
      }
    }

    // 🧾 Write dependencies to requirements.txt
    const outputPath = path.join(process.cwd(), "requirements.txt");
    fs.writeFileSync(outputPath, [...dependencies].join("\n"), "utf8");

    console.log("✅ requirements.txt generated successfully with:");
  //  console.log([...dependencies]);

    // Return dependencies list so you can log or use it
    return [[...dependencies],outputPath];
  } catch (error) {
    console.error("❌ Error generating requirements.txt:", error);
    return [];
  }
}

async function generateDockerFile(requirements, filePath) {
  try {
    // 1️⃣ Determine output folder
    const projectDir = process.cwd();
    const dockerFilePath = path.join(projectDir, "Dockerfile");

    // 2️⃣ Get the uploaded file name (e.g., "model.py")
    const fileName = path.basename(filePath);

    // 3️⃣ Base image (Python lightweight image)
    const baseImage = "python:3.10-slim";

    // 4️⃣ Build Dockerfile content
    const dockerContent = `
# ----------------------------
# Auto-generated Dockerfile
# ----------------------------

# Use a lightweight Python image
FROM ${baseImage}

# Set working directory
WORKDIR /app

# Copy dependency file
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the user uploaded Python script
COPY ${fileName} .

# Set default command to run the uploaded script
CMD ["python", "${fileName}"]
`;

    // 5️⃣ Write the Dockerfile
    fs.writeFileSync(dockerFilePath, dockerContent.trim(), "utf8");

    console.log(`✅ Dockerfile generated successfully at ${dockerFilePath}`);

    return dockerFilePath;
  } catch (error) {
    console.error("❌ Error generating Dockerfile:", error);
    throw error;
  }
}





export { generateRequirementsFile, generateDockerFile };
