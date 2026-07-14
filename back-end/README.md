# Secure Docker Online Compiler & Judge API

This is the backend for the Online Compiler and Practice Judging system. It uses Node.js and Express to securely execute user code inside ephemeral Docker containers.

## Requirements
- Node.js (v18+)
- Docker Desktop (Must be running)

### Docker Installation for macOS Apple Silicon (M-series)
1. Download **Docker Desktop for Mac (Apple Silicon)** from [docker.com](https://docs.docker.com/desktop/mac/apple-silicon/).
2. Install the `.dmg` and drag Docker to Applications.
3. Open Docker Desktop and grant it necessary permissions (including privileged helper).
4. Verify installation by running `docker --version` in your terminal.

## Setup Instructions

1. **Install Dependencies:**
   ```bash
   cd taskintern-judge
   npm install
   ```

2. **Build the Docker Execution Environments:**
   This will build the lightweight, secure ARM64 images for Python, Java, and C++.
   ```bash
   docker-compose build
   ```

3. **Start the API Server:**
   ```bash
   npm run dev
   ```
   The server will start on `http://localhost:5000`.

## API Endpoints

### `POST /api/run`
Compiles and runs code with a custom `stdin`.
- **Body:** `{ language: "python", code: "print(input())", stdin: "hello" }`

### `POST /api/submit`
Compiles and runs code against predefined hidden testcases.
- **Body:** `{ language: "cpp", code: "...", questionId: "sort-1" }`

## Security Measures
- **Network Isolation:** `--network none`
- **Memory Limit:** 256MB hard cap.
- **CPU Limit:** Limited to 0.5 cores.
- **Time Limit:** Process is killed after 3 seconds.
- **Non-root:** Execution happens as `judgeuser` (UID 1000) inside the container.
