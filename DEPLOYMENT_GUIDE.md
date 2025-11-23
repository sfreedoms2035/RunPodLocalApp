# Deployment Guide: RunPod + SSH Tunneling

This guide details how to deploy the **RunPod AI Web App** on a RunPod GPU instance and access it securely from your local machine using SSH tunneling.

## Prerequisites

1.  **RunPod Account**: Create an account at [runpod.io](https://runpod.io) and add credits.
2.  **SSH Key Pair**: You need an SSH public key added to your RunPod account.
    - *Generate one if needed*: `ssh-keygen -t ed25519 -C "your_email@example.com"`
    - Copy the content of `~/.ssh/id_ed25519.pub` to RunPod Settings > SSH Public Keys.
3.  **Local Terminal**: PowerShell, Command Prompt, or Terminal (Mac/Linux).

## Step 1: Rent a GPU Pod

1.  Go to **RunPod Console** > **Pods** > **Deploy**.
2.  Select a GPU (e.g., **RTX 3090** or **RTX 4090** are good choices for LLMs and Image Gen).
3.  **Template**: Choose **RunPod PyTorch 2.x** (or similar with CUDA support).
4.  **Customize Deployment**:
    - **Container Image**: Default is usually fine.
    - **Expose HTTP Ports**: Not strictly necessary if using SSH tunnel, but you can add `8000,3000`.
    - **Environment Variables**: Add `HUGGING_FACE_HUB_TOKEN` if you plan to use gated models (like Llama 3).
5.  Click **Deploy**.

## Step 2: Connect via SSH

Once the Pod is **Running**:

1.  **Install System Dependencies** (Optional but recommended):
    ```bash
    apt-get update && apt-get install -y git
    ```

2.  **Clone the Repository**:
    ```bash
    git clone https://github.com/sfreedoms2035/RunPodLocalApp.git
    cd RunPodLocalApp
    ```

3.  **Install Backend Dependencies**:
    ```bash
    cd backend
    pip install -r requirements.txt
    ```

4.  **Install Frontend Dependencies**:
    Open a *new terminal tab* (or use `tmux`/`screen`), SSH in again, and run:
    ```bash
    # Install Node.js if not present (RunPod PyTorch templates usually have it, or install via nvm)
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs

    cd RunPodLocalApp/frontend
    npm install
    ```

## Step 4: Start the Application

You need to run both the backend and frontend.

1.  **Start Backend**:
    ```bash
    # In backend directory
    uvicorn main:app --host 0.0.0.0 --port 8000
    ```

2.  **Start Frontend**:
    ```bash
    # In frontend directory (new terminal)
    npm run dev -- --host
    ```
    *Note: `--host` is important to bind to 0.0.0.0 so the SSH tunnel can pick it up.*

## Step 5: Access the App

Open your **local browser** and navigate to:
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

## Direct Public Access (No SSH Tunnel)

If you prefer to access the app directly via the RunPod Public IP:

1.  **Edit Pod Configuration**:
    - In RunPod Console, stop the pod and click **Edit**.
    - Add **Port 5173** to the "Exposed TCP Ports" list.
    - Save and Start the pod.

2.  **Find the Public Port**:
    - Once running, expand the pod details.
    - Find the **Public IP** and the **External Port** that maps to internal port **5173**.
    - Example: `123.45.67.89:10234` -> `5173`.

3.  **Access in Browser**:
    - Open `http://<Public_IP>:<External_Port>` (e.g., `http://123.45.67.89:10234`).
    - The app is configured to proxy API requests internally, so you **do not** need to expose port 8000 externally.

## Troubleshooting

### "destination path 'RunPodLocalApp' already exists"
This means you already cloned the folder (perhaps when it was empty).
**Fix**: Remove the folder and clone again:
```bash
rm -rf RunPodLocalApp
git clone https://github.com/sfreedoms2035/RunPodLocalApp.git
```

### "cloned an empty repository"
This means the code wasn't pushed to GitHub yet.
**Fix**: We have now pushed the code. Just delete the folder and clone again as above.

