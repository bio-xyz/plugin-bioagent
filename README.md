# BioAgent Plugin 🤖🧬

An Eliza plugin that transforms scientific papers into structured Knowledge Assets (KAs). These Knowledge Assets can then be integrated into an RDF triple store, such as [OriginTrail's DKG](https://origintrail.io/technology/decentralized-knowledge-graph) or [Oxigraph](https://github.com/oxigraph/oxigraph). 📄🔍🌐

## 🚀 How It Works

The BioAgent Plugin continuously monitors a designated Google Drive folder for newly added scientific documents. Once detected, these documents are automatically converted into structured Knowledge Assets and incorporated into a dynamic knowledge graph. An intelligent agent navigates this graph, systematically generating novel hypotheses. These hypotheses are subsequently evaluated and scored by the integrated JudgeLLM, using a rigorous and predefined rubric to ensure accuracy and relevance. By default, hypothesis generation and evaluation occur every 90 seconds, though the interval can be customized. 🔄🤖✨

## 🛠 Getting Started

Follow these steps to set up and run the BioAgent Plugin:

### 1. Install System Dependencies

Ensure you have the following dependencies installed on your system:

```bash
# For Ubuntu/Debian
sudo apt-get install ghostscript graphicsmagick
```

### 2. Clone the Repository

```bash
git clone https://github.com/bio-xyz/plugin-bioagent.git
cd plugin-bioagent
```

### 3. Install Project Dependencies

```bash
pnpm install
```

### 4. Start the Development Server

```bash
pnpm run dev
```

## 🔧 Setup Environment Variables

Copy and rename the example environment file:

```bash
mv .env.example .env
```

### Required Environment Variables

Update your `.env` file with the following variables:

```env
POSTGRES_URL=postgresql://user:password@localhost:5432/dbname
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
GCP_JSON_CREDENTIALS={"type": "service_account", "project_id": "your_project_id", ...}  # Your full GCP service account JSON
GOOGLE_DRIVE_FOLDER_ID=your_google_drive_folder_id  # Google Drive folder ID for scientific papers
DISCORD_APPLICATION_ID=your_discord_app_id
DISCORD_API_TOKEN=your_discord_bot_token
DISCORD_VOICE_CHANNEL_ID=your_voice_channel_id  # Optional
DISCORD_CHANNEL_ID=your_text_channel_id
BIONTOLOGY_KEY=your_biontology_api_key
```

## 📋 Obtaining Google Cloud Service Account JSON and Setting Permissions

### Creating Your Service Account

1. **Go to the [Google Cloud Console](https://console.cloud.google.com/).**
2. Select or create your project.
3. Navigate to **APIs & Services** > **Credentials**.
4. Click **+ CREATE CREDENTIALS**, then select **Service Account**.
5. Provide a descriptive name for your service account, then click **Create**.
6. Assign necessary roles (e.g., Editor), and click **Continue**.
7. Open your newly created service account and navigate to the **Keys** tab.
8. Select **Add Key** > **Create new key**, choose **JSON**, then click **Create**. The JSON file will automatically download.

### Granting Access to Google Drive Folder

1. Open your [Google Drive](https://drive.google.com/).
2. Navigate to the folder corresponding to the `GOOGLE_DRIVE_FOLDER_ID`.
3. Right-click on the folder and select **Share**.
4. Enter the service account email (found in the downloaded JSON file) into the share field.
5. Set permissions ("Editor" or "Viewer") accordingly, then click **Send**.

Your Google Cloud service account now has access to your specified folder. 📁🔑✅
